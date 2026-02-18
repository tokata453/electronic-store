// routes/categories.js
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category with products
 * @access  Public
 */
router.get('/:id', getCategory);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post('/', protect, admin, createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;