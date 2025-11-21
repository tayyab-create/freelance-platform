const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  salaryType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'intermediate'
  },
  status: {
    type: String,
    enum: ['posted', 'assigned', 'in-progress', 'submitted', 'completed', 'cancelled'],
    default: 'posted'
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedDate: {
    type: Date
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  requirements: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Job', jobSchema);