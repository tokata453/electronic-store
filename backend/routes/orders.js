// routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, admin, getAllOrders);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', protect, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', protect, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', protect, getOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;