// routes/cart.js
const express = require('express');
const router = express.Router();
const {getCart, addToCart, updateCartItem, removeFromCart, clearCart, mergeCarts, validateCart} = require('../controllers/cartController');
const { protect, optionalProtect } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════
// CART ROUTES
// ═══════════════════════════════════════════════════════════

// Get cart (works for both guest and logged-in users)
router.get('/', optionalProtect, getCart);

// Add item to cart
router.post('/items', optionalProtect, addToCart);

// Update cart item quantity
router.put('/items/:itemId', optionalProtect, updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', optionalProtect, removeFromCart);

// Clear entire cart
router.delete('/clear', optionalProtect, clearCart);

// Merge guest cart with user cart (on login)
router.post('/merge', protect, mergeCarts);

// Validate cart (check stock, prices, availability)
router.get('/validate', optionalProtect, validateCart);

module.exports = router;
