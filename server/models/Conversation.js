const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Pinned by users
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Archived by users
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Muted by users
  mutedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Ensure unique conversations between two users for a job
// Index removed to allow multiple conversations per job
// conversationSchema.index({ participants: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);