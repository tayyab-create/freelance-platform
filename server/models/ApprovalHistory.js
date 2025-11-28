const mongoose = require('mongoose');

const approvalHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['submitted', 'approved', 'rejected', 'resubmitted'],
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who performed the action (null for submissions)
    },
    reason: {
        type: String, // Rejection reason or admin notes
        default: ''
    },
    profileSnapshot: {
        type: mongoose.Schema.Types.Mixed, // Copy of profile data at time of action
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        profileCompleteness: {
            type: Number,
            min: 0,
            max: 100
        },
        ipAddress: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Index for faster queries
approvalHistorySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('ApprovalHistory', approvalHistorySchema);
