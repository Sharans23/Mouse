const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PythonShell } = require("python-shell");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://mouse-udux.vercel.app", // ✅ Allow frontend requests
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "https://mouse-udux.vercel.app", // ✅ Allow frontend requests
    methods: ["GET", "POST"],
  })
);


// Serve the connection code
app.get("/code", (req, res) => {
  res.json({ code: connectionCode });
});

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("join", (code) => {
    if (code == connectionCode) {
      connectedSockets[socket.id] = socket;
      console.log("Mobile connected!");
      socket.emit("status", "connected");
    } else {
      socket.emit("status", "wrong code");
    }
  });

  socket.on("mouseMove", (data) => {
    PythonShell.run(
      "mouse_control.py",
      { args: ["move", data.x, data.y] },
      (err) => {
        if (err) console.error("Error moving mouse:", err);
      }
    );
  });

  socket.on("click", (type) => {
    PythonShell.run("mouse_control.py", { args: ["click", type] }, (err) => {
      if (err) console.error("Error clicking mouse:", err);
    });
  });


  socket.on("disconnect", () => {
    delete connectedSockets[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
