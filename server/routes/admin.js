const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPendingUsers,
  getAllUsers,
  getUserDetails,
  approveUser,
  rejectUser,
  toggleUserActive
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by admin
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/toggle-active', toggleUserActive);

module.exports = router;