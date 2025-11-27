const express = require('express');
const router = express.Router();

// Import controllers from their new locations
const profileController = require('../controllers/worker/profileController');
const applicationController = require('../controllers/worker/applicationController');
const jobController = require('../controllers/worker/jobController');
const dashboardController = require('../controllers/worker/dashboardController');
const reviewController = require('../controllers/worker/reviewController');
const savedSearchController = require('../controllers/worker/savedSearchController');

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
router.get('/jobs/assigned/:jobId', checkApproval, jobController.getAssignedJobById);
router.put('/jobs/:jobId/start', checkApproval, jobController.startJob);
router.post('/submit/:jobId', checkApproval, jobController.submitWork);
router.get('/submission/:jobId', checkApproval, jobController.getSubmission);

// Review routes
router.get('/reviews', reviewController.getMyReviews);
router.get('/jobs/:jobId/reviews', checkApproval, reviewController.getJobReviews);
router.post('/review/:companyId', checkApproval, reviewController.reviewCompany);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Saved Search routes
router.get('/saved-searches', savedSearchController.getSavedSearches);
router.post('/saved-searches', checkApproval, savedSearchController.createSavedSearch);
router.put('/saved-searches/:id', checkApproval, savedSearchController.updateSavedSearch);
router.delete('/saved-searches/:id', checkApproval, savedSearchController.deleteSavedSearch);
router.get('/saved-searches/:id/jobs', savedSearchController.getJobsForSavedSearch);

module.exports = router;