const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PythonShell } = require("python-shell");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let connectionCode = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code
let connectedSockets = {};

app.use(cors());

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
    PythonShell.run("mouse_control.py", { args: ["move", data.x, data.y] });
  });

  socket.on("click", (type) => {
    PythonShell.run("mouse_control.py", { args: ["click", type] });
  });

  socket.on("disconnect", () => {
    delete connectedSockets[socket.id];
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
