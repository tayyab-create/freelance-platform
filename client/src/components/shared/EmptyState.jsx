import React from 'react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className = ''
}) => {
    return (
        <div className={`card text-center py-12 ${className}`}>
            {Icon && (
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-gray-400" />
                    </div>
                </div>
            )}

            {title && (
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {title}
                </h3>
            )}

            {description && (
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {description}
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="btn-primary"
                    >
                        {actionLabel}
                    </button>
                )}

                {secondaryActionLabel && onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className="btn-secondary"
                    >
                        {secondaryActionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;