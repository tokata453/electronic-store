// controllers/adminController.js
const { Order, OrderItem, Product, User, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

const CUSTOMER_ROLE = 'customer';

const toNumber = (value) => Number.parseFloat(value || 0) || 0;

const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const yearAgo = new Date(today);
  yearAgo.setDate(yearAgo.getDate() - 365);

  return { today, weekAgo, monthAgo, yearAgo };
};

const calculateGrowth = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const formatDateKey = (date, groupBy = 'day') => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  if (groupBy === 'month') {
    return `${year}-${month}`;
  }

  if (groupBy === 'week') {
    const temp = new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()));
    const weekDay = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - weekDay);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
    return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  return `${year}-${month}-${day}`;
};

const fetchOrdersInRange = async (startDate, endDate) => {
  return Order.findAll({
    where: {
      createdAt: { [Op.between]: [startDate, endDate] },
      status: { [Op.notIn]: ['cancelled'] }
    },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'ASC']]
  });
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { today, weekAgo, monthAgo, yearAgo } = getDateRanges();

    const [
      allActiveOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      pendingOrders,
      processingOrders,
      yesterdayRevenue,
      lastWeekRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      Order.findAll({
        where: { status: { [Op.notIn]: ['cancelled'] } },
        attributes: ['id', 'totalAmount', 'createdAt'],
        raw: true
      }),
      Product.count({ where: { isActive: true } }),
      User.count({ where: { role: CUSTOMER_ROLE } }),
      Product.count({ where: { stock: { [Op.lt]: 10 }, isActive: true } }),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'processing' } }),
      Order.sum('totalAmount', {
        where: {
          createdAt: {
            [Op.gte]: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            [Op.lt]: today
          },
          status: { [Op.notIn]: ['cancelled'] }
        }
      }),
      Order.sum('totalAmount', {
        where: {
          createdAt: {
            [Op.gte]: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            [Op.lt]: weekAgo
          },
          status: { [Op.notIn]: ['cancelled'] }
        }
      }),
      Order.sum('totalAmount', {
        where: {
          createdAt: {
            [Op.gte]: new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            [Op.lt]: monthAgo
          },
          status: { [Op.notIn]: ['cancelled'] }
        }
      })
    ]);

    const totals = allActiveOrders.reduce((acc, order) => {
      const createdAt = new Date(order.createdAt);
      const totalAmount = toNumber(order.totalAmount);

      acc.allRevenue += totalAmount;
      acc.allOrders += 1;

      if (createdAt >= today) {
        acc.todayRevenue += totalAmount;
        acc.todayOrders += 1;
      }
      if (createdAt >= weekAgo) {
        acc.weekRevenue += totalAmount;
        acc.weekOrders += 1;
      }
      if (createdAt >= monthAgo) {
        acc.monthRevenue += totalAmount;
        acc.monthOrders += 1;
      }
      if (createdAt >= yearAgo) {
        acc.yearRevenue += totalAmount;
        acc.yearOrders += 1;
      }

      return acc;
    }, {
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      yearRevenue: 0,
      allRevenue: 0,
      todayOrders: 0,
      weekOrders: 0,
      monthOrders: 0,
      yearOrders: 0,
      allOrders: 0
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue: {
            today: Number(totals.todayRevenue.toFixed(2)),
            week: Number(totals.weekRevenue.toFixed(2)),
            month: Number(totals.monthRevenue.toFixed(2)),
            year: Number(totals.yearRevenue.toFixed(2)),
            all: Number(totals.allRevenue.toFixed(2))
          },
          totalOrders: {
            today: totals.todayOrders,
            week: totals.weekOrders,
            month: totals.monthOrders,
            year: totals.yearOrders,
            all: totals.allOrders
          },
          totalProducts,
          totalCustomers,
          lowStockProducts,
          pendingOrders,
          processingOrders,
          revenueGrowth: {
            daily: calculateGrowth(totals.todayRevenue, toNumber(yesterdayRevenue)),
            weekly: calculateGrowth(totals.weekRevenue, toNumber(lastWeekRevenue)),
            monthly: calculateGrowth(totals.monthRevenue, toNumber(lastMonthRevenue))
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

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Start date and end date are required' }
      });
    }

    const orders = await fetchOrdersInRange(new Date(startDate), new Date(endDate));
    const grouped = new Map();

    for (const order of orders) {
      const key = formatDateKey(order.createdAt, groupBy);
      const current = grouped.get(key) || {
        date: key,
        revenue: 0,
        orders: 0
      };

      current.revenue += toNumber(order.totalAmount);
      current.orders += 1;
      grouped.set(key, current);
    }

    const report = Array.from(grouped.values()).map(item => ({
      date: item.date,
      revenue: Number(item.revenue.toFixed(2)),
      orders: item.orders,
      averageOrderValue: item.orders > 0 ? Number((item.revenue / item.orders).toFixed(2)) : 0
    }));

    const summary = report.reduce((acc, item) => {
      acc.totalRevenue += item.revenue;
      acc.totalOrders += item.orders;
      return acc;
    }, { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });

    summary.totalRevenue = Number(summary.totalRevenue.toFixed(2));
    summary.averageOrderValue = summary.totalOrders > 0
      ? Number((summary.totalRevenue / summary.totalOrders).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        report,
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

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const endDate = new Date();
    let startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (period === '7days') startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period === '90days') startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (period === '1year') startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    if (period === 'all') startDate = new Date(2000, 0, 1);

    const orders = await fetchOrdersInRange(startDate, endDate);
    const chartMap = new Map();
    const categoryMap = new Map();
    const paymentMap = new Map();
    let totalRevenue = 0;

    for (const order of orders) {
      const orderAmount = toNumber(order.totalAmount);
      totalRevenue += orderAmount;

      const dayKey = formatDateKey(order.createdAt, 'day');
      const chartEntry = chartMap.get(dayKey) || { date: dayKey, revenue: 0, orders: 0 };
      chartEntry.revenue += orderAmount;
      chartEntry.orders += 1;
      chartMap.set(dayKey, chartEntry);

      paymentMap.set(order.paymentMethod, (paymentMap.get(order.paymentMethod) || 0) + orderAmount);

      for (const item of order.items || []) {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + toNumber(item.totalPrice));
      }
    }

    res.status(200).json({
      success: true,
      data: {
        chartData: Array.from(chartMap.values()).map(item => ({
          date: item.date,
          revenue: Number(item.revenue.toFixed(2)),
          orders: item.orders
        })),
        revenueByCategory: Array.from(categoryMap.entries())
          .map(([categoryName, revenue]) => ({
            categoryName,
            revenue: Number(revenue.toFixed(2)),
            percentage: totalRevenue > 0 ? Number(((revenue / totalRevenue) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.revenue - a.revenue),
        revenueByPayment: Array.from(paymentMap.entries())
          .map(([method, revenue]) => ({
            method,
            revenue: Number(revenue.toFixed(2)),
            percentage: totalRevenue > 0 ? Number(((revenue / totalRevenue) * 100).toFixed(1)) : 0
          }))
          .sort((a, b) => b.revenue - a.revenue)
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

exports.getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
    const sortBy = req.query.sortBy === 'quantity' ? 'quantity' : 'revenue';

    const items = await OrderItem.findAll({
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
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: { status: { [Op.notIn]: ['cancelled'] } }
        }
      ]
    });

    const productMap = new Map();

    for (const item of items) {
      if (!item.product) continue;

      const entry = productMap.get(item.productId) || {
        id: item.product.id,
        name: item.product.name,
        image: Array.isArray(item.product.images) ? item.product.images[0] || null : null,
        totalSold: 0,
        totalRevenue: 0,
        averagePrice: 0,
        orderLines: 0,
        category: item.product.category?.name || null
      };

      entry.totalSold += item.quantity;
      entry.totalRevenue += toNumber(item.totalPrice);
      entry.averagePrice += toNumber(item.price);
      entry.orderLines += 1;
      productMap.set(item.productId, entry);
    }

    const topProducts = Array.from(productMap.values())
      .map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        totalSold: item.totalSold,
        totalRevenue: Number(item.totalRevenue.toFixed(2)),
        averagePrice: item.orderLines > 0 ? Number((item.averagePrice / item.orderLines).toFixed(2)) : 0,
        category: item.category
      }))
      .sort((a, b) => sortBy === 'quantity' ? b.totalSold - a.totalSold : b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: { topProducts }
    });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch top products', details: error.message }
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = Math.max(Number.parseInt(req.query.threshold, 10) || 10, 0);

    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lt]: threshold },
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
      category: product.category?.name || null,
      price: toNumber(product.price),
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

