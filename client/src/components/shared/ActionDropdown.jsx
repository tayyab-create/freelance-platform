import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiMoreHorizontal } from 'react-icons/fi';

const ActionDropdown = ({
    actions = [],
    icon = 'vertical', // 'vertical', 'horizontal'
    position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    className = '',
    buttonClassName = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const IconComponent = icon === 'vertical' ? FiMoreVertical : FiMoreHorizontal;

    const positionClasses = {
        'bottom-right': 'top-full right-0 mt-2',
        'bottom-left': 'top-full left-0 mt-2',
        'top-right': 'bottom-full right-0 mb-2',
        'top-left': 'bottom-full left-0 mb-2'
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const handleActionClick = (action) => {
        if (!action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Dropdown Button */}
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`
          p-2 rounded-lg hover:bg-gray-100 transition-colors
          ${buttonClassName}
        `}
                aria-label="Actions menu"
                aria-expanded={isOpen}
            >
                <IconComponent className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`
            absolute z-50 min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-200
            ${positionClasses[position]}
            animate-fade-in
          `}
                >
                    <div className="py-2">
                        {actions.map((action, index) => {
                            const Icon = action.icon;

                            // Divider
                            if (action.divider) {
                                return <div key={index} className="my-2 border-t border-gray-200" />;
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(action);
                                    }}
                                    disabled={action.disabled}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                    transition-colors
                    ${action.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : action.variant === 'danger'
                                                ? 'text-red-600 hover:bg-red-50'
                                                : action.variant === 'warning'
                                                    ? 'text-yellow-600 hover:bg-yellow-50'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    {Icon && (
                                        <Icon className={`w-4 h-4 flex-shrink-0`} />
                                    )}
                                    <span className="flex-1 font-medium">{action.label}</span>
                                    {action.badge && (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 text-primary-700 rounded-full">
                                            {action.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionDropdown;