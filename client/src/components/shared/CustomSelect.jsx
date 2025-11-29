import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  disabled = false,
  icon: Icon = null,
  name,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || null
  );
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected option when value changes
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);

    // Create a synthetic event to mimic native select behavior
    const syntheticEvent = {
      target: {
        name: name,
        value: option.value,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 pl-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {/* Hidden select for form compatibility */}
      <select
        name={name}
        value={value}
        onChange={() => { }}
        required={required}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative
          w-full
          ${Icon ? 'pl-11' : 'pl-4'}
          pr-10
          py-3
          rounded-xl
          border border-gray-200
          bg-white
          text-sm font-semibold
          ${selectedOption ? 'text-gray-700' : 'text-gray-400'}
          shadow-sm
          cursor-pointer
          transition-all duration-200
          hover:border-gray-300
          hover:shadow-md
          focus:border-primary-500
          focus:ring-2
          focus:ring-primary-200
          focus:outline-none
          disabled:bg-gray-50
          disabled:text-gray-400
          disabled:cursor-not-allowed
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-200' : ''}
          text-left
        `}
      >
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}

        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <FiChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = selectedOption?.value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-left
                    transition-all duration-150
                    flex items-center justify-between
                    ${isSelected
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <FiCheck className="w-4 h-4 text-primary-600 flex-shrink-0" />
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

export default CustomSelect;
