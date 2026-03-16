// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getDashboardStats,
  getSalesReport,
  getRevenueAnalytics,
  getTopProducts,
  getLowStockProducts,
  getRecentOrders,
  getCustomerStats,
  exportSalesReport
} = require('../controllers/adminController');

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD & ANALYTICS ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard overview statistics
 * @access  Private/Admin
 * @requires JWT token in Authorization header with admin role
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     stats: {
 *       totalRevenue: {
 *         today: 1234.56,
 *         week: 8900.00,
 *         month: 45000.00,
 *         year: 350000.00,
 *         all: 500000.00
 *       },
 *       totalOrders: {
 *         today: 15,
 *         week: 89,
 *         month: 456,
 *         year: 3500,
 *         all: 5000
 *       },
 *       totalProducts: 234,
 *       totalCustomers: 1500,
 *       lowStockProducts: 12,
 *       pendingOrders: 23,
 *       processingOrders: 45,
 *       revenueGrowth: {
 *         daily: 12.5,    // percentage
 *         weekly: 8.3,
 *         monthly: 15.7
 *       }
 *     }
 *   }
 * });
 */
router.get('/dashboard', protect, admin, getDashboardStats);

/**
 * @route   GET /api/admin/sales-report
 * @desc    Get sales report for specified date range
 * @access  Private/Admin
 * @requires JWT token, Query params: startDate, endDate, groupBy (day|week|month)
 * @example  GET /api/admin/sales-report?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     report: [
 *       {
 *         date: '2024-01',
 *         revenue: 45000.00,
 *         orders: 456,
 *         averageOrderValue: 98.68,
 *         productsSold: 892
 *       },
 *       ...
 *     ],
 *     summary: {
 *       totalRevenue: 350000.00,
 *       totalOrders: 3500,
 *       averageOrderValue: 100.00,
 *       totalProductsSold: 8900
 *     }
 *   }
 * });
 */
router.get('/sales-report', protect, admin, getSalesReport);

/**
 * @route   GET /api/admin/revenue-analytics
 * @desc    Get detailed revenue analytics with charts data
 * @access  Private/Admin
 * @requires JWT token, Query params: period (7days|30days|90days|1year|all)
 * @example  GET /api/admin/revenue-analytics?period=30days
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     chartData: [
 *       { date: '2024-03-01', revenue: 1234.56, orders: 23 },
 *       { date: '2024-03-02', revenue: 2345.67, orders: 34 },
 *       ...
 *     ],
 *     revenueByCategory: [
 *       { categoryName: 'Smartphones', revenue: 45000, percentage: 35 },
 *       { categoryName: 'Laptops', revenue: 38000, percentage: 30 },
 *       ...
 *     ],
 *     revenueByPayment: [
 *       { method: 'Credit Card', revenue: 80000, percentage: 65 },
 *       { method: 'PayPal', revenue: 30000, percentage: 25 },
 *       { method: 'COD', revenue: 12000, percentage: 10 }
 *     ]
 *   }
 * });
 */
router.get('/revenue-analytics', protect, admin, getRevenueAnalytics);

/**
 * @route   GET /api/admin/top-products
 * @desc    Get top selling products
 * @access  Private/Admin
 * @requires JWT token, Query params: limit (default: 10), sortBy (revenue|quantity)
 * @example  GET /api/admin/top-products?limit=10&sortBy=revenue
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     topProducts: [
 *       {
 *         id: 1,
 *         name: 'iPhone 15 Pro',
 *         image: 'https://...',
 *         totalSold: 234,
 *         totalRevenue: 256986.00,
 *         averagePrice: 1098.23,
 *         category: 'Smartphones'
 *       },
 *       ...
 *     ]
 *   }
 * });
 */
router.get('/top-products', protect, admin, getTopProducts);

/**
 * @route   GET /api/admin/low-stock
 * @desc    Get products with low stock (stock < threshold)
 * @access  Private/Admin
 * @requires JWT token, Query params: threshold (default: 10)
 * @example  GET /api/admin/low-stock?threshold=10
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     lowStockProducts: [
 *       {
 *         id: 1,
 *         name: 'iPhone 15 Pro',
 *         sku: 'IPH15PRO-128',
 *         stock: 5,
 *         category: 'Smartphones',
 *         price: 1099.00,
 *         status: 'critical' // critical|low|adequate
 *       },
 *       ...
 *     ],
 *     count: 12
 *   }
 * });
 */
router.get('/low-stock', protect, admin, getLowStockProducts);

/**
 * @route   GET /api/admin/recent-orders
 * @desc    Get recent orders with details
 * @access  Private/Admin
 * @requires JWT token, Query params: limit (default: 10)
 * @example  GET /api/admin/recent-orders?limit=20
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     orders: [
 *       {
 *         id: 1,
 *         orderNumber: 'ORD-2024-00001',
 *         customer: {
 *           name: 'John Doe',
 *           email: 'john@example.com'
 *         },
 *         totalAmount: 1998.00,
 *         status: 'pending',
 *         itemCount: 2,
 *         createdAt: '2024-03-07T10:30:00Z'
 *       },
 *       ...
 *     ]
 *   }
 * });
 */
router.get('/recent-orders', protect, admin, getRecentOrders);

/**
 * @route   GET /api/admin/customer-stats
 * @desc    Get customer statistics and insights
 * @access  Private/Admin
 * @requires JWT token
 * @returns  res.status(200).json({
 *   success: true,
 *   data: {
 *     totalCustomers: 1500,
 *     newCustomersThisMonth: 45,
 *     activeCustomers: 890,
 *     topCustomers: [
 *       {
 *         id: 1,
 *         name: 'John Doe',
 *         email: 'john@example.com',
 *         totalOrders: 23,
 *         totalSpent: 12345.67,
 *         averageOrderValue: 536.77,
 *         lastOrderDate: '2024-03-05'
 *       },
 *       ...
 *     ],
 *     customersByRegion: [
 *       { region: 'North America', count: 650, percentage: 43 },
 *       { region: 'Europe', count: 450, percentage: 30 },
 *       ...
 *     ]
 *   }
 * });
 */
router.get('/customer-stats', protect, admin, getCustomerStats);

/**
 * @route   GET /api/admin/export-sales
 * @desc    Export sales report as CSV
 * @access  Private/Admin
 * @requires JWT token, Query params: startDate, endDate, format (csv|xlsx)
 * @example  GET /api/admin/export-sales?startDate=2024-01-01&endDate=2024-12-31&format=csv
 * @returns  CSV file download or res.status(200).json with download URL
 */
router.get('/export-sales', protect, admin, exportSalesReport);

// ═══════════════════════════════════════════════════════════
// ADMIN UTILITIES
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin
 * @desc    Admin panel home/health check
 * @access  Private/Admin
 * @returns  res.status(200).json({
 *   success: true,
 *   message: 'Admin panel access granted',
 *   admin: {
 *     id: req.user.id,
 *     name: req.user.firstName + ' ' + req.user.lastName,
 *     role: req.user.role
 *   }
 * });
 */
router.get('/', protect, admin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin panel access granted',
    admin: {
      id: req.user.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
