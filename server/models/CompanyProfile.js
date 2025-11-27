const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  website: {
    type: String,
    trim: true
  },
  linkedinProfile: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactPerson: {
    name: String,
    position: String,
    email: String,
    phone: String
  },
  taxDocuments: [{
    documentName: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalJobsPosted: {
    type: Number,
    default: 0
  },
  totalJobsCompleted: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);