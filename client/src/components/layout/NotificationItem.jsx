import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
    const iconClasses = "h-5 w-5";
    const wrapperClasses = "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm";

    switch (type) {
      case 'application':
        return (
          <div className={`${wrapperClasses} bg-blue-50`}>
            <BriefcaseIcon className={`${iconClasses} text-blue-600`} />
          </div>
        );
      case 'job':
        return (
          <div className={`${wrapperClasses} bg-green-50`}>
            <BriefcaseIcon className={`${iconClasses} text-green-600`} />
          </div>
        );
      case 'submission':
        return (
          <div className={`${wrapperClasses} bg-purple-50`}>
            <DocumentTextIcon className={`${iconClasses} text-purple-600`} />
          </div>
        );
      case 'review':
        return (
          <div className={`${wrapperClasses} bg-yellow-50`}>
            <StarIcon className={`${iconClasses} text-yellow-600`} />
          </div>
        );
      case 'message':
        return (
          <div className={`${wrapperClasses} bg-indigo-50`}>
            <ChatBubbleLeftIcon className={`${iconClasses} text-indigo-600`} />
          </div>
        );
      case 'system':
        return (
          <div className={`${wrapperClasses} bg-gray-50`}>
            <BellIcon className={`${iconClasses} text-gray-600`} />
          </div>
        );
      default:
        return (
          <div className={`${wrapperClasses} bg-gray-50`}>
            <BellIcon className={`${iconClasses} text-gray-600`} />
          </div>
        );
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

  const { user } = useSelector((state) => state.auth);

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Special handling for rejection notifications (backward compatibility)
    if (notification.type === 'system' &&
      (notification.title === 'Account Application Update' || notification.message.includes('not been approved'))) {
      if (user?.role === 'worker') {
        navigate('/worker/onboarding');
        onClose?.();
        return;
      } else if (user?.role === 'company') {
        navigate('/company/onboarding');
        onClose?.();
        return;
      }
    }

    // Special handling for approval notifications (backward compatibility)
    if (notification.type === 'system' &&
      (notification.title === 'Account Approved!' || notification.message.includes('approved'))) {
      if (user?.role === 'worker') {
        navigate('/worker/dashboard');
        onClose?.();
        return;
      } else if (user?.role === 'company') {
        navigate('/company/dashboard');
        onClose?.();
        return;
      }
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
      className={`group flex items-start gap-4 p-4 hover:bg-white/80 transition-all duration-300 cursor-pointer relative ${!notification.read ? 'bg-primary-50/30' : 'bg-transparent'
        }`}
    >
      {/* Unread indicator bar */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"></div>
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-gray-900 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Delete button */}
      <div className="flex items-start">
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-95"
          title="Delete notification"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
