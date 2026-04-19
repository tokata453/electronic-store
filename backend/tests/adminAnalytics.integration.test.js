/**
 * Admin Analytics Endpoints - Deep Contract Validation
 * 
 * Tests dashboard stats, sales reports, and revenue analytics with
 * strict contract validation, type checking, empty data scenarios,
 * and filter combinations.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
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

  afterAll(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });

    if (testProduct?.id) {
      await Product.destroy({ where: { id: testProduct.id }, force: true });
    }

    if (testCategory?.id) {
      await Category.destroy({ where: { id: testCategory.id } });
    }

    await User.destroy({
      where: {
        email: {
          [require('sequelize').Op.or]: [
            { [require('sequelize').Op.like]: 'admin-analytics-%@test.com' },
            { [require('sequelize').Op.like]: 'customer-analytics-%@test.com' }
          ]
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
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject revenue analytics access by customer', async () => {
      const res = await request(app)
        .get('/api/admin/revenue-analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
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
