const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: false, // Changed to false to allow messages with only attachments
    trim: true
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Emoji reactions
  reactions: [{
    emoji: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Edit tracking
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Read receipts (for future multi-user support)
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy read tracking (keep for backward compatibility)
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Starred by users
  starredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);