exports.getRecentOrders = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);

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
      limit
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.user ? `${order.user.firstName} ${order.user.lastName}`.trim() : 'Unknown Customer',
        email: order.user?.email || null
      },
      totalAmount: toNumber(order.totalAmount),
      status: order.status,
      itemCount: (order.items || []).reduce((sum, item) => sum + item.quantity, 0),
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

exports.getCustomerStats = async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [totalCustomers, newCustomersThisMonth, activeCustomerRows, topCustomers] = await Promise.all([
      User.count({ where: { role: CUSTOMER_ROLE } }),
      User.count({
        where: {
          role: CUSTOMER_ROLE,
          createdAt: { [Op.gte]: monthAgo }
        }
      }),
      User.findAll({
        where: { role: CUSTOMER_ROLE },
        include: [
          {
            model: Order,
            as: 'orders',
            attributes: ['id'],
            required: true
          }
        ],
        attributes: ['id'],
        raw: true
      }),
      User.findAll({
        where: { role: CUSTOMER_ROLE },
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
            where: { status: { [Op.notIn]: ['cancelled'] } },
            required: true
          }
        ],
        group: ['User.id'],
        order: [[sequelize.literal('"totalSpent"'), 'DESC']],
        limit: 10,
        raw: true
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers: new Set(activeCustomerRows.map(row => row.id)).size,
        topCustomers: topCustomers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          totalOrders: Number.parseInt(customer.totalOrders, 10) || 0,
          totalSpent: toNumber(customer.totalSpent),
          averageOrderValue: toNumber(customer.averageOrderValue),
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

exports.exportSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Start date and end date are required' }
      });
    }

    const orders = await fetchOrdersInRange(new Date(startDate), new Date(endDate));

    if (format === 'csv') {
      let csv = 'Order Number,Date,Customer,Email,Total Amount,Status,Items\n';

      for (const order of orders) {
        const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}`.trim() : 'Unknown Customer';
        const itemsList = (order.items || [])
          .map(item => `${item.productName} (${item.quantity})`)
          .join('; ');

        csv += `${order.orderNumber},${order.createdAt.toISOString()},${customerName},${order.user?.email || ''},${order.totalAmount},${order.status},"${itemsList}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Export sales report error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to export sales report', details: error.message }
    });
  }
};
