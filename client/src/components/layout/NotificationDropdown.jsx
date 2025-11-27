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
        className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Side Panel - Positioned next to sidebar */}
      <div
        className={`fixed top-0 bottom-0 w-96 bg-white shadow-2xl border-r border-gray-200 z-[70] flex flex-col transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Stay updated with your activities</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                Mark all read
              </button>
              <button
                onClick={handleDeleteAllRead}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Clear read
              </button>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto flex-1 bg-gray-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
            <div className="divide-y divide-gray-100">
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
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => {
                // You can navigate to a full notifications page here if needed
                onClose();
              }}
              className="w-full py-2.5 text-sm text-gray-700 hover:text-gray-900 font-semibold hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
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
