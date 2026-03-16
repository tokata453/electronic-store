// controllers/adminController.js
const { Order, OrderItem, Product, User, Category } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get date ranges for statistics
 */
const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

  return { today, weekAgo, monthAgo, yearAgo };
};

/**
 * Calculate percentage growth
 */
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATISTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get dashboard overview statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { today, weekAgo, monthAgo, yearAgo } = getDateRanges();

    // Revenue statistics
    const [revenueStats] = await Order.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "createdAt" >= \'' + today.toISOString() + '\' THEN "totalAmount" ELSE 0 END')), 'today'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "createdAt" >= \'' + weekAgo.toISOString() + '\' THEN "totalAmount" ELSE 0 END')), 'week'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "createdAt" >= \'' + monthAgo.toISOString() + '\' THEN "totalAmount" ELSE 0 END')), 'month'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "createdAt" >= \'' + yearAgo.toISOString() + '\' THEN "totalAmount" ELSE 0 END')), 'year'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'all']
      ],
      raw: true
    });

    // Order statistics
    const [orderStats] = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "createdAt" >= \'' + today.toISOString() + '\' THEN 1 END')), 'today'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "createdAt" >= \'' + weekAgo.toISOString() + '\' THEN 1 END')), 'week'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "createdAt" >= \'' + monthAgo.toISOString() + '\' THEN 1 END')), 'month'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "createdAt" >= \'' + yearAgo.toISOString() + '\' THEN 1 END')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'all']
      ],
      raw: true
    });

    // Product and customer counts
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalCustomers = await User.count({ where: { role: 'user' } });
    const lowStockProducts = await Product.count({ where: { stock: { [Op.lt]: 10 } } });

    // Order status counts
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const processingOrders = await Order.count({ where: { status: 'processing' } });

    // Calculate growth rates
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000);

    const yesterdayRevenue = await Order.sum('totalAmount', {
      where: {
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    }) || 0;

    const lastWeekRevenue = await Order.sum('totalAmount', {
      where: {
        createdAt: {
          [Op.gte]: lastWeek,
          [Op.lt]: weekAgo
        }
      }
    }) || 0;

    const lastMonthRevenue = await Order.sum('totalAmount', {
      where: {
        createdAt: {
          [Op.gte]: lastMonth,
          [Op.lt]: monthAgo
        }
      }
    }) || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue: {
            today: parseFloat(revenueStats.today) || 0,
            week: parseFloat(revenueStats.week) || 0,
            month: parseFloat(revenueStats.month) || 0,
            year: parseFloat(revenueStats.year) || 0,
            all: parseFloat(revenueStats.all) || 0
          },
          totalOrders: {
            today: parseInt(orderStats.today) || 0,
            week: parseInt(orderStats.week) || 0,
            month: parseInt(orderStats.month) || 0,
            year: parseInt(orderStats.year) || 0,
            all: parseInt(orderStats.all) || 0
          },
          totalProducts,
          totalCustomers,
          lowStockProducts,
          pendingOrders,
          processingOrders,
          revenueGrowth: {
            daily: calculateGrowth(parseFloat(revenueStats.today) || 0, yesterdayRevenue),
            weekly: calculateGrowth(parseFloat(revenueStats.week) || 0, lastWeekRevenue),
            monthly: calculateGrowth(parseFloat(revenueStats.month) || 0, lastMonthRevenue)
          }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch dashboard statistics', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// SALES REPORTS
// ═══════════════════════════════════════════════════════════

/**
 * Get sales report for date range
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Start date and end date are required' }
      });
    }

    // Determine grouping format
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-W%V'; // Year-Week
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const orders = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'date'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('AVG', sequelize.col('totalAmount')), 'averageOrderValue']
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: { [Op.notIn]: ['cancelled'] }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'ASC']],
      raw: true
    });

    // Calculate summary
    const summary = orders.reduce((acc, curr) => {
      acc.totalRevenue += parseFloat(curr.revenue);
      acc.totalOrders += parseInt(curr.orders);
      return acc;
    }, { totalRevenue: 0, totalOrders: 0 });

    summary.averageOrderValue = summary.totalOrders > 0 
      ? summary.totalRevenue / summary.totalOrders 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        report: orders.map(order => ({
          date: order.date,
          revenue: parseFloat(order.revenue),
          orders: parseInt(order.orders),
          averageOrderValue: parseFloat(order.averageOrderValue)
        })),
        summary
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate sales report', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// REVENUE ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get revenue analytics with chart data
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(2000, 0, 1); // Beginning of time
        break;
      default: // 30days
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Chart data - daily revenue
    const chartData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
        status: { [Op.notIn]: ['cancelled'] }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Revenue by category
    const revenueByCategory = await OrderItem.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('"OrderItem"."price" * "OrderItem"."quantity"')), 'revenue']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name']
            }
          ]
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            createdAt: { [Op.between]: [startDate, endDate] },
            status: { [Op.notIn]: ['cancelled'] }
          }
        }
      ],
      group: ['product.category.id', 'product.category.name'],
      order: [[sequelize.literal('revenue'), 'DESC']],
      raw: true
    });

    const totalRevenue = revenueByCategory.reduce((sum, cat) => sum + parseFloat(cat.revenue), 0);

    // Revenue by payment method
    const revenueByPayment = await Order.findAll({
      attributes: [
        'paymentMethod',
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
        status: { [Op.notIn]: ['cancelled'] }
      },
      group: ['paymentMethod'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        chartData: chartData.map(item => ({
          date: item.date,
          revenue: parseFloat(item.revenue),
          orders: parseInt(item.orders)
        })),
        revenueByCategory: revenueByCategory.map(cat => ({
          categoryName: cat['product.category.name'],
          revenue: parseFloat(cat.revenue),
          percentage: totalRevenue > 0 ? ((parseFloat(cat.revenue) / totalRevenue) * 100).toFixed(1) : 0
        })),
        revenueByPayment: revenueByPayment.map(pay => ({
          method: pay.paymentMethod,
          revenue: parseFloat(pay.revenue),
          percentage: totalRevenue > 0 ? ((parseFloat(pay.revenue) / totalRevenue) * 100).toFixed(1) : 0
        }))
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch revenue analytics', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// PRODUCT ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get top selling products
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'revenue' } = req.query;

    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.literal('"OrderItem"."price" * "OrderItem"."quantity"')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('OrderItem.price')), 'averagePrice']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name']
            }
          ]
        }
      ],
      group: ['productId', 'product.id', 'product.category.id'],
      order: [[sequelize.literal(sortBy === 'quantity' ? 'totalSold' : 'totalRevenue'), 'DESC']],
      limit: parseInt(limit),
      raw: true,
      nest: true
    });

    res.status(200).json({
      success: true,
      data: {
        topProducts: topProducts.map(item => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0] || null,
          totalSold: parseInt(item.totalSold),
          totalRevenue: parseFloat(item.totalRevenue),
          averagePrice: parseFloat(item.averagePrice),
          category: item.product.category.name
        }))
      }
    });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch top products', details: error.message }
    });
  }
};

/**
 * Get low stock products
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lt]: parseInt(threshold) },
        isActive: true
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        }
      ],
      order: [['stock', 'ASC']],
      attributes: ['id', 'name', 'sku', 'stock', 'price']
    });

    const productsWithStatus = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      category: product.category.name,
      price: parseFloat(product.price),
      status: product.stock === 0 ? 'out_of_stock' : product.stock < 5 ? 'critical' : 'low'
    }));

    res.status(200).json({
      success: true,
      data: {
        lowStockProducts: productsWithStatus,
        count: productsWithStatus.length
      }
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch low stock products', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ORDER ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get recent orders
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['quantity']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email
      },
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: { orders: formattedOrders }
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch recent orders', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// CUSTOMER ANALYTICS
// ═══════════════════════════════════════════════════════════

/**
 * Get customer statistics
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.count({ where: { role: 'user' } });
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const newCustomersThisMonth = await User.count({
      where: {
        role: 'user',
        createdAt: { [Op.gte]: monthAgo }
      }
    });

    // Customers with at least one order
    const activeCustomers = await User.count({
      where: { role: 'user' },
      include: [
        {
          model: Order,
          as: 'orders',
          required: true
        }
      ],
      distinct: true
    });

    // Top customers
    const topCustomers = await User.findAll({
      where: { role: 'user' },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        [sequelize.fn('COUNT', sequelize.col('orders.id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('orders.totalAmount')), 'totalSpent'],
        [sequelize.fn('AVG', sequelize.col('orders.totalAmount')), 'averageOrderValue'],
        [sequelize.fn('MAX', sequelize.col('orders.createdAt')), 'lastOrderDate']
      ],
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: [],
          where: { status: { [Op.notIn]: ['cancelled'] } }
        }
      ],
      group: ['User.id'],
      order: [[sequelize.literal('totalSpent'), 'DESC']],
      limit: 10,
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers,
        topCustomers: topCustomers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          totalOrders: parseInt(customer.totalOrders),
          totalSpent: parseFloat(customer.totalSpent),
          averageOrderValue: parseFloat(customer.averageOrderValue),
          lastOrderDate: customer.lastOrderDate
        }))
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch customer statistics', details: error.message }
    });
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════

/**
 * Export sales report
 */
exports.exportSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Start date and end date are required' }
      });
    }

    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Generate CSV
      let csv = 'Order Number,Date,Customer,Email,Total Amount,Status,Items\n';
      
      orders.forEach(order => {
        const customerName = `${order.user.firstName} ${order.user.lastName}`;
        const itemsList = order.items.map(item => 
          `${item.product.name} (${item.quantity})`
        ).join('; ');
        
        csv += `${order.orderNumber},${order.createdAt.toISOString()},${customerName},${order.user.email},${order.totalAmount},${order.status},"${itemsList}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${startDate}-to-${endDate}.csv`);
      res.send(csv);
    } else {
      // Return JSON for client-side processing
      res.status(200).json({
        success: true,
        data: { orders }
      });
    }
  } catch (error) {
    console.error('Export sales report error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to export sales report', details: error.message }
    });
  }
};
