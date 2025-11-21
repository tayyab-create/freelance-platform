const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addCertification,
  addExperience,
  applyForJob,
  getMyApplications,
  getAssignedJobs,
  submitWork,
  getDashboard,
  getMyReviews
} = require('../controllers/workerController');
const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes are protected and only accessible by workers
router.use(protect);
router.use(authorize('worker'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/certifications', checkApproval, addCertification);
router.post('/profile/experience', checkApproval, addExperience);

// Job-related routes
router.post('/apply/:jobId', checkApproval, applyForJob);
router.get('/applications', getMyApplications);
router.get('/jobs/assigned', checkApproval, getAssignedJobs);
router.post('/submit/:jobId', checkApproval, submitWork);

// Review routes
router.get('/reviews', getMyReviews);

// Dashboard
router.get('/dashboard', getDashboard);

module.exports = router;