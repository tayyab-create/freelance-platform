const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const {
    saveOnboardingProgress,
    submitOnboarding,
    resubmitOnboarding,
    getOnboardingStatus
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Onboarding routes (protected)
router.put('/onboarding/save', protect, saveOnboardingProgress);
router.post('/onboarding/submit', protect, submitOnboarding);
router.post('/onboarding/resubmit', protect, resubmitOnboarding);
router.get('/onboarding/status', protect, getOnboardingStatus);

module.exports = router;