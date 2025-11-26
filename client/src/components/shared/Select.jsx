import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Select = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  disabled = false,
  icon: Icon = null,
  ...props
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          backgroundImage: 'none', // Remove default arrow
        }}
        className={`
          w-full
          ${Icon ? 'pl-11' : 'pl-4'}
          pr-10
          py-3
          rounded-xl
          border border-gray-200
          bg-white
          text-sm font-semibold text-gray-700
          shadow-sm
          appearance-none
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
          [&>option]:py-3
          [&>option]:px-4
          [&>option]:text-sm
          [&>option]:font-medium
          [&>option]:text-gray-700
          [&>option]:bg-white
          [&>option:hover]:bg-primary-50
          [&>option:checked]:bg-primary-100
          [&>option:checked]:text-primary-700
          [&>option:checked]:font-bold
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="py-3 px-4"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <FiChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
      </div>
    </div>
  );
};

export default Select;
