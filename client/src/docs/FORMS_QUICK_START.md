# Forms Quick Start Guide

Quick reference for using the enhanced form system.

## 🚀 Quick Setup

### 1. Basic Form with Validation

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidationSchema, validationRules } from '../utils/validation';
import Input from '../components/common/Input';

const MyForm = () => {
  // Define validation schema
  const schema = new ValidationSchema()
    .field('email', validationRules.required, validationRules.email)
    .field('password', validationRules.required, validationRules.password)
    .build();

  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    { email: '', password: '' },
    schema,
    { validateOnChange: true, validateOnBlur: true }
  );

  // Submit handler
  const onSubmit = async (data) => {
    await api.submit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : ''}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### 2. Form with Auto-save

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { useAutoSave } from '../hooks/useAutoSave';
import { useEffect } from 'react';

const DraftForm = () => {
  const { values, setFieldsValues, handleSubmit } = useFormValidation(
    { title: '', content: '' },
    schema
  );

  // Auto-save setup
  const {
    isSaving,
    lastSaved,
    hasSavedData,
    restoreFromStorage,
    clearSaved,
  } = useAutoSave('myFormDraft', values, {
    enabled: true,
    debounceDelay: 2000,
  });

  // Restore on mount
  useEffect(() => {
    if (hasSavedData) {
      const saved = restoreFromStorage();
      if (saved && window.confirm('Restore draft?')) {
        setFieldsValues(saved.data);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    await api.submit(data);
    clearSaved(); // Clear draft after submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AutoSaveIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
      {/* Form fields */}
    </form>
  );
};
```

### 3. Form with Unsaved Changes Warning

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChanges';

const MyForm = () => {
  const { values, isDirty, handleSubmit } = useFormValidation(
    initialValues,
    schema
  );

  // Warn before leaving
  useUnsavedChangesWarning(
    isDirty,
    'You have unsaved changes'
  );

  return <form>{/* Fields */}</form>;
};
```

### 4. File Upload with Progress

```jsx
import { useState } from 'react';
import FileUpload from '../components/common/FileUpload';

const UploadForm = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (file) => {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/upload', formData, {
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded * 100) / e.total));
      },
    });

    setUploading(false);
  };

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      accept="image/*"
      maxSize={5}
      showProgress
      uploadProgress={progress}
      isUploading={uploading}
      preview
    />
  );
};
```

## 📋 Common Validation Patterns

```jsx
import { ValidationSchema, validationRules } from '../utils/validation';

// Email
const emailSchema = new ValidationSchema()
  .field('email', validationRules.required, validationRules.email)
  .build();

// Password with confirmation
const passwordSchema = new ValidationSchema()
  .field('password', validationRules.required, validationRules.password)
  .field('confirmPassword', validationRules.required)
  .build();

// Text with length limits
const textSchema = new ValidationSchema()
  .field('title',
    validationRules.required,
    validationRules.minLength(10),
    validationRules.maxLength(200)
  )
  .build();

// Number range
const numberSchema = new ValidationSchema()
  .field('age',
    validationRules.required,
    validationRules.min(18),
    validationRules.max(100)
  )
  .build();

// URL validation
const urlSchema = new ValidationSchema()
  .field('website', validationRules.url)
  .build();

// Phone number
const phoneSchema = new ValidationSchema()
  .field('phone', validationRules.phone)
  .build();
```

## 🎨 Component Props Cheat Sheet

### Input

```jsx
<Input
  name="fieldName"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.field}           // Error message
  success={!errors.field}         // Success state
  helperText="Helper text"        // Helper below input
  maxLength={100}                 // Character limit
  showCharacterCount              // Show counter
  icon={FiIcon}                   // Icon component
  required                        // Required field
  disabled                        // Disable input
/>
```

### Textarea

```jsx
<Textarea
  name="fieldName"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.field}
  maxLength={500}
  showCharacterCount
  rows={6}
  autoResize                      // Auto-expand
  helperText="Helper text"
/>
```

### FileUpload

```jsx
<FileUpload
  onFileSelect={handleFile}
  accept="image/*"                // File types
  maxSize={5}                     // Max MB
  preview                         // Show preview
  showProgress                    // Show progress bar
  uploadProgress={75}             // Progress (0-100)
  isUploading={uploading}         // Upload state
  multiple                        // Multiple files
  disabled                        // Disable upload
  helperText="Max 5MB"
/>
```

## 🔧 Hook Return Values

### useFormValidation

```jsx
const {
  values,              // Form values object
  errors,              // Validation errors
  touched,             // Touched fields
  isDirty,             // Form modified
  isSubmitting,        // Submitting state
  isValid,             // All fields valid
  handleChange,        // Change handler
  handleBlur,          // Blur handler
  handleSubmit,        // Submit wrapper
  setFieldValue,       // Set single field
  setFieldsValues,     // Set multiple fields
  resetForm,           // Reset form
  getFieldProps,       // Get all props
} = useFormValidation(initialValues, schema, options);
```

### useAutoSave

```jsx
const {
  isSaving,            // Currently saving
  lastSaved,           // Last save timestamp
  hasUnsavedChanges,   // Unsaved changes exist
  hasSavedData,        // Data in storage
  restoreFromStorage,  // Restore function
  clearSaved,          // Clear storage
  forceSave,           // Save immediately
} = useAutoSave(key, data, options);
```

## ⚙️ Configuration Options

### useFormValidation Options

```jsx
{
  validateOnChange: true,    // Validate on change
  validateOnBlur: true,      // Validate on blur
  validateOnMount: false,    // Validate on mount
  debounceDelay: 300,        // Debounce delay (ms)
}
```

### useAutoSave Options

```jsx
{
  enabled: true,                    // Enable auto-save
  debounceDelay: 1000,              // Delay before save
  exclude: ['password'],            // Fields to exclude
  includeTimestamp: true,           // Add timestamp
  onSave: (data) => {},             // Save callback
  onRestore: (data) => {},          // Restore callback
}
```

## 📝 Validation Rules Quick Reference

```jsx
validationRules.required                          // Required field
validationRules.email                             // Email format
validationRules.password                          // Strong password
validationRules.minLength(10)                     // Min characters
validationRules.maxLength(200)                    // Max characters
validationRules.min(0)                            // Min number
validationRules.max(100)                          // Max number
validationRules.url                               // Valid URL
validationRules.phone                             // Phone number
validationRules.matchField('password', value)     // Match field
validationRules.fileSize(5)                       // Max file size (MB)
validationRules.fileType(['image/png'])           // File types
validationRules.array(2)                          // Min array items
validationRules.custom(fn, message)               // Custom rule
```

## 🎯 Common Patterns

### Dynamic Schema Based on Condition

```jsx
const buildSchema = (role) => {
  const schema = new ValidationSchema()
    .field('email', validationRules.required, validationRules.email);

  if (role === 'company') {
    schema.field('companyName', validationRules.required);
  } else {
    schema.field('fullName', validationRules.required);
  }

  return schema.build();
};
```

### Field-Level Validation

```jsx
<Input
  name="email"
  {...getFieldProps('email')}  // Spread all props
/>
```

### Conditional Error Display

```jsx
error={touched.field && errors.field ? errors.field : ''}
success={touched.field && !errors.field && values.field}
```

## 🚨 Common Pitfalls

❌ **Don't**: Validate on every keystroke without debounce
✅ **Do**: Use debounce delay (300ms+)

❌ **Don't**: Show errors before field is touched
✅ **Do**: Check `touched` state before showing errors

❌ **Don't**: Save passwords to localStorage
✅ **Do**: Use `exclude` option in auto-save

❌ **Don't**: Forget to clear drafts after submission
✅ **Do**: Call `clearSaved()` after successful submit

❌ **Don't**: Block form submission without user feedback
✅ **Do**: Show validation errors and disable submit button

## 📚 See Also

- [Complete Documentation](./FORM_IMPROVEMENTS.md)
- [PostJob Form Example](../pages/company/PostJob.jsx)
- [Register Form Example](../pages/auth/Register.jsx)
