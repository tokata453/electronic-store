// routes/uploadCloudinary.js
const express = require('express');
const router = express.Router();
const {
  upload,
  uploadImageToCloudinary,
  uploadMultipleToCloudinary,
  deleteImageFromCloudinary
} = require('../controllers/cloudinaryUploadController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, admin, upload.single('image'), uploadImageToCloudinary);
router.post('/multiple', protect, admin, upload.array('images', 5), uploadMultipleToCloudinary);
router.delete('/:publicId', protect, admin, deleteImageFromCloudinary);

module.exports = router;