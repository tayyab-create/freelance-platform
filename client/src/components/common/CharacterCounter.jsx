import React from 'react';

/**
 * Character counter component for text inputs and textareas
 *
 * @param {number} current - Current character count
 * @param {number} max - Maximum allowed characters
 * @param {string} className - Additional CSS classes
 * @param {boolean} showPercentage - Show percentage instead of count
 */
const CharacterCounter = ({
  current = 0,
  max,
  className = '',
  showPercentage = false,
}) => {
  const percentage = max ? (current / max) * 100 : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;
  const remaining = max ? max - current : 0;

  const getColorClass = () => {
    if (isError) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const renderContent = () => {
    if (showPercentage) {
      return `${Math.round(percentage)}%`;
    }

    if (max) {
      return (
        <>
          <span className={getColorClass()}>{current}</span>
          <span className="text-gray-400"> / {max}</span>
          {isWarning && !isError && (
            <span className="ml-1 text-yellow-600">({remaining} left)</span>
          )}
          {isError && (
            <span className="ml-1 text-red-600">({Math.abs(remaining)} over)</span>
          )}
        </>
      );
    }

    return <span className="text-gray-500">{current} characters</span>;
  };

  return (
    <div className={`text-sm ${className}`}>
      {renderContent()}
    </div>
  );
};

export default CharacterCounter;
