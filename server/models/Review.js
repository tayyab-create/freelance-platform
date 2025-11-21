const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: 10,
    maxlength: 500
  },
  skills: [{
    type: String
  }],
  wouldHireAgain: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    enum: ['professional', 'quality-work', 'on-time', 'great-communication', 'creative', 'reliable']
  }]
}, {
  timestamps: true
});

// One review per job-worker combination
reviewSchema.index({ job: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);