const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
admin.initializeApp();

// Middleware, routes, etc.
app.get("/api/hello", (req, res) => {
  console.log("functions/index.js: Received request for /api/hello");
  res.send("Hello from Express on Firebase!");
});

// Create a server instance for Socket.IO
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow CORS for development, restrict this in production
    methods: ["GET", "POST"],
  },
});

// Initialize Socket.IO and handle connections
io.on("connection", (socket) => {
  console.log("functions/index.js: A user connected via Socket.IO");

  // Handle socket events
  socket.on("message", (data) => {
    console.log("functions/index.js: Received message via Socket.IO", data);
    io.emit("message", data); // Broadcast message to all connected clients
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("functions/index.js: A user disconnected");
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Export the Socket.IO setup as a separate Firebase Function
exports.socket = functions.https.onRequest((req, res) => {
  console.log("functions/index.js: Handling Socket.IO connection request");

  // Use server instance created for Socket.IO
  server.emit("request", req, res); // Forward the request
});
