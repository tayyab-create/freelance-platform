import React from 'react';
import { FiCheck } from 'react-icons/fi';

const Checkbox = ({
    label,
    checked,
    onChange,
    name,
    disabled = false,
    className = '',
    description,
}) => {
    return (
        <label className={`group flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative flex items-center mt-0.5">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="peer sr-only" // Hide default checkbox
                />
                <div className={`
          w-5 h-5 rounded-md border-2 transition-all duration-200 ease-in-out flex items-center justify-center
          ${checked
                        ? 'bg-primary-600 border-primary-600 shadow-sm'
                        : 'bg-white border-gray-300 group-hover:border-primary-400'
                    }
          peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2
        `}>
                    <FiCheck
                        className={`
              w-3.5 h-3.5 text-white transform transition-transform duration-200
              ${checked ? 'scale-100' : 'scale-0'}
            `}
                        strokeWidth={3}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                {label && (
                    <span className={`text-sm font-medium transition-colors duration-200 ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
                        {label}
                    </span>
                )}
                {description && (
                    <span className="text-xs text-gray-500 mt-0.5">
                        {description}
                    </span>
                )}
            </div>
        </label>
    );
};

export default Checkbox;
