import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import CharacterCounter from './CharacterCounter';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  disabled = false,
  helperText,
  maxLength,
  minLength,
  rows = 4,
  showCharacterCount = true,
  autoResize = false,
  className = '',
  textareaClassName = '',
}) => {
  const hasError = Boolean(error);
  const currentLength = value ? String(value).length : 0;

  const getBorderColor = () => {
    if (hasError) return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    return 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  };

  const handleChange = (e) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-start justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {showCharacterCount && maxLength && (
            <CharacterCounter current={currentLength} max={maxLength} />
          )}
        </label>
      )}
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
          className={`input-field resize-none ${getBorderColor()} ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
          } ${autoResize ? 'overflow-hidden' : 'overflow-auto'} ${textareaClassName}`}
          style={autoResize ? { minHeight: `${rows * 24}px` } : {}}
        />
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

export default Textarea;
