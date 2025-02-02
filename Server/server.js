const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PythonShell } = require("python-shell");
const cors = require("cors");
const debug = require("debug")("server");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["https://mouse-udux.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
});

// CORS middleware for Express
app.use(
  cors({
    origin: "https://mouse-udux.vercel.app",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Additional CORS headers middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://mouse-udux.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Store connected clients
let connectedSockets = {};

// Generate 4-digit connection code
let connectionCode = Math.floor(1000 + Math.random() * 9000);

// Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// Detailed health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve connection code
app.get("/code", (req, res) => {
  res.json({ code: connectionCode });
});

// Socket.IO error handling
io.on("connect_error", (error) => {
  console.error("Connection Error:", error);
});

io.on("error", (error) => {
  console.error("Socket.IO Error:", error);
});

// WebSocket connection handling
io.on("connection", (socket) => {
  debug(`🔌 Client connected: ${socket.id}`);
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle "join" event
  socket.on("join", (code) => {
    if (code == connectionCode) {
      connectedSockets[socket.id] = socket;
      debug(`✅ Mobile connected! (${socket.id})`);
      console.log(`✅ Mobile connected! (${socket.id})`);
      socket.emit("status", "connected");
    } else {
      debug(`❌ Wrong code from ${socket.id}: ${code}`);
      console.log(`❌ Wrong code from ${socket.id}: ${code}`);
      socket.emit("status", "wrong code");
    }
  });

  // Handle mouse movement
  socket.on("mouseMove", (data) => {
    debug(`🖱️ Mouse move: X=${data.x}, Y=${data.y}`);
    console.log(`🖱️ Mouse move: X=${data.x}, Y=${data.y}`);
    PythonShell.run(
      "mouse_control.py",
      { args: ["move", data.x, data.y] },
      (err) => {
        if (err) {
          debug("❌ Error in mouseMove:", err);
          console.error("❌ Error in mouseMove:", err);
        }
      }
    );
  });

  // Handle clicks
  socket.on("click", (type) => {
    debug(`🖱️ Click: ${type}`);
    console.log(`🖱️ Click: ${type}`);
    PythonShell.run("mouse_control.py", { args: ["click", type] }, (err) => {
      if (err) {
        debug("❌ Error in click:", err);
        console.error("❌ Error in click:", err);
      }
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    debug(`🔌 Client disconnected: ${socket.id}`);
    console.log(`🔌 Client disconnected: ${socket.id}`);
    delete connectedSockets[socket.id];
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Process error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  debug(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
});
