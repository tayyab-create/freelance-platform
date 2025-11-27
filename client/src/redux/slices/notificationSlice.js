import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.notificationAPI.getNotifications(filters);
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to fetch notifications');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.notificationAPI.getUnreadCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.notificationAPI.markAsRead(notificationId);
      return response.data.data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to mark as read');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.notificationAPI.markAllAsRead();
      showSuccessToast('All notifications marked as read');
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to mark all as read');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.notificationAPI.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to delete notification');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteAllReadNotifications = createAsyncThunk(
  'notifications/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.notificationAPI.deleteAllRead();
      showSuccessToast(response.data.message);
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to delete notifications');
      return rejectWithValue(error.response?.data);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    hasMore: true
  },
  reducers: {
    addNotification: (state, action) => {
      // Add new notification at the beginning
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.hasMore = action.payload.data.length === (action.meta.arg?.limit || 20);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications[index] = action.payload;
          if (wasUnread && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications.splice(index, 1);
          if (wasUnread && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })

      // Delete all read
      .addCase(deleteAllReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter(n => !n.read);
      });
  }
});

export const {
  addNotification,
  incrementUnreadCount,
  decrementUnreadCount,
  updateNotification,
  clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
