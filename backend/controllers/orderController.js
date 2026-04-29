// controllers/orderController.js
const { Order, OrderItem, Product, User, Cart, CartItem } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const appError = require('../utils/appError');
const { generatePresignedUrl } = require('../utils/bucket');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const VALID_PAYMENT_METHODS = ['credit_card', 'paypal', 'cod', 'bank_transfer', 'aba', 'acleda'];

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeOrderItems = (items = []) => items.map(item => ({
  productId: Number.parseInt(item.productId, 10),
  quantity: parsePositiveInt(item.quantity)
}));

const validateAddress = (address) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return false;
  }

  const requiredFields = ['fullName', 'phone', 'addressLine1', 'city'];
  return requiredFields.every(field => typeof address[field] === 'string' && address[field].trim());
};

const addPresignedUrlsToOrderItems = async (items = []) => {
  if (!items.length) return [];

  const itemsJson = items.map((item) => (item.toJSON ? item.toJSON() : item));

  return Promise.all(
    itemsJson.map(async (item) => {
      item.productImageUrl = null;

      if (item.productImage) {
        if (typeof item.productImage === 'string' && item.productImage.startsWith('http')) {
          item.productImageUrl = item.productImage;
        } else {
          try {
            item.productImageUrl = await generatePresignedUrl(item.productImage);
          } catch (error) {
            console.error('Error generating order item image URL:', error);
          }
        }
      }

      return item;
    })
  );
};

const addPresignedUrlsToOrders = async (orders = []) => {
  if (!orders.length) return [];

  const ordersJson = orders.map((order) => (order.toJSON ? order.toJSON() : order));

  return Promise.all(
    ordersJson.map(async (order) => {
      order.items = await addPresignedUrlsToOrderItems(order.items || []);
      return order;
    })
  );
};

const buildOrderSummary = async (items, transaction) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of normalizeOrderItems(items)) {
    if (!item.productId || !item.quantity) {
      throw new appError('Each order item must include a valid productId and quantity', 400);
    }

    const product = await Product.findOne({
      where: {
        id: item.productId,
        isActive: true,
        stock: { [Op.gte]: item.quantity }
      },
      transaction
    });

    if (!product) {
      throw new appError(`Product with ID ${item.productId} is unavailable or out of stock`, 400);
    }

    const [updatedCount] = await Product.update(
      {
        stock: sequelize.literal(`stock - ${item.quantity}`)
      },
      {
        where: {
          id: product.id,
          isActive: true,
          stock: { [Op.gte]: item.quantity }
        },
        transaction
      }
    );

    if (updatedCount !== 1) {
      throw new appError(`Insufficient stock for ${product.name}`, 400);
    }

    const price = Number(product.salePrice || product.price);
    const totalPrice = Number((price * item.quantity).toFixed(2));
    subtotal += totalPrice;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
      quantity: item.quantity,
      price,
      totalPrice
    });
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: 0,
    shippingCost: 0,
    discount: 0,
    orderItems
  };
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return next(new appError('Order must contain at least one item', 400));
    }

    if (!validateAddress(shippingAddress)) {
      await t.rollback();
      return next(new appError('A valid shipping address is required', 400));
    }
    if (!paymentMethod) {
      await t.rollback();
      return next(new appError('Payment method is required', 400));
    }
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      await t.rollback();
      return next(new appError('Invalid payment method', 400));
    }
    if (billingAddress && !validateAddress(billingAddress)) {
      await t.rollback();
      return next(new appError('Billing address is invalid', 400));
    }

    const { subtotal, tax, shippingCost, discount, orderItems } = await buildOrderSummary(items, t);
    const totalAmount = Number((subtotal + tax + shippingCost - discount).toFixed(2));

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${req.user.id}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      orderNumber,
      totalAmount,
      subtotal,
      tax,
      shippingCost,
      discount,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }

    const userCart = await Cart.findOne({
      where: { userId: req.user.id },
      transaction: t
    });

    if (userCart) {
      await CartItem.destroy({
        where: {
          cartId: userCart.id,
          productId: { [Op.in]: orderItems.map(item => item.productId) }
        },
        transaction: t
      });
    }

    // Commit transaction
    await t.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    // Send order confirmation email
    if (req.user && req.user.email) {
      // Pass the email, and the order data we need for the template
      await sendOrderConfirmationEmail(req.user.email, {
        orderNumber: completeOrder.orderNumber,
        totalAmount: completeOrder.totalAmount,
        items: completeOrder.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
        }))
      });
    }

    res.status(201).json({
      success: true,
      data: {
        order: completeOrder
      }
    });

  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const ordersWithUrls = await addPresignedUrlsToOrders(orders);

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!order) {
      return next(new appError('Order not found', 404));
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return next(new appError('Not authorized to access this order', 403));
    }

    const [orderWithUrls] = await addPresignedUrlsToOrders([order]);

    res.status(200).json({
      success: true,
      data: {
        order: orderWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return next(new appError('Order not found', 404));
    }

    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return next(new appError('Invalid order status', 400));
    }

    // Update order
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    // Set timestamps for status changes
    if (status === 'shipped' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

const previewOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return next(new appError('Order must contain at least one item', 400));
    }

    if (shippingAddress && !validateAddress(shippingAddress)) {
      await t.rollback();
      return next(new appError('Shipping address is invalid', 400));
    }

    if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      await t.rollback();
      return next(new appError('Invalid payment method', 400));
    }

    const summary = await buildOrderSummary(items, t);
    await t.rollback();

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          subtotal: summary.subtotal,
          tax: summary.tax,
          shippingCost: summary.shippingCost,
          discount: summary.discount,
          totalAmount: Number((summary.subtotal + summary.tax + summary.shippingCost - summary.discount).toFixed(2)),
          itemCount: summary.orderItems.reduce((count, item) => count + item.quantity, 0),
          items: summary.orderItems
        }
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const getOrderSummary = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id }
    });

    const summary = orders.reduce((acc, order) => {
      acc.totalOrders += 1;
      acc.totalSpent += Number(order.totalAmount || 0);
      acc.byStatus[order.status] = (acc.byStatus[order.status] || 0) + 1;
      return acc;
    }, {
      totalOrders: 0,
      totalSpent: 0,
      byStatus: {}
    });

    summary.totalSpent = Number(summary.totalSpent.toFixed(2));

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const ordersWithUrls = await addPresignedUrlsToOrders(orders);

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithUrls,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  previewOrder,
  getOrders,
  getOrder,
  getOrderSummary,
  updateOrderStatus,
  getAllOrders
};
