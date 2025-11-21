const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const { User } = require("./models");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Freelance Platform API is running..." });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/workers", require("./routes/workers"));
app.use("/api/companies", require("./routes/companies"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/messages", require("./routes/messages"));

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user's personal room
  socket.join(socket.userId);

  // Join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle new message - FIXED VERSION
  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    // Broadcast to ALL users in the conversation room (including sender)
    io.to(data.conversationId).emit("new_message", data.message);
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user_typing", {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.conversationId).emit("user_stop_typing", {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Make io accessible to routes
app.set("io", io);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
