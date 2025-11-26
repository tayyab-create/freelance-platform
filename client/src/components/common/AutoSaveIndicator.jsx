import React from 'react';
import { FiCheck, FiLoader, FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * Auto-save status indicator component
 *
 * @param {boolean} isSaving - Whether currently saving
 * @param {Date} lastSaved - Last saved timestamp
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} error - Error message if save failed
 * @param {string} className - Additional CSS classes
 */
const AutoSaveIndicator = ({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  error = null,
  className = '',
}) => {
  const formatLastSaved = (date) => {
    if (!date) return '';

    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleString();
  };

  const getContent = () => {
    if (error) {
      return {
        icon: FiAlertCircle,
        text: 'Save failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    }

    if (isSaving) {
      return {
        icon: FiLoader,
        text: 'Saving...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        animate: true,
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: FiClock,
        text: 'Unsaved changes',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    }

    if (lastSaved) {
      return {
        icon: FiCheck,
        text: `Saved ${formatLastSaved(lastSaved)}`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    }

    return null;
  };

  const content = getContent();

  if (!content) return null;

  const Icon = content.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${content.bgColor} ${className}`}
    >
      <Icon
        className={`w-4 h-4 ${content.color} ${
          content.animate ? 'animate-spin' : ''
        }`}
      />
      <span className={`text-sm font-medium ${content.color}`}>
        {content.text}
      </span>
    </div>
  );
};

export default AutoSaveIndicator;
