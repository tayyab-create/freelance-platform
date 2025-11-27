const express = require('express');
const router = express.Router();

// Import controllers from their new locations
const profileController = require('../controllers/company/profileController');
const jobController = require('../controllers/company/jobController');
const applicationController = require('../controllers/company/applicationController');
const submissionController = require('../controllers/company/submissionController');
const reviewController = require('../controllers/company/reviewController');
const dashboardController = require('../controllers/company/dashboardController');

const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes are protected and only accessible by companies
router.use(protect);
router.use(authorize('company'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);

// Job routes
router.post('/jobs', checkApproval, jobController.postJob);
router.get('/jobs', jobController.getMyJobs);
router.get('/jobs/:jobId/applications', checkApproval, applicationController.getJobApplications);
router.put('/jobs/:jobId/assign', checkApproval, applicationController.assignJob);
router.put('/jobs/:jobId/complete', checkApproval, submissionController.completeJob);
router.put('/jobs/:jobId/revision', checkApproval, submissionController.requestRevision);

// Submission routes
router.get('/submissions', checkApproval, submissionController.getSubmissions);

// Review routes
router.get('/reviews', reviewController.getMyReviews);
router.post('/review/:workerId', checkApproval, reviewController.reviewWorker);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

module.exports = router;