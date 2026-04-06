// controllers/cartController.js
const { Cart, CartItem, Product } = require('../models');
const { generatePresignedUrl } = require('../utils/bucket');
const { Op } = require('sequelize');

const parseQuantity = (value) => {
  const quantity = Number.parseInt(value, 10);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
};

const resolveSessionId = (req) => req.headers['x-session-id'] || req.body.sessionId || req.query.sessionId;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const getOrCreateCart = async (userId, sessionId) => {
  let cart;
  if (userId) {
    cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ 
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  } else if (sessionId) {
    cart = await Cart.findOne({ where: { sessionId } });
    if (!cart || cart.isExpired()) {
      if (cart?.isExpired()) await cart.destroy();
      cart = await Cart.create({ 
        sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  } else {
    throw new Error('User ID or Session ID required');
  }
  return cart;
};

const addPresignedUrlsToCartItems = async (items) => {
  const allKeys = new Set();
  
  items.forEach(item => {
    if (item.product && item.product.images) {
      // FIX 1: Safely parse images in case the DB returns a JSON string instead of an Array
      let imageArray = item.product.images;
      if (typeof imageArray === 'string') {
        try { imageArray = JSON.parse(imageArray); } catch(e) { imageArray = []; }
      }
      
      if (Array.isArray(imageArray)) {
        imageArray.forEach(key => allKeys.add(key));
      }
    }
  });

  const keyArray = Array.from(allKeys);
  const urls = await Promise.all(
    keyArray.map(key => generatePresignedUrl(key).catch(() => null))
  );

  const urlMap = {};
  keyArray.forEach((key, i) => { if (urls[i]) urlMap[key] = urls[i]; });

  return items.map(item => {
    const itemJson = item.toJSON ? item.toJSON() : item;
    if (itemJson.product && itemJson.product.images) {
      
      let imageArray = itemJson.product.images;
      if (typeof imageArray === 'string') {
        try { imageArray = JSON.parse(imageArray); } catch(e) { imageArray = []; }
      }

      if (Array.isArray(imageArray)) {
         itemJson.product.imageUrls = imageArray.map(key => urlMap[key]).filter(Boolean);
      }
    }
    return itemJson;
  });
};

const calculateCartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => {
    // FIX 2: Prevent crash if product was deleted from database (orphaned cart item)
    if (!item.product) return sum; 
    const price = item.product.salePrice || item.product.price;
    return sum + (parseFloat(price) * item.quantity);
  }, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return {
    itemCount,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: 0,
    shipping: 0,
    total: parseFloat(subtotal.toFixed(2))
  };
};

// ═══════════════════════════════════════════════════════════
// GET CART
// ═══════════════════════════════════════════════════════════

const getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: { items: [], summary: { itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 } }
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive', 'badge']
      }],
      order: [['createdAt', 'DESC']]
    });

    const itemsWithUrls = await addPresignedUrlsToCartItems(items);
    const summary = calculateCartSummary(items);

    res.json({
      success: true,
      data: { cartId: cart.id, items: itemsWithUrls, summary }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    // TEMPORARY FIX: Send exact error to browser to stop guessing
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// ═══════════════════════════════════════════════════════════
// ADD TO CART
// ═══════════════════════════════════════════════════════════

const addToCart = async (req, res, next) => {
  try {
    const productId = parseInt(req.body.productId, 10);
    const quantity = parseQuantity(req.body.quantity ?? 1);
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    // FIX 3: Bypass AppError just in case the Express Error Handler isn't set up
    if (!productId || isNaN(productId)) return res.status(400).json({ success: false, message: "Valid Product ID required" });
    if (!quantity) return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    if (!userId && !sessionId) return res.status(400).json({ success: false, message: "Session ID or User ID required" });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!product.isActive) return res.status(400).json({ success: false, message: 'Product not available' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock', availableStock: product.stock });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    
    if (!cart || !cart.id) {
       return res.status(500).json({ success: false, message: 'Could not resolve Cart ID' });
    }

    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    const price = parseFloat(product.salePrice || product.price);

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock', 
          availableStock: product.stock, 
          currentQuantity: cartItem.quantity 
        });
      }
      await cartItem.update({ quantity: newQuantity, price });
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity, price });
    }

    await cart.extendExpiration();

    const updatedItem = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive', 'badge'] }]
    });

    const [itemWithUrls] = await addPresignedUrlsToCartItems([updatedItem]);

    res.json({ success: true, data: { message: 'Item added to cart', item: itemWithUrls, cartId: cart.id } });
  } catch (error) {
    console.error('Add to cart error:', error);
    // TEMPORARY FIX: Send exact error to browser
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// ... (Keep the rest of your controller functions like updateCartItem, clearCart, etc. the same, but you can add the same `res.status(500).json` trick to their catch blocks if they fail too!)

module.exports = {
  getCart,
  addToCart,
  // ... export all others
};