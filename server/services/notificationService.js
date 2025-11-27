const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    this.io = null;
  }

  /**
   * Set Socket.io instance
   * @param {Object} io - Socket.io instance
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Create a new notification
   * @param {String} userId - Recipient user ID
   * @param {String} type - Notification type (application, job, submission, review, message, system)
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {String} link - Optional link to navigate to
   * @param {Object} metadata - Optional metadata (jobId, applicationId, etc.)
   * @returns {Promise<Notification>}
   */
  async createNotification(userId, type, title, message, link = null, metadata = {}) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        link,
        metadata
      });

      // Emit real-time notification via Socket.io
      if (this.io) {
        this.io.to(userId.toString()).emit('new_notification', {
          notification: notification.toJSON()
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param {String} userId - User ID
   * @param {Object} filters - Query filters (read, type, limit, skip)
   * @returns {Promise<Array>}
   */
  async getNotifications(userId, filters = {}) {
    try {
      const { read, type, limit = 20, skip = 0 } = filters;

      const query = { user: userId };

      if (read !== undefined) {
        query.read = read;
      }

      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   * @param {String} userId - User ID
   * @returns {Promise<Number>}
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        user: userId,
        read: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<Notification>}
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<Object>}
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteAllRead(userId) {
    try {
      const result = await Notification.deleteMany({
        user: userId,
        read: true
      });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (older than specified days)
   * @param {Number} days - Number of days
   * @returns {Promise<Object>}
   */
  async deleteOldNotifications(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
