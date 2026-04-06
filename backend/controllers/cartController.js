// controllers/cartController.js
const { Cart, CartItem, Product } = require('../models');
const { generatePresignedUrl } = require('../utils/bucket');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

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
      let imageArray = item.product.images;
      // Safely parse images in case the DB returns a JSON string instead of an Array
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
    // Prevent crash if product was deleted from database
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
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE CART ITEM
// ═══════════════════════════════════════════════════════════

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const quantity = parseQuantity(req.body.quantity);
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    if (!quantity) return next(new AppError('Quantity must be a positive integer', 400));
    if (!userId && !sessionId) return next(new AppError('Session ID required for guest cart actions', 400));

    const cartItem = await CartItem.findByPk(itemId, {
      include: [
        { model: Cart, as: 'cart', where: userId ? { userId } : { sessionId } },
        { model: Product, as: 'product' }
      ]
    });

    if (!cartItem) return next(new AppError('Cart item not found', 404));
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ success: false, error: { message: 'Insufficient stock', availableStock: cartItem.product.stock } });
    }

    const price = cartItem.product.salePrice || cartItem.product.price;
    await cartItem.update({ quantity, price });
    await cartItem.cart.extendExpiration();

    const updatedItem = await CartItem.findByPk(itemId, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'images', 'isActive'] }]
    });

    const [itemWithUrls] = await addPresignedUrlsToCartItems([updatedItem]);
    res.json({ success: true, data: { message: 'Cart item updated', item: itemWithUrls } });
  } catch (error) {
    console.error('Update cart item error:', error);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// REMOVE FROM CART
// ═══════════════════════════════════════════════════════════

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    if (!userId && !sessionId) return next(new AppError('Session ID required for guest cart actions', 400));

    const cartItem = await CartItem.findByPk(itemId, {
      include: [{ model: Cart, as: 'cart', where: userId ? { userId } : { sessionId } }]
    });

    if (!cartItem) return next(new AppError('Cart item not found', 404));

    await cartItem.destroy();
    res.json({ success: true, data: { message: 'Item removed from cart' } });
  } catch (error) {
    console.error('Remove from cart error:', error);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// CLEAR CART
// ═══════════════════════════════════════════════════════════

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    if (!userId && !sessionId) return next(new AppError('Session ID required for guest cart actions', 400));

    const cart = await Cart.findOne({ where: userId ? { userId } : { sessionId } });
    if (!cart) return res.json({ success: true, data: { message: 'Cart is already empty' } });

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ success: true, data: { message: 'Cart cleared successfully' } });
  } catch (error) {
    console.error('Clear cart error:', error);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// MERGE CARTS (Guest → User on login)
// ═══════════════════════════════════════════════════════════

const mergeCarts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ success: false, error: { message: 'Session ID required' } });

    const guestCart = await Cart.findOne({ where: { sessionId } });
    if (!guestCart) return res.json({ success: true, data: { message: 'No guest cart to merge' } });

    let userCart = await Cart.findOne({ where: { userId } });
    
    if (!userCart) {
      await guestCart.update({ userId, sessionId: null });
      return res.json({ success: true, data: { message: 'Guest cart converted to user cart' } });
    }

    const guestItems = await CartItem.findAll({ 
      where: { cartId: guestCart.id },
      include: [{ model: Product, as: 'product' }]
    });

    for (const guestItem of guestItems) {
      const existingItem = await CartItem.findOne({ where: { cartId: userCart.id, productId: guestItem.productId } });
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + guestItem.quantity, guestItem.product.stock);
        await existingItem.update({ quantity: newQuantity });
      } else {
        await CartItem.create({
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: Math.min(guestItem.quantity, guestItem.product.stock),
          price: guestItem.price
        });
      }
    }

    await guestCart.destroy();
    res.json({ success: true, data: { message: 'Carts merged successfully', mergedItems: guestItems.length } });
  } catch (error) {
    console.error('Merge carts error:', error);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// VALIDATE CART
// ═══════════════════════════════════════════════════════════

const validateCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = resolveSessionId(req);

    if (!userId && !sessionId) return next(new AppError('Session ID required for guest cart actions', 400));

    const cart = await Cart.findOne({ where: userId ? { userId } : { sessionId } });
    if (!cart) return res.json({ success: true, data: { valid: true, issues: [] } });

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: 'product' }]
    });

    const issues = [];
    const itemsToRemove = [];

    for (const item of items) {
      if (!item.product) {
        issues.push({ itemId: item.id, type: 'removed', message: 'Product no longer available' });
        itemsToRemove.push(item.id);
        continue;
      }
      if (!item.product.isActive) {
        issues.push({ itemId: item.id, productId: item.productId, type: 'unavailable', message: 'Product unavailable' });
        itemsToRemove.push(item.id);
        continue;
      }
      if (item.product.stock < item.quantity) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          type: 'stock',
          message: `Only ${item.product.stock} items available`,
          currentQuantity: item.quantity,
          availableStock: item.product.stock
        });
      }
      const currentPrice = item.product.salePrice || item.product.price;
      if (parseFloat(item.price) !== parseFloat(currentPrice)) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          type: 'price_change',
          message: 'Price changed',
          oldPrice: parseFloat(item.price),
          newPrice: parseFloat(currentPrice)
        });
      }
    }

    if (itemsToRemove.length > 0) {
      await CartItem.destroy({ where: { id: { [Op.in]: itemsToRemove } } });
    }

    res.json({ success: true, data: { valid: issues.length === 0, issues, removedItems: itemsToRemove.length } });
  } catch (error) {
    console.error('Validate cart error:', error);
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts,
  validateCart
};