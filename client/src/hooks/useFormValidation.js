import { useState, useCallback, useEffect } from 'react';
import { validateField, validateForm, debounce } from '../utils/validation';

/**
 * Custom hook for form validation with real-time feedback
 *
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation rules for each field
 * @param {Object} options - Configuration options
 * @returns {Object} Form state and handlers
 */
export const useFormValidation = (
  initialValues = {},
  validationSchema = {},
  options = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    debounceDelay = 300,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((fieldName, value) => {
      if (!validationSchema[fieldName]) return;

      const result = validateField(value, validationSchema[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: result.error,
      }));
    }, debounceDelay),
    [validationSchema, debounceDelay]
  );

  // Validate single field
  const validateSingleField = useCallback(
    (fieldName, value) => {
      if (!validationSchema[fieldName]) return { isValid: true, error: '' };

      return validateField(value, validationSchema[fieldName]);
    },
    [validationSchema]
  );

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const result = validateForm(values, validationSchema);
    setErrors(result.errors);
    return result.isValid;
  }, [values, validationSchema]);

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked, files } = e.target;
      let fieldValue = value;

      if (type === 'checkbox') {
        fieldValue = checked;
      } else if (type === 'file') {
        fieldValue = files;
      }

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
      setIsDirty(true);

      // Clear error immediately on change
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }

      // Validate on change if enabled
      if (validateOnChange && touched[name]) {
        debouncedValidate(name, fieldValue);
      }
    },
    [validateOnChange, touched, errors, debouncedValidate]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        const result = validateSingleField(name, value);
        if (!result.isValid) {
          setErrors((prev) => ({
            ...prev,
            [name]: result.error,
          }));
        }
      }
    },
    [validateOnBlur, validateSingleField]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName, value) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  }, []);

  // Set multiple field values
  const setFieldsValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
    setIsDirty(true);
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Reset field
  const resetField = useCallback(
    (fieldName) => {
      setValues((prev) => ({
        ...prev,
        [fieldName]: initialValues[fieldName],
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setTouched((prev) => {
        const newTouched = { ...prev };
        delete newTouched[fieldName];
        return newTouched;
      });
    },
    [initialValues]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(validationSchema).reduce(
        (acc, fieldName) => ({
          ...acc,
          [fieldName]: true,
        }),
        {}
      );
      setTouched(allTouched);

      // Validate all fields
      const isValid = validateAllFields();

      if (!isValid) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
        setIsDirty(false);
      } catch (error) {
        // Handle submission error
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validationSchema, validateAllFields]
  );

  // Get field props helper
  const getFieldProps = useCallback(
    (fieldName) => ({
      name: fieldName,
      value: values[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[fieldName] ? errors[fieldName] : '',
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount) {
      validateAllFields();
    }
  }, [validateOnMount]); // Only run on mount

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 ||
                  Object.values(errors).every((error) => !error);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldsValues,
    resetForm,
    resetField,
    validateAllFields,
    getFieldProps,
  };
};

export default useFormValidation;
