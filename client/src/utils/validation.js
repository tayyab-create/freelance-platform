/**
 * Validation utilities for form fields
 * Provides reusable validation rules and functions
 */

// Validation rules
export const validationRules = {
  required: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    message: 'This field is required',
  }),

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: !value || emailRegex.test(value),
      message: 'Please enter a valid email address',
    };
  },

  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    message: `Must be at least ${min} characters`,
  }),

  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    message: `Must be no more than ${max} characters`,
  }),

  min: (min) => (value) => ({
    isValid: !value || Number(value) >= min,
    message: `Must be at least ${min}`,
  }),

  max: (max) => (value) => ({
    isValid: !value || Number(value) <= max,
    message: `Must be no more than ${max}`,
  }),

  url: (value) => {
    try {
      if (!value) return { isValid: true, message: '' };
      new URL(value);
      return { isValid: true, message: '' };
    } catch {
      return {
        isValid: false,
        message: 'Please enter a valid URL',
      };
    }
  },

  phone: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return {
      isValid: !value || (phoneRegex.test(value) && value.length >= 10),
      message: 'Please enter a valid phone number',
    };
  },

  password: (value) => {
    const hasMinLength = value && value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasMinLength) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters',
      };
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        isValid: false,
        message: 'Password must contain uppercase, lowercase, and number',
      };
    }

    return { isValid: true, message: '' };
  },

  matchField: (fieldName, compareValue) => (value) => ({
    isValid: !value || value === compareValue,
    message: `Must match ${fieldName}`,
  }),

  fileSize: (maxSizeMB) => (file) => {
    if (!file) return { isValid: true, message: '' };
    const maxBytes = maxSizeMB * 1024 * 1024;
    return {
      isValid: file.size <= maxBytes,
      message: `File size must be less than ${maxSizeMB}MB`,
    };
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return { isValid: true, message: '' };
    return {
      isValid: allowedTypes.includes(file.type),
      message: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  },

  array: (minItems = 0) => (value) => ({
    isValid: Array.isArray(value) && value.length >= minItems,
    message: minItems > 0 ? `At least ${minItems} item(s) required` : 'Must be an array',
  }),

  custom: (validatorFn, message) => (value) => ({
    isValid: validatorFn(value),
    message,
  }),
};

/**
 * Validates a single field value against multiple rules
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return { isValid: false, error: result.message };
    }
  }
  return { isValid: true, error: '' };
};

/**
 * Validates an entire form based on schema
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach((fieldName) => {
    const rules = schema[fieldName];
    const value = formData[fieldName];
    const result = validateField(value, rules);

    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Debounce function for async validation
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(func(...args)), delay);
    });
  };
};

/**
 * Creates a validation schema builder
 */
export class ValidationSchema {
  constructor() {
    this.schema = {};
  }

  field(name, ...rules) {
    this.schema[name] = rules;
    return this;
  }

  build() {
    return this.schema;
  }
}

// Pre-defined common schemas
export const commonSchemas = {
  email: [validationRules.required, validationRules.email],

  password: [validationRules.required, validationRules.password],

  name: [
    validationRules.required,
    validationRules.minLength(2),
    validationRules.maxLength(100),
  ],

  phone: [validationRules.phone],

  url: [validationRules.url],

  description: [
    validationRules.required,
    validationRules.minLength(20),
    validationRules.maxLength(5000),
  ],

  shortDescription: [
    validationRules.required,
    validationRules.minLength(10),
    validationRules.maxLength(500),
  ],

  title: [
    validationRules.required,
    validationRules.minLength(3),
    validationRules.maxLength(200),
  ],
};

export default {
  validationRules,
  validateField,
  validateForm,
  ValidationSchema,
  commonSchemas,
  debounce,
};
