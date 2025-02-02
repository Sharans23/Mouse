const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PythonShell } = require("python-shell");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ Use PORT from environment variable (Render requirement)
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "https://mouse-udux.vercel.app", // ✅ Add frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: "https://mouse-udux.vercel.app" })); // ✅ Allow CORS for API routes

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ Serve connection code
app.get("/code", (req, res) => {
  res.json({ code: connectionCode });
});

let connectionCode = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code
let connectedSockets = {};

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
    PythonShell.run("mouse_control.py", { args: ["move", data.x, data.y] });
  });

  socket.on("click", (type) => {
    PythonShell.run("mouse_control.py", { args: ["click", type] });
  });

  socket.on("disconnect", () => {
    delete connectedSockets[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
