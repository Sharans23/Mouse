const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PythonShell } = require("python-shell");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "https://mouse-udux.vercel.app", // ✅ Allow only frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Allow API calls from frontend
app.use(cors({ origin: "https://mouse-udux.vercel.app" }));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ Store connected clients
let connectedSockets = {};

// ✅ Generate 4-digit connection code
let connectionCode = Math.floor(1000 + Math.random() * 9000);

// 🔄 Auto-refresh connection code every 10 minutes (optional)
// setInterval(() => {
//   connectionCode = Math.floor(1000 + Math.random() * 9000);
//   console.log(`🔄 New connection code: ${connectionCode}`);
// }, 10 * 60 * 1000); // Refresh every 10 minutes

// ✅ Serve connection code
app.get("/code", (req, res) => {
  res.json({ code: connectionCode });
});

// ✅ WebSocket connection
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // 🎯 Handle "join" event
  socket.on("join", (code) => {
    if (code == connectionCode) {
      connectedSockets[socket.id] = socket;
      console.log(`✅ Mobile connected! (${socket.id})`);
      socket.emit("status", "connected");
    } else {
      console.log(`❌ Wrong code from ${socket.id}: ${code}`);
      socket.emit("status", "wrong code");
    }
  });

  // 🖱️ Handle mouse movement
  socket.on("mouseMove", (data) => {
    console.log(`🖱️ Mouse move: X=${data.x}, Y=${data.y}`);
    PythonShell.run(
      "mouse_control.py",
      { args: ["move", data.x, data.y] },
      (err) => {
        if (err) console.error("❌ Error in mouseMove:", err);
      }
    );
  });

  // 🖱️ Handle clicks
  socket.on("click", (type) => {
    console.log(`🖱️ Click: ${type}`);
    PythonShell.run("mouse_control.py", { args: ["click", type] }, (err) => {
      if (err) console.error("❌ Error in click:", err);
    });
  });

  // ❌ Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    delete connectedSockets[socket.id];
  });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
