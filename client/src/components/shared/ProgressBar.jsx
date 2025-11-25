import React from 'react';

const ProgressBar = ({
    percentage,
    label,
    color = 'primary', // 'primary', 'success', 'warning', 'danger', 'info'
    size = 'md', // 'sm', 'md', 'lg'
    showPercentage = true,
    showLabel = true,
    animate = true,
    className = ''
}) => {
    const colorClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    };

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    // Ensure percentage is between 0 and 100
    const validPercentage = Math.min(Math.max(percentage || 0, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {/* Label and Percentage */}
            {(showLabel || showPercentage) && (
                <div className="flex items-center justify-between mb-2">
                    {showLabel && label && (
                        <span className={`font-medium text-gray-700 ${textSizes[size]}`}>
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span className={`font-bold text-gray-900 ${textSizes[size]}`}>
                            {validPercentage}%
                        </span>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            rounded-full
            ${animate ? 'transition-all duration-500 ease-out' : ''}
            shadow-sm
          `}
                    style={{ width: `${validPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={validPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {/* Shimmer effect for active progress */}
                    {animate && validPercentage < 100 && (
                        <div className="h-full w-full opacity-30 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Segmented Progress Bar for multi-step processes
export const SegmentedProgressBar = ({
    steps,
    currentStep,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex gap-2">
                {steps.map((step, index) => {
                    const isActive = index < currentStep;
                    const isCurrent = index === currentStep - 1;

                    return (
                        <div
                            key={index}
                            className="flex-1"
                            title={step.label}
                        >
                            <div
                                className={`
                  ${sizeClasses[size]}
                  rounded-full
                  transition-all duration-300
                  ${isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                                        : isCurrent
                                            ? 'bg-primary-300'
                                            : 'bg-gray-200'
                                    }
                `}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Step labels */}
            <div className="flex justify-between mt-2">
                {steps.map((step, index) => (
                    <span
                        key={index}
                        className={`
              text-xs font-medium
              ${index < currentStep
                                ? 'text-primary-600'
                                : index === currentStep - 1
                                    ? 'text-primary-500'
                                    : 'text-gray-400'
                            }
            `}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;