import React from 'react';

const Textarea = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
    helperText,
    required = false,
    error = '',
    className = ''
}) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-slate-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-300' : 'border-slate-200'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm resize-none ${className}`}
            />
            {helperText && !error && (
                <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
            )}
            {error && (
                <p className="text-xs text-red-500 mt-1.5">{error}</p>
            )}
        </div>
    );
};

export default Textarea;
