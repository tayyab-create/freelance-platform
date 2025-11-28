import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

const TagInput = ({
    label,
    value = [],
    onChange,
    placeholder = "Type and press Enter...",
    helperText,
    disabled = false,
    maxTags = 20
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const tag = inputValue.trim();
        if (!tag) return;

        if (value.includes(tag)) {
            setError('Tag already exists');
            return;
        }

        if (value.length >= maxTags) {
            setError(`Maximum ${maxTags} tags allowed`);
            return;
        }

        const newTags = [...value, tag];
        onChange(newTags);
        setInputValue('');
        setError('');
    };

    const removeTag = (index) => {
        const newTags = value.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag();
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-2.5 bg-white border rounded-xl transition-all outline-none
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }
                        ${disabled ? 'bg-gray-50 opacity-75 cursor-not-allowed' : ''}
                    `}
                />
                {inputValue.trim() && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            addTag();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                        title="Add Tag"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 animate-fadeIn hover:bg-gray-200 transition-colors"
                        >
                            {tag}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTag(index);
                                    }}
                                    className="ml-2 p-0.5 hover:bg-gray-300 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <FiX className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <FiX className="w-3 h-3" /> {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default TagInput;
