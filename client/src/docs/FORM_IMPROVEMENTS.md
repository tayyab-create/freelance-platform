# Form Experience & Validation Improvements

Complete documentation for the enhanced form system with real-time validation, auto-save, progress indicators, and unsaved changes guards.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Components](#components)
4. [Hooks](#hooks)
5. [Utilities](#utilities)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Overview

This form system provides a comprehensive solution for building forms with:

- ✅ **Real-time Validation**: Instant feedback as users type
- ✅ **Auto-save**: Automatic draft saving to localStorage
- ✅ **Progress Indicators**: Upload progress bars and character counters
- ✅ **Unsaved Changes Guard**: Warnings before leaving forms with unsaved data
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Clean Code**: Reusable hooks and utilities following DRY principles

---

## Features

### 1. Real-time Validation

**Location**: `client/src/hooks/useFormValidation.js`

Forms validate fields as users type (with debouncing) and on blur events, providing immediate feedback.

**Benefits**:
- Reduces form abandonment
- Improves user experience
- Prevents submission errors
- Provides clear error messages

### 2. Auto-save

**Location**: `client/src/hooks/useAutoSave.js`

Automatically saves form data to localStorage with configurable debounce delays.

**Benefits**:
- Prevents data loss on accidental navigation
- Restores drafts on page refresh
- Saves before browser/tab close
- Configurable exclude fields (e.g., passwords)

### 3. Progress Indicators

**Components**:
- `CharacterCounter.jsx` - Shows character count with limits
- `ProgressBar.jsx` - Upload progress visualization
- `AutoSaveIndicator.jsx` - Auto-save status display

**Benefits**:
- Visual feedback during uploads
- Character limit awareness
- Save status transparency

### 4. Unsaved Changes Guard

**Location**: `client/src/hooks/useUnsavedChanges.js`

Warns users before navigating away from dirty forms.

**Benefits**:
- Prevents accidental data loss
- Browser beforeunload event handling
- React Router navigation blocking
- Customizable warning messages

---

## Components

### Input Component

**Location**: `client/src/components/common/Input.jsx`

Enhanced input with validation states, character counting, and icons.

```jsx
<Input
  name="title"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.title}
  success={!errors.title && value}
  maxLength={200}
  showCharacterCount
  helperText="Enter a descriptive title"
  icon={FiUser}
  required
/>
```

**Props**:
- `error` - Error message (string)
- `success` - Success state indicator (boolean)
- `helperText` - Helper text below input
- `maxLength` - Maximum character limit
- `showCharacterCount` - Display character counter
- `icon` - Icon component (react-icons)

### Textarea Component

**Location**: `client/src/components/common/Textarea.jsx`

Textarea with auto-resize, character counting, and validation.

```jsx
<Textarea
  name="description"
  value={value}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.description}
  maxLength={5000}
  showCharacterCount
  rows={6}
  autoResize
  helperText="Provide detailed information"
/>
```

**Props**:
- `autoResize` - Auto-expand based on content
- `rows` - Initial number of rows
- `maxLength` - Character limit
- `showCharacterCount` - Display counter
- All standard textarea attributes

### FileUpload Component

**Location**: `client/src/components/common/FileUpload.jsx`

Enhanced file upload with drag-and-drop, progress bars, and multiple file support.

```jsx
<FileUpload
  onFileSelect={handleFileSelect}
  accept="image/*"
  maxSize={5}
  preview
  showProgress
  uploadProgress={progress}
  isUploading={uploading}
  multiple
  helperText="Max 5MB per file"
/>
```

**Props**:
- `showProgress` - Display upload progress
- `uploadProgress` - Progress value (0-100)
- `isUploading` - Upload in progress
- `multiple` - Allow multiple files
- `preview` - Show image preview
- `disabled` - Disable interactions
- Drag and drop support built-in

### Progress Components

#### CharacterCounter

```jsx
<CharacterCounter
  current={150}
  max={200}
  showPercentage={false}
/>
```

#### ProgressBar

```jsx
<ProgressBar
  progress={75}
  color="primary"
  size="md"
  showLabel
  label="Uploading"
  animated
/>
```

#### AutoSaveIndicator

```jsx
<AutoSaveIndicator
  isSaving={isSaving}
  lastSaved={lastSaved}
  hasUnsavedChanges={hasChanges}
/>
```

### UnsavedChangesModal

**Location**: `client/src/components/common/UnsavedChangesModal.jsx`

Confirmation modal for unsaved changes.

```jsx
<UnsavedChangesModal
  isOpen={showModal}
  onConfirm={handleLeave}
  onCancel={handleStay}
  title="Unsaved Changes"
  message="You have unsaved changes. Leave anyway?"
/>
```

---

## Hooks

### useFormValidation

**Location**: `client/src/hooks/useFormValidation.js`

Comprehensive form validation with real-time feedback.

```jsx
const {
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
  setFieldsValues,
  resetForm,
  getFieldProps,
} = useFormValidation(
  initialValues,
  validationSchema,
  {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    debounceDelay: 300,
  }
);
```

**Parameters**:
- `initialValues` - Initial form values object
- `validationSchema` - Validation rules object
- `options` - Configuration object

**Returns**:
- `values` - Current form values
- `errors` - Validation errors object
- `touched` - Touched fields object
- `isDirty` - Form has changed
- `isSubmitting` - Submission in progress
- `isValid` - All fields valid
- `handleChange` - Change event handler
- `handleBlur` - Blur event handler
- `handleSubmit` - Submit wrapper function
- `setFieldValue` - Set single field
- `setFieldsValues` - Set multiple fields
- `resetForm` - Reset to initial state
- `getFieldProps` - Get all props for field

### useAutoSave

**Location**: `client/src/hooks/useAutoSave.js`

Automatic form draft saving to localStorage.

```jsx
const {
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  hasSavedData,
  restoreFromStorage,
  clearSaved,
  forceSave,
} = useAutoSave('uniqueKey', formData, {
  enabled: true,
  debounceDelay: 1000,
  exclude: ['password'],
  includeTimestamp: true,
  onSave: (data) => console.log('Saved', data),
  onRestore: (data) => console.log('Restored', data),
});
```

**Parameters**:
- `key` - Unique localStorage key
- `data` - Data to save
- `options` - Configuration options

**Returns**:
- `isSaving` - Save operation in progress
- `lastSaved` - Last save timestamp
- `hasUnsavedChanges` - Unsaved changes exist
- `hasSavedData` - Saved data exists in storage
- `restoreFromStorage` - Restore saved data
- `clearSaved` - Clear saved data
- `forceSave` - Save immediately

### useUnsavedChanges

**Location**: `client/src/hooks/useUnsavedChanges.js`

Guard against navigation with unsaved changes.

```jsx
const {
  isBlocking,
  confirmNavigation,
  cancelNavigation,
  navigateWithConfirmation,
} = useUnsavedChanges(isDirty, {
  message: 'Leave without saving?',
  enabled: true,
});
```

**For simple browser warning**:

```jsx
useUnsavedChangesWarning(isDirty, 'You have unsaved changes');
```

---

## Utilities

### Validation Rules

**Location**: `client/src/utils/validation.js`

Pre-built validation rules for common scenarios.

#### Available Rules

```javascript
import { validationRules } from '../utils/validation';

// Required field
validationRules.required

// Email validation
validationRules.email

// String length
validationRules.minLength(10)
validationRules.maxLength(200)

// Number range
validationRules.min(0)
validationRules.max(1000)

// URL validation
validationRules.url

// Phone number
validationRules.phone

// Password strength
validationRules.password

// Field matching
validationRules.matchField('password', passwordValue)

// File validation
validationRules.fileSize(5) // 5MB
validationRules.fileType(['image/png', 'image/jpeg'])

// Array validation
validationRules.array(2) // Min 2 items

// Custom validation
validationRules.custom(
  (value) => value.includes('@'),
  'Must contain @'
)
```

### ValidationSchema Builder

Create validation schemas easily:

```javascript
import { ValidationSchema, validationRules } from '../utils/validation';

const schema = new ValidationSchema()
  .field('email', validationRules.required, validationRules.email)
  .field('password', validationRules.required, validationRules.password)
  .field('name', validationRules.required, validationRules.minLength(2))
  .build();
```

### Common Schemas

Pre-defined schemas for common fields:

```javascript
import { commonSchemas } from '../utils/validation';

// Use pre-built schemas
const emailRules = commonSchemas.email;
const passwordRules = commonSchemas.password;
const nameRules = commonSchemas.name;
const phoneRules = commonSchemas.phone;
const urlRules = commonSchemas.url;
const descriptionRules = commonSchemas.description;
const titleRules = commonSchemas.title;
```

---

## Usage Examples

### Example 1: Simple Form with Validation

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidationSchema, validationRules } from '../utils/validation';
import Input from '../components/common/Input';

const ContactForm = () => {
  const schema = new ValidationSchema()
    .field('name', validationRules.required, validationRules.minLength(2))
    .field('email', validationRules.required, validationRules.email)
    .field('message', validationRules.required, validationRules.minLength(20))
    .build();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({ name: '', email: '', message: '' }, schema);

  const onSubmit = async (data) => {
    await api.sendMessage(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : ''}
        placeholder="Your name"
      />
      <Input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : ''}
        placeholder="Your email"
      />
      <button type="submit">Send</button>
    </form>
  );
};
```

### Example 2: Form with Auto-save

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { useAutoSave } from '../hooks/useAutoSave';
import { useEffect } from 'react';

const DraftForm = () => {
  const { values, handleChange, setFieldsValues } = useFormValidation(
    { title: '', content: '' },
    {}
  );

  const { restoreFromStorage, clearSaved } = useAutoSave(
    'articleDraft',
    values,
    { debounceDelay: 2000 }
  );

  useEffect(() => {
    const saved = restoreFromStorage();
    if (saved) {
      setFieldsValues(saved.data);
    }
  }, []);

  const handlePublish = async () => {
    await api.publish(values);
    clearSaved(); // Clear draft after publishing
  };

  return <form>{/* Form fields */}</form>;
};
```

### Example 3: Form with Unsaved Changes Guard

```jsx
import { useFormValidation } from '../hooks/useFormValidation';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChanges';

const ProfileForm = () => {
  const { values, isDirty, handleSubmit } = useFormValidation(
    initialValues,
    schema
  );

  useUnsavedChangesWarning(
    isDirty,
    'You have unsaved profile changes'
  );

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Fields */}</form>;
};
```

### Example 4: File Upload with Progress

```jsx
import { useState } from 'react';
import FileUpload from '../components/common/FileUpload';
import { uploadAPI } from '../services/api';

const ImageUploadForm = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    setUploading(true);

    try {
      await uploadAPI.uploadSingle(file, 'profiles', {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <FileUpload
      onFileSelect={handleUpload}
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

---

## Best Practices

### 1. Validation

- ✅ Use real-time validation for immediate feedback
- ✅ Only show errors after field is touched
- ✅ Provide helpful error messages
- ✅ Use success states to encourage users
- ✅ Disable submit button until form is valid

### 2. Auto-save

- ✅ Use reasonable debounce delays (1-2 seconds)
- ✅ Exclude sensitive fields (passwords)
- ✅ Clear drafts after successful submission
- ✅ Prompt users to restore drafts
- ✅ Include timestamps for context

### 3. User Experience

- ✅ Show character counters for limited fields
- ✅ Display upload progress for files
- ✅ Warn before discarding changes
- ✅ Provide helper text for complex fields
- ✅ Use icons for visual guidance

### 4. Accessibility

- ✅ Use ARIA labels and descriptions
- ✅ Associate errors with fields
- ✅ Ensure keyboard navigation works
- ✅ Provide clear focus indicators
- ✅ Use semantic HTML

### 5. Performance

- ✅ Debounce validation to reduce computations
- ✅ Throttle auto-save operations
- ✅ Avoid unnecessary re-renders
- ✅ Use React.memo for heavy components
- ✅ Lazy load large forms

### 6. Code Organization

- ✅ Separate validation logic from components
- ✅ Reuse validation schemas
- ✅ Create custom hooks for complex forms
- ✅ Keep components focused and small
- ✅ Document complex validation rules

---

## Migration Guide

### From Old Pattern to New Pattern

**Before** (Manual validation):

```jsx
const [formData, setFormData] = useState({ email: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = {};
  if (!formData.email) newErrors.email = 'Required';
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  // Submit
};
```

**After** (Using hooks):

```jsx
const schema = new ValidationSchema()
  .field('email', validationRules.required, validationRules.email)
  .build();

const { values, errors, handleChange, handleSubmit } = useFormValidation(
  { email: '' },
  schema
);

const onSubmit = async (data) => {
  // Submit
};

// In JSX: handleSubmit(onSubmit)
```

---

## Troubleshooting

### Common Issues

**1. Validation not triggering**
- Check `validateOnChange` and `validateOnBlur` options
- Ensure validation schema is correctly defined
- Verify field names match between schema and form

**2. Auto-save not working**
- Check localStorage is available
- Verify unique key is provided
- Ensure `enabled` option is true
- Check browser console for errors

**3. Unsaved changes warning not showing**
- Verify `isDirty` is true
- Check `useUnsavedChanges` is called with correct params
- Ensure navigation is happening via React Router

**4. Progress bar not updating**
- Check `uploadProgress` prop is updating
- Verify `showProgress` is true
- Ensure `isUploading` state is managed

---

## File Structure

```
client/src/
├── components/
│   └── common/
│       ├── Input.jsx                    (Enhanced input)
│       ├── Textarea.jsx                 (Textarea with counter)
│       ├── FileUpload.jsx               (Upload with progress)
│       ├── CharacterCounter.jsx         (Character counter)
│       ├── ProgressBar.jsx              (Progress bar)
│       ├── AutoSaveIndicator.jsx        (Save status)
│       └── UnsavedChangesModal.jsx      (Confirmation modal)
├── hooks/
│   ├── useFormValidation.js             (Form validation hook)
│   ├── useAutoSave.js                   (Auto-save hook)
│   └── useUnsavedChanges.js             (Navigation guard)
├── utils/
│   └── validation.js                    (Validation utilities)
└── docs/
    └── FORM_IMPROVEMENTS.md             (This file)
```

---

## Further Reading

- [React Hook Form Docs](https://react-hook-form.com/) - Similar library
- [Formik Docs](https://formik.org/) - Alternative approach
- [WCAG Form Guidelines](https://www.w3.org/WAI/tutorials/forms/) - Accessibility
- [Form Design Best Practices](https://www.nngroup.com/articles/web-form-design/) - UX patterns

---

## Support

For questions or issues:
1. Check this documentation
2. Review the implementation in example forms (PostJob, Register)
3. Check the component source code
4. Create an issue in the project repository

---

**Last Updated**: 2025-01-26
**Version**: 1.0.0
