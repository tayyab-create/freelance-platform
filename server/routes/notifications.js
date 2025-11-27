const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get notifications and unread count
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// Mark as read
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

// Delete notifications
router.delete('/read', deleteAllRead);
router.delete('/:id', deleteNotification);

module.exports = router;
