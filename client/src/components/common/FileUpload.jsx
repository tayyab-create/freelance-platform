import React, { useRef, useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import Button from './Button';

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*",
  maxSize = 5, // MB
  preview = false,
  currentImage = null,
  label = "Upload File"
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should not exceed ${maxSize}MB`);
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
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImage);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
          />
          {selectedFile && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          icon={preview ? FiImage : FiUpload}
          onClick={handleClick}
        >
          {selectedFile ? 'Change File' : 'Choose File'}
        </Button>
        
        {selectedFile && !preview && (
          <Button
            type="button"
            variant="danger"
            icon={FiX}
            onClick={handleRemove}
          >
            Remove
          </Button>
        )}
      </div>

      {selectedFile && !preview && (
        <p className="text-sm text-gray-600">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;