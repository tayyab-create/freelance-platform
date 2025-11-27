import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  deleteAllReadNotifications
} from '../../redux/slices/notificationSlice';
import NotificationItem from './NotificationItem';
import { CheckIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationDropdown = ({ isOpen, onClose, isCollapsed = false }) => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications({ limit: 20 }));
    }
  }, [isOpen, dispatch]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteAllRead = () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      dispatch(deleteAllReadNotifications());
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Side Panel - Positioned next to sidebar with glassmorphic design */}
      <div
        className={`fixed top-0 bottom-0 w-96 bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-gray-100 z-[70] flex flex-col transition-all duration-300 ${isCollapsed ? 'left-24' : 'left-72'}`}
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white/50 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Stay updated with your activities</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white/80 rounded-2xl transition-all duration-300 active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-primary-500/10 active:scale-95"
              >
                <CheckIcon className="h-4 w-4" />
                Mark all read
              </button>
              <button
                onClick={handleDeleteAllRead}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-red-500/10 active:scale-95"
              >
                <TrashIcon className="h-4 w-4" />
                Clear read
              </button>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto flex-1 bg-transparent scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h4 className="text-gray-900 font-bold text-lg mb-1">No notifications</h4>
              <p className="text-gray-500 text-sm">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-white/50 to-transparent">
            <button
              onClick={() => {
                // You can navigate to a full notifications page here if needed
                onClose();
              }}
              className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-bold hover:bg-white/80 rounded-2xl transition-all duration-300 border border-gray-200 hover:shadow-md active:scale-95"
            >
              Close Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
