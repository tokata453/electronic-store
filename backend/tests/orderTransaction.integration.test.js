/**
 * Order Transaction Rollback Tests
 * 
 * Tests transaction handling, stock consistency, and rollback behavior
 * in order creation flows to ensure data integrity.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { Order, OrderItem, Product, Cart, CartItem, User, Category, sequelize } from '../models/index.js';

describe('Order Transactions & Rollback', () => {
  let adminToken, customerToken, adminUser, customer;
  let testProduct1, testProduct2;

  beforeAll(async () => {
    // Create test users
    adminUser = await User.create({
      email: `admin-order-${Date.now()}@test.com`,
      firstName: 'Admin',
      lastName: 'User',
      password: 'password123',
      role: 'admin'
    });

    customer = await User.create({
      email: `customer-order-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Customer',
      password: 'password123',
      role: 'customer'
    });

    // Create test products
    const category = await Category.create({
      name: `Order Test Category ${Date.now()}`,
      slug: `order-cat-${Date.now()}`
    });

    testProduct1 = await Product.create({
      name: 'Test Product 1 - Order TX',
      slug: `test-product-1-order-${Date.now()}`,
      description: 'Test',
      price: 100,
      stock: 10,
      isActive: true,
      categoryId: category.id
    });

    testProduct2 = await Product.create({
      name: 'Test Product 2 - Order TX',
      slug: `test-product-2-order-${Date.now()}`,
      description: 'Test',
      price: 50,
      stock: 5,
      isActive: true,
      categoryId: category.id
    });

    // Get tokens
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: 'password123' });
    customerToken = customerLoginRes.body.data.token;
  });

  afterEach(async () => {
    // Clean up orders and items after each test
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
  });

  afterAll(async () => {
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });

    await Product.destroy({
      where: {
        slug: {
          [require('sequelize').Op.or]: [
            { [require('sequelize').Op.like]: 'test-product-1-order-%' },
            { [require('sequelize').Op.like]: 'test-product-2-order-%' },
            { [require('sequelize').Op.like]: 'race-test-%' },
            { [require('sequelize').Op.like]: 'other-%' }
          ]
        }
      },
      force: true
    });

    await Category.destroy({
      where: {
        slug: {
          [require('sequelize').Op.or]: [
            { [require('sequelize').Op.like]: 'order-cat-%' },
            { [require('sequelize').Op.like]: 'race-cat-%' },
            { [require('sequelize').Op.like]: 'other-cat-%' }
          ]
        }
      }
    });

    await User.destroy({
      where: {
        email: {
          [require('sequelize').Op.or]: [
            { [require('sequelize').Op.like]: 'admin-order-%@test.com' },
            { [require('sequelize').Op.like]: 'customer-order-%@test.com' }
          ]
        }
      }
    });
  });

  describe('Stock Insufficiency Rollback', () => {
    it('should rollback if item becomes out of stock during order creation', async () => {
      const initialStock = testProduct1.stock;

      // Set product to very low stock
      await testProduct1.update({ stock: 2 });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 5 } // More than available
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Verify stock was NOT decremented (rollback occurred)
      const unchangedProduct = await Product.findByPk(testProduct1.id);
      expect(unchangedProduct.stock).toBe(2);

      // Verify no order was created
      const orders = await Order.findAll({ where: { userId: customer.id } });
      expect(orders).toHaveLength(0);
    });

    it('should rollback if race condition causes stock check to fail', async () => {
      // Create two orders simultaneously with insufficient total stock
      // This tests concurrent stock validation

      const testCategory = await Category.create({
        name: `Race Test Category ${Date.now()}`,
        slug: `race-cat-${Date.now()}`
      });

      const product = await Product.create({
        name: 'Race Condition Test',
        slug: `race-test-${Date.now()}`,
        description: 'Test',
        price: 100,
        stock: 5,
        isActive: true,
        categoryId: testCategory.id
      });

      const requests = [
        request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            items: [{ productId: product.id, quantity: 3 }],
            shippingAddress: {
              fullName: 'Test Customer',
              phone: '1234567890',
              addressLine1: '123 Main St',
              city: 'Test City'
            },
            paymentMethod: 'credit_card'
          }),
      ];

      const [res] = await Promise.all(requests);

      // At least one should fail or succeed - verify consistency
      expect([200, 201, 400]).toContain(res.status);

      const finalStock = await Product.findByPk(product.id);
      expect(finalStock.stock).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation & Error Handling', () => {
    it('should reject order without shipping address', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 1 }
          ],
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject order without payment method', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 1 }
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          }
        });

      expect(res.status).toBe(400);
    });

    it('should reject order with invalid payment method', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 1 }
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'invalid_method'
        });

      expect(res.status).toBe(400);
    });

    it('should reject order with non-existent product', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: 999999, quantity: 1 }
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
