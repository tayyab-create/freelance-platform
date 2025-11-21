const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Custom storage for better control
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get type from query parameter or body (more reliable)
    const type = req.query.type || req.body.type || 'general';
    const dir = path.join('./uploads', type);
    
    console.log('Upload type:', type);
    console.log('Upload directory:', dir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, (req, res, next) => {
  // Pass type through middleware
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const type = req.query.type || req.body.type || 'general';
    const fileUrl = `/uploads/${type}/${req.file.filename}`;

    console.log('File uploaded successfully:', fileUrl);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  });
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const type = req.query.type || req.body.type || 'general';
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/${type}/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: files
    });
  });
});

module.exports = router;