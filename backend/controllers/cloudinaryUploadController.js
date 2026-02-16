// controllers/cloudinaryUploadController.js
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Use memory storage (don't save to disk)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * @desc    Upload image to Cloudinary
 * @route   POST /api/upload/cloudinary
 * @access  Private/Admin
 */
const uploadImageToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      return next(error);
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const folder = req.body.folder || 'products';
    const result = await uploadToCloudinary(dataURI, folder);

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple images to Cloudinary
 * @route   POST /api/upload/cloudinary/multiple
 * @access  Private/Admin
 */
const uploadMultipleToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      const error = new Error('No files uploaded');
      error.status = 400;
      return next(error);
    }

    const folder = req.body.folder || 'products';
    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadToCloudinary(dataURI, folder);
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: {
        images: results
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete image from Cloudinary
 * @route   DELETE /api/upload/cloudinary/:publicId
 * @access  Private/Admin
 */
const deleteImageFromCloudinary = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      const error = new Error('Public ID is required');
      error.status = 400;
      return next(error);
    }

    // Decode publicId (might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteFromCloudinary(decodedPublicId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Image deleted successfully',
        result
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadImageToCloudinary,
  uploadMultipleToCloudinary,
  deleteImageFromCloudinary
};