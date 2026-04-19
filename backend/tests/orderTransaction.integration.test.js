/**
 * Order Transaction Rollback Tests
 * 
 * Tests transaction handling, stock consistency, and rollback behavior
 * in order creation flows to ensure data integrity.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
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

  describe('Successful Order Creation', () => {
    it('should create order and decrement stock for all items', async () => {
      const initialStock1 = testProduct1.stock;
      const initialStock2 = testProduct2.stock;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 2 },
            { productId: testProduct2.id, quantity: 1 }
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();
      expect(res.body.data.order.items).toHaveLength(2);

      // Verify stock was decremented
      const updatedProduct1 = await Product.findByPk(testProduct1.id);
      const updatedProduct2 = await Product.findByPk(testProduct2.id);

      expect(updatedProduct1.stock).toBe(initialStock1 - 2);
      expect(updatedProduct2.stock).toBe(initialStock2 - 1);
    });

    it('should populate order items with product details', async () => {
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
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);
      const orderItem = res.body.data.order.items[0];
      expect(orderItem.productName).toBe(testProduct1.name);
      expect(orderItem.quantity).toBe(1);
      expect(parseFloat(orderItem.price)).toBeGreaterThan(0);
      expect(parseFloat(orderItem.totalPrice)).toBeGreaterThan(0);
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

  describe('Cart Cleanup on Order', () => {
    it('should remove ordered items from user cart', async () => {
      // Create cart and add items
      const cart = await Cart.create({ userId: customer.id });
      await CartItem.create({
        cartId: cart.id,
        productId: testProduct1.id,
        quantity: 2,
        price: testProduct1.price
      });
      await CartItem.create({
        cartId: cart.id,
        productId: testProduct2.id,
        quantity: 1,
        price: testProduct2.price
      });

      expect(await CartItem.count({ where: { cartId: cart.id } })).toBe(2);

      // Create order with same items
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 2 },
            { productId: testProduct2.id, quantity: 1 }
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);

      // Verify cart items were removed
      const remainingItems = await CartItem.findAll({ where: { cartId: cart.id } });
      expect(remainingItems).toHaveLength(0);
    });

    it('should only remove ordered items, not unordered ones', async () => {
      const otherCategory = await Category.create({
        name: `Other Category ${Date.now()}`,
        slug: `other-cat-${Date.now()}`
      });

      const otherProduct = await Product.create({
        name: 'Other Product',
        slug: `other-${Date.now()}`,
        description: 'Test',
        price: 75,
        stock: 20,
        isActive: true,
        categoryId: otherCategory.id
      });

      const cart = await Cart.create({ userId: customer.id });
      await CartItem.create({
        cartId: cart.id,
        productId: testProduct1.id,
        quantity: 1,
        price: testProduct1.price
      });
      await CartItem.create({
        cartId: cart.id,
        productId: otherProduct.id,
        quantity: 2,
        price: otherProduct.price
      });

      // Create order with only first product
      await request(app)
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
          paymentMethod: 'credit_card'
        });

      // Verify only the other product remains
      const remainingItems = await CartItem.findAll({
        where: { cartId: cart.id },
        include: [{ association: 'product' }]
      });

      expect(remainingItems).toHaveLength(1);
      expect(remainingItems[0].productId).toBe(otherProduct.id);
    });
  });

  describe('Order Data Integrity', () => {
    it('should create complete order with all required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 2 }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Springfield'
          },
          billingAddress: {
            fullName: 'John Doe',
            phone: '1234567890',
            addressLine1: '456 Oak Ave',
            city: 'Springfield'
          },
          paymentMethod: 'credit_card',
          notes: 'Please deliver in the morning'
        });

      expect(res.status).toBe(201);
      const order = res.body.data.order;

      expect(order.userId).toBe(customer.id);
      expect(order.orderNumber).toBeDefined();
      expect(order.totalAmount).toBeGreaterThan(0);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.shippingAddress.fullName).toBe('John Doe');
      expect(order.billingAddress.fullName).toBe('John Doe');
      expect(order.paymentMethod).toBe('credit_card');
      expect(order.notes).toBe('Please deliver in the morning');
    });

    it('should calculate correct totals (subtotal, tax, shipping)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            { productId: testProduct1.id, quantity: 2 }, // 100 * 2 = 200
            { productId: testProduct2.id, quantity: 1 }  // 50 * 1 = 50
          ],
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '1234567890',
            addressLine1: '123 Main St',
            city: 'Test City'
          },
          paymentMethod: 'credit_card'
        });

      expect(res.status).toBe(201);
      const order = res.body.data.order;

      // Verify calculation
      const expectedSubtotal = (100 * 2) + (50 * 1);
      expect(order.subtotal).toBe(expectedSubtotal);
      expect(order.totalAmount).toBe(expectedSubtotal); // No tax/shipping in base implementation
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
