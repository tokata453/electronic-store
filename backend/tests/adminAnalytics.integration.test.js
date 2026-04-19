/**
 * Admin Analytics Endpoints - Deep Contract Validation
 * 
 * Tests dashboard stats, sales reports, and revenue analytics with
 * strict contract validation, type checking, empty data scenarios,
 * and filter combinations.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { User, Order, OrderItem, Product, Category, sequelize } from '../models/index.js';

describe('Admin Analytics - Deep Contract Validation', () => {
  let adminToken, customerToken, admin, customer;
  let testProduct, testCategory;

  beforeAll(async () => {
    admin = await User.create({
      email: `admin-analytics-${Date.now()}@test.com`,
      firstName: 'Admin',
      lastName: 'User',
      password: 'password123',
      role: 'admin'
    });

    customer = await User.create({
      email: `customer-analytics-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Customer',
      password: 'password123',
      role: 'customer'
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: 'password123' });
    customerToken = customerLoginRes.body.data.token;

    testCategory = await Category.create({
      name: `Test Category ${Date.now()}`,
      slug: `test-cat-${Date.now()}`
    });

    testProduct = await Product.create({
      name: 'Analytics Test Product',
      slug: `analytics-test-${Date.now()}`,
      description: 'Test',
      price: 100,
      stock: 100,
      isActive: true,
      categoryId: testCategory.id
    });
  });

  afterEach(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
  });

  describe('Dashboard Stats - Contract Validation', () => {
    it('should return dashboard with correct response structure', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.stats).toBeDefined();
    });

    it('should include revenue object with all time periods', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const stats = res.body.data.stats;
      expect(stats.totalRevenue).toBeDefined();

      const periods = ['today', 'week', 'month', 'year', 'all'];
      for (const period of periods) {
        expect(stats.totalRevenue[period]).toBeDefined();
        expect(typeof stats.totalRevenue[period]).toBe('number');
        expect(stats.totalRevenue[period]).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include orders object with all time periods', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const stats = res.body.data.stats;
      expect(stats.totalOrders).toBeDefined();

      const periods = ['today', 'week', 'month', 'year', 'all'];
      for (const period of periods) {
        expect(stats.totalOrders[period]).toBeDefined();
        expect(typeof stats.totalOrders[period]).toBe('number');
        expect(stats.totalOrders[period]).toBeGreaterThanOrEqual(0);
      }
    });

    it('should ensure all numeric fields are numbers, not strings', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const stats = res.body.data.stats;

      // Check revenue is numeric
      Object.values(stats.totalRevenue).forEach(value => {
        expect(typeof value).toBe('number');
      });

      // Check orders is numeric
      Object.values(stats.totalOrders).forEach(value => {
        expect(typeof value).toBe('number');
      });

      // Check product/customer counts
      expect(typeof stats.totalProducts).toBe('number');
      expect(typeof stats.totalCustomers).toBe('number');
      expect(typeof stats.lowStockProducts).toBe('number');
      expect(typeof stats.pendingOrders).toBe('number');
      expect(typeof stats.processingOrders).toBe('number');
    });

    it('should include revenue growth metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      const stats = res.body.data.stats;
      expect(stats.revenueGrowth).toBeDefined();

      const growthPeriods = ['daily', 'weekly', 'monthly'];
      for (const period of growthPeriods) {
        expect(stats.revenueGrowth[period]).toBeDefined();
        expect(typeof stats.revenueGrowth[period]).toBe('number');
      }
    });

    it('should handle dashboard with no orders gracefully', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const stats = res.body.data.stats;
      expect(stats.totalRevenue.all).toBe(0);
      expect(stats.totalOrders.all).toBe(0);
    });

    it('should require admin role for dashboard access', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Sales Report - Contract & Filtering', () => {
    beforeEach(async () => {
      // Create sample orders for testing
      for (let i = 0; i < 3; i++) {
        const order = await Order.create({
          userId: customer.id,
          orderNumber: `TEST-${Date.now()}-${i}`,
          totalAmount: 100 + (i * 50),
          subtotal: 100 + (i * 50),
          tax: 0,
          shippingCost: 0,
          discount: 0,
          status: 'completed',
          paymentMethod: 'credit_card',
          paymentStatus: 'completed',
          shippingAddress: {
            fullName: 'Test',
            phone: '123',
            addressLine1: '123',
            city: 'Test'
          }
        });

        await OrderItem.create({
          orderId: order.id,
          productId: testProduct.id,
          productName: testProduct.name,
          quantity: 1,
          price: order.totalAmount,
          totalPrice: order.totalAmount
        });
      }
    });

    it('should return sales report with required date parameters', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
    });

    it('should reject sales report without date range', async () => {
      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should group data by day correctly', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          groupBy: 'day'
        });

      expect(res.status).toBe(200);

      const report = res.body.data.report;
      if (report.length > 0) {
        report.forEach(item => {
          expect(item.date).toBeDefined();
          expect(/^\d{4}-\d{2}-\d{2}$/.test(item.date)).toBe(true);
          expect(typeof item.revenue).toBe('number');
          expect(typeof item.orders).toBe('number');
          expect(typeof item.averageOrderValue).toBe('number');
        });
      }
    });

    it('should group data by week', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 60);
      const endDate = new Date();

      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          groupBy: 'week'
        });

      expect(res.status).toBe(200);

      const report = res.body.data.report;
      if (report.length > 0) {
        report.forEach(item => {
          expect(/^\d{4}-W\d{2}$/.test(item.date)).toBe(true);
        });
      }
    });

    it('should group data by month', async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      const endDate = new Date();

      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          groupBy: 'month'
        });

      expect(res.status).toBe(200);

      const report = res.body.data.report;
      if (report.length > 0) {
        report.forEach(item => {
          expect(/^\d{4}-\d{2}$/.test(item.date)).toBe(true);
        });
      }
    });

    it('should calculate correct summary totals', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        });

      expect(res.status).toBe(200);

      const summary = res.body.data.summary;
      expect(typeof summary.totalRevenue).toBe('number');
      expect(typeof summary.totalOrders).toBe('number');
      expect(typeof summary.averageOrderValue).toBe('number');

      if (summary.totalOrders > 0) {
        expect(summary.averageOrderValue).toBe(
          Math.round((summary.totalRevenue / summary.totalOrders) * 100) / 100
        );
      }
    });
  });

  describe('Revenue Analytics - Period Filtering & Types', () => {
    it('should support 7days period filter', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '7days' });

      expect(res.status).toBe(200);
      expect(res.body.data.chartData).toBeDefined();
    });

    it('should support 30days period filter', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      expect(res.status).toBe(200);
      expect(res.body.data.chartData).toBeDefined();
    });

    it('should support 90days period filter', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '90days' });

      expect(res.status).toBe(200);
    });

    it('should support 1year period filter', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '1year' });

      expect(res.status).toBe(200);
    });

    it('should support all period filter', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: 'all' });

      expect(res.status).toBe(200);
    });

    it('should return array for chartData', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      expect(Array.isArray(res.body.data.chartData)).toBe(true);
    });

    it('should return array for revenueByCategory', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      expect(Array.isArray(res.body.data.revenueByCategory)).toBe(true);
    });

    it('should return array for revenueByPayment', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      expect(Array.isArray(res.body.data.revenueByPayment)).toBe(true);
    });

    it('should ensure all chart data items have required fields', async () => {
      // Create a test order
      const order = await Order.create({
        userId: customer.id,
        orderNumber: `CHART-${Date.now()}`,
        totalAmount: 500,
        subtotal: 500,
        tax: 0,
        shippingCost: 0,
        discount: 0,
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        shippingAddress: {
          fullName: 'Test',
          phone: '123',
          addressLine1: '123',
          city: 'Test'
        }
      });

      await OrderItem.create({
        orderId: order.id,
        productId: testProduct.id,
        productName: testProduct.name,
        quantity: 5,
        price: 100,
        totalPrice: 500
      });

      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      expect(res.status).toBe(200);

      const chartData = res.body.data.chartData;
      if (chartData.length > 0) {
        chartData.forEach(item => {
          expect(item.date).toBeDefined();
          expect(typeof item.revenue).toBe('number');
          expect(typeof item.orders).toBe('number');
        });
      }
    });

    it('should ensure revenue by category items have percentage field', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      const revenueByCategory = res.body.data.revenueByCategory;
      if (revenueByCategory.length > 0) {
        revenueByCategory.forEach(item => {
          expect(item.categoryName).toBeDefined();
          expect(typeof item.revenue).toBe('number');
          expect(typeof item.percentage).toBe('number');
          expect(item.percentage).toBeGreaterThanOrEqual(0);
          expect(item.percentage).toBeLessThanOrEqual(100);
        });
      }
    });

    it('should sort revenue by category descending', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '30days' });

      const revenueByCategory = res.body.data.revenueByCategory;
      if (revenueByCategory.length > 1) {
        for (let i = 0; i < revenueByCategory.length - 1; i++) {
          expect(revenueByCategory[i].revenue).toBeGreaterThanOrEqual(
            revenueByCategory[i + 1].revenue
          );
        }
      }
    });
  });

  describe('Admin Access Control', () => {
    it('should reject dashboard access without token', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('should reject sales report access by customer', async () => {
      const res = await request(app)
        .get('/api/admin/sales-report')
        .set('Authorization', `Bearer ${customerToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        });

      expect(res.status).toBe(403);
    });

    it('should reject revenue analytics access by customer', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
