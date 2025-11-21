const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  postJob,
  getMyJobs,
  getJobApplications,
  assignJob,
  getSubmissions,
  completeJob,
  reviewWorker,
  getDashboard
} = require('../controllers/companyController');
const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes are protected and only accessible by companies
router.use(protect);
router.use(authorize('company'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Job routes
router.post('/jobs', checkApproval, postJob);
router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applications', checkApproval, getJobApplications);
router.put('/jobs/:jobId/assign', checkApproval, assignJob);
router.put('/jobs/:jobId/complete', checkApproval, completeJob);

// Submission routes
router.get('/submissions', checkApproval, getSubmissions);

// Review routes
router.post('/review/:workerId', checkApproval, reviewWorker);

// Dashboard
router.get('/dashboard', getDashboard);

module.exports = router;