const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const { User, Message } = require("./models");

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
// Apply JSON and URL-encoded parsers to all routes EXCEPT /api/upload
app.use((req, res, next) => {
  if (req.path.startsWith('/api/upload')) {
    // Skip body parsers for upload routes - let multer handle them
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/upload')) {
    // Skip body parsers for upload routes - let multer handle them
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

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
app.use("/api/notifications", require("./routes/notifications"));

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

  // Broadcast that user is online
  socket.broadcast.emit("user_online", { userId: socket.userId });

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

    // Also notify recipients for conversation list updates
    if (data.recipients && Array.isArray(data.recipients)) {
      data.recipients.forEach(userId => {
        io.to(userId).emit("conversation_updated", {
          conversationId: data.conversationId,
          lastMessage: data.message
        });
      });
    }
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

  // Handle message read receipts
  socket.on("message_read", async (data) => {
    // Update DB
    try {
      await Message.findByIdAndUpdate(data.messageId, {
        $set: { isRead: true, readAt: new Date() },
        $addToSet: {
          readBy: {
            userId: socket.userId,
            readAt: new Date()
          }
        }
      });
    } catch (e) {
      console.error("Error updating read receipt:", e);
    }

    socket.to(data.conversationId).emit("message_read", {
      messageId: data.messageId,
      conversationId: data.conversationId,
      userId: socket.userId
    });
  });

  // Handle notification read
  socket.on("notification_read", (data) => {
    console.log(`Notification ${data.notificationId} marked as read by ${socket.userId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    // Broadcast that user is offline
    socket.broadcast.emit("user_offline", { userId: socket.userId });
  });
});

// Make io accessible to routes
app.set("io", io);

// Initialize notification service with Socket.io
const notificationService = require('./services/notificationService');
notificationService.setSocketIO(io);

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

// Function to try starting server on a port
const startServer = (port, maxRetries = 5) => {
  server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    console.log(`API available at http://localhost:${port}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use`);

      if (maxRetries > 0) {
        const nextPort = port + 1;
        console.log(`Trying port ${nextPort}...`);
        server.close();
        setTimeout(() => {
          startServer(nextPort, maxRetries - 1);
        }, 1000);
      } else {
        console.error('Could not find an available port. Please free up port 5000 or set PORT in .env');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Start the server
startServer(PORT);
