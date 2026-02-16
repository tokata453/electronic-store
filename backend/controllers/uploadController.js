// controllers/uploadController.js
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on file type
    let uploadPath = 'public/uploads/';
    
    if (file.fieldname === 'productImage') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'categoryImage') {
      uploadPath += 'categories/';
    } else if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else {
      uploadPath += 'temp/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * @desc    Upload single image
 * @route   POST /api/upload/image
 * @access  Private/Admin
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      return next(error);
    }

    // Return file URL
    const fileUrl = `/uploads/${req.file.fieldname === 'productImage' ? 'products' : 
                              req.file.fieldname === 'categoryImage' ? 'categories' : 
                              req.file.fieldname === 'avatar' ? 'avatars' : 'temp'}/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/images
 * @access  Private/Admin
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files uploaded',
          status: 400
        }
      });
    }

    // Return array of file URLs
    const fileUrls = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      data: {
        files: fileUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages
};