const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, (req, res) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 10MB limit'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }

    // Handle other errors
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload file'
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file.'
      });
    }

    // Get upload type and construct file URL
    const type = req.query.type || req.body.type || 'general';
    const fileUrl = `/uploads/${type}/${req.file.filename}`;

    // Return success response
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
router.post('/multiple', protect, (req, res) => {
  const uploadMultiple = upload.array('files', 10);

  uploadMultiple(req, res, (err) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'One or more files exceed the 10MB limit'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }

    // Handle other errors
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload files'
      });
    }

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Get upload type and map file data
    const type = req.query.type || req.body.type || 'general';
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/${type}/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    // Return success response
    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      data: files
    });
  });
});

// @desc    Delete a file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:type/:filename', protect, (req, res) => {
  const { type, filename } = req.params;
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join('./uploads', type, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  try {
    // Delete the file
    fs.unlinkSync(filePath);
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;
