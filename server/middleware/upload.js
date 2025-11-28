const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory structure exists
const createUploadDirectories = () => {
  const baseDir = './uploads';
  const subdirs = ['profiles', 'logos', 'submissions', 'documents', 'messages', 'general', 'company-video', 'company-logo', 'tax-documents'];

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  subdirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Initialize directories
createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get upload type from query parameter or body
    const type = req.query.type || req.body.type || 'general';
    const dir = path.join('./uploads', type);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName);
    const basename = path.basename(sanitizedName, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Comprehensive file filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/octet-stream',
    // Code files
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
  ];

  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|html|css|js|json|mp4|mov|avi|wmv|webm|mpeg)$/i;

  // Check MIME type and extension
  const mimeTypeAllowed = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimeTypeAllowed && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type "${file.mimetype}". Please upload a valid image, document, video, or archive file.`));
  }
};

// Create multer upload instance with different configurations
const createUploadMiddleware = (options = {}) => {
  const defaultOptions = {
    storage: storage,
    limits: {
      fileSize: options.maxSize || 10 * 1024 * 1024, // Default 10MB
      files: options.maxFiles || 10, // Default max 10 files
    },
    fileFilter: options.skipFilter ? undefined : fileFilter,
  };

  return multer(defaultOptions);
};

// Export default upload middleware
const upload = createUploadMiddleware();

// Export helper function to create custom upload middleware
module.exports = {
  upload,
  createUploadMiddleware,
  createUploadDirectories,
};
