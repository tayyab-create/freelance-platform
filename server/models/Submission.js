const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Submission description is required']
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  links: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'approved', 'rejected', 'revision-requested'],
    default: 'submitted'
  },
  feedback: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  revisionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);