import React from 'react';

/**
 * Progress bar component for file uploads and other operations
 *
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {string} color - Color variant (primary, success, warning, error)
 * @param {boolean} showLabel - Show percentage label
 * @param {string} label - Custom label text
 * @param {boolean} animated - Animate the progress bar
 * @param {string} className - Additional CSS classes
 */
const ProgressBar = ({
  progress = 0,
  size = 'md',
  color = 'primary',
  showLabel = true,
  label = null,
  animated = true,
  className = '',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            colorClasses[color]
          } ${animated ? 'transition-all' : ''}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
