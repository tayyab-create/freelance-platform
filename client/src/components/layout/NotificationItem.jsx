import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead, deleteNotification } from '../../redux/slices/notificationSlice';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getIcon = (type) => {
    switch (type) {
      case 'application':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'job':
        return <BriefcaseIcon className="h-5 w-5 text-green-500" />;
      case 'submission':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'review':
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-indigo-500" />;
      case 'system':
        return <BellIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate to link if available
    if (notification.link) {
      navigate(notification.link);
      onClose?.();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteNotification(notification._id));
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread indicator and delete button */}
      <div className="flex items-start gap-2">
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Delete notification"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
