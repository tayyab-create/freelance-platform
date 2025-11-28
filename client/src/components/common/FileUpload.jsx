import React, { useRef, useState, useEffect } from 'react';
import { FiUpload, FiX, FiImage, FiFile, FiCheck } from 'react-icons/fi';
import Button from './Button';
import ProgressBar from './ProgressBar';

const FileUpload = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 10, // MB
  preview = false,
  currentImage = null,
  value = null,
  label = "Upload File",
  children,
  showProgress = true,
  uploadProgress = 0,
  isUploading = false,
  multiple = false,
  helperText,
  disabled = false,
  onRemove = null,
  loading = false,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    } else if (typeof value === 'string' && value.length > 0) {
      if (preview) {
        setPreviewUrl(value);
      } else {
        // For non-preview files (like PDFs), set a fake file object to show the name
        const fileName = value.split('/').pop() || 'Uploaded File';
        setSelectedFile({ name: fileName, size: 0 });
      }
    }
  }, [currentImage, value, preview]);

  const validateFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size should not exceed ${maxSize}MB`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    if (!files.length) return;

    if (multiple) {
      const validFiles = [];
      for (const file of files) {
        const fileError = validateFile(file);
        if (fileError) {
          setError(fileError);
          return;
        }
        validFiles.push(file);
      }
      setSelectedFiles(validFiles);
      if (onFileSelect) {
        onFileSelect(validFiles);
      }
    } else {
      const file = files[0];
      const fileError = validateFile(file);
      if (fileError) {
        setError(fileError);
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }

      // Call parent callback
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleRemove = (e, index = null) => {
    if (e) e.stopPropagation();

    if (multiple && index !== null) {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      if (onFileSelect) {
        onFileSelect(newFiles);
      }
      if (onRemove) {
        onRemove(index);
      }
    } else {
      setSelectedFile(null);
      setSelectedFiles([]);
      setPreviewUrl(currentImage);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onFileSelect) {
        onFileSelect(null);
      }
      if (onRemove) {
        onRemove();
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      const event = { target: { files } };
      handleFileChange(event);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      {label && !children && <label className="label">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
      />

      {children ? (
        <div
          onClick={handleClick}
          className={`cursor-pointer inline-block relative group ${disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {children}
        </div>
      ) : (
        <>
          {preview && previewUrl ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                />
                {selectedFile && !disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClick}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <FiUpload className="h-4 w-4" />
                  Replace Photo
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={handleClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {isDragging
                  ? 'Drop files here'
                  : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                {accept === 'image/*' ? 'Images only' : 'Any file type'} (max {maxSize}MB)
              </p>
            </div>
          )}

          {multiple && selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiFile className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, index)}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!multiple && selectedFile && !preview && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FiFile className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {showProgress && (isUploading || loading) && (
            <div className="space-y-2">
              <ProgressBar
                progress={uploadProgress}
                label={loading || isUploading ? "Uploading" : "Upload Complete"}
                color="primary"
                size="md"
              />
              {uploadProgress === 100 && !loading && !isUploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <FiCheck className="h-4 w-4" />
                  <span>Upload complete!</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;