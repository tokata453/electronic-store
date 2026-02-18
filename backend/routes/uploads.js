// routes/upload.js
const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMultipleImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private/Admin
 */
router.post('/image', protect, admin, upload.single('image'), uploadImage);

/**
 * @route   POST /api/upload/product-images
 * @desc    Upload multiple product images
 * @access  Private/Admin
 */
router.post('/product-images', protect, admin, upload.array('images', 5), uploadMultipleImages);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', protect, upload.single('avatar'), uploadImage);

module.exports = router;