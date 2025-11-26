const express = require('express');
const router = express.Router();

// Import controllers from their new locations
const profileController = require('../controllers/worker/profileController');
const applicationController = require('../controllers/worker/applicationController');
const jobController = require('../controllers/worker/jobController');
const dashboardController = require('../controllers/worker/dashboardController');
const reviewController = require('../controllers/worker/reviewController');

const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes are protected and only accessible by workers
router.use(protect);
router.use(authorize('worker'));

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/profile/certifications', checkApproval, profileController.addCertification);
router.put('/profile/certifications/:certId', checkApproval, profileController.updateCertification);
router.delete('/profile/certifications/:certId', checkApproval, profileController.deleteCertification);
router.post('/profile/experience', checkApproval, profileController.addExperience);
router.put('/profile/experience/:expId', checkApproval, profileController.updateExperience);
router.delete('/profile/experience/:expId', checkApproval, profileController.deleteExperience);

// Application routes
router.post('/apply/:jobId', checkApproval, applicationController.applyForJob);
router.get('/applications', applicationController.getMyApplications);

// Job routes
router.get('/jobs/assigned', checkApproval, jobController.getAssignedJobs);
router.post('/submit/:jobId', checkApproval, jobController.submitWork);

// Review routes
router.get('/reviews', reviewController.getMyReviews);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

module.exports = router;