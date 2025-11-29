import React from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import CharacterCounter from './CharacterCounter';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  success,
  disabled = false,
  icon: Icon,
  helperText,
  maxLength,
  showCharacterCount = false,
  autoComplete,
  className = '',
  inputClassName = '',
  iconClassName = '',
  ...props
}) => {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;
  const currentLength = value ? String(value).length : 0;

  const getBorderColor = () => {
    if (hasError) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    if (hasSuccess) return 'border-green-500 focus:ring-green-500 focus:border-green-500';
    return 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  };

  const StatusIcon = hasError ? FiAlertCircle : hasSuccess ? FiCheckCircle : null;
  const statusIconColor = hasError ? 'text-red-500' : 'text-green-500';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {showCharacterCount && maxLength && (
            <CharacterCounter current={currentLength} max={maxLength} />
          )}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${iconClassName || 'text-gray-400'}`} />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
          className={`input-field ${Icon ? 'pl-10' : ''} ${StatusIcon ? 'pr-10' : ''
            } ${getBorderColor()} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            } ${inputClassName}`}
          {...props}
        />
        {StatusIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <StatusIcon className={`h-5 w-5 ${statusIconColor}`} />
          </div>
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-start gap-1">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      {!hasError && !helperText && showCharacterCount && !maxLength && (
        <CharacterCounter current={currentLength} className="mt-1" />
      )}
    </div>
  );
};

export default Input;