const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  githubProfile: {
    type: String,
    trim: true
  },
  linkedinProfile: {
    type: String,
    trim: true
  },
  certifications: [{
    title: {
      type: String,
      required: true
    },
    issuedBy: {
      type: String,
      required: true
    },
    issuedDate: {
      type: Date
    },
    certificateUrl: {
      type: String
    }
  }],
  experience: [{
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String
    }
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'not-available'],
    default: 'available'
  },
  totalJobsCompleted: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  savedSearches: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    filters: {
      search: { type: String, default: '' },
      category: { type: String, default: '' },
      experienceLevel: { type: String, default: '' },
      salaryMin: { type: String, default: '' },
      salaryMax: { type: String, default: '' },
      location: { type: String, default: '' },
      remoteOnly: { type: Boolean, default: false },
      sortBy: { type: String, default: 'newest' }
    },
    notifyOnNewMatches: {
      type: Boolean,
      default: true
    },
    lastNotified: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);