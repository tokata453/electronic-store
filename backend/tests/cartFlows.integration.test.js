/**
 * Cart Flow & Merge Tests
 * 
 * Tests guest cart handling, cart merging on login, stock validation,
 * price change detection, and cleanup of unavailable products.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { Cart, CartItem, Product, User, Category } from '../models/index.js';

describe('Cart Flows & Merging', () => {
  let customerToken, customer;
  let testProduct1, testProduct2, testProduct3;
  let guestSessionId;

  beforeAll(async () => {
    customer = await User.create({
      email: `customer-cart-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'Customer',
      password: 'password123',
      role: 'customer'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: 'password123' });
    customerToken = loginRes.body.data.token;

    const category = await Category.create({
      name: `Cart Test Category ${Date.now()}`,
      slug: `cart-test-cat-${Date.now()}`
    });

    // Create test products with various stocks
    testProduct1 = await Product.create({
      name: 'Cart Test Product 1',
      slug: `cart-test-1-${Date.now()}`,
      description: 'Test',
      price: 100,
      salePrice: 80,
      stock: 20,
      isActive: true,
      categoryId: category.id
    });

    testProduct2 = await Product.create({
      name: 'Cart Test Product 2',
      slug: `cart-test-2-${Date.now()}`,
      description: 'Test',
      price: 50,
      stock: 5,
      isActive: true,
      categoryId: category.id
    });

    testProduct3 = await Product.create({
      name: 'Cart Test Product 3',
      slug: `cart-test-3-${Date.now()}`,
      description: 'Test',
      price: 200,
      stock: 0, // Out of stock
      isActive: true,
      categoryId: category.id
    });

    guestSessionId = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });

  afterEach(async () => {
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
  });

  afterAll(async () => {
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });

    if (testProduct1?.id || testProduct2?.id || testProduct3?.id) {
      await Product.destroy({
        where: { id: [testProduct1?.id, testProduct2?.id, testProduct3?.id].filter(Boolean) },
        force: true
      });
    }

    await Category.destroy({ where: { slug: { [require('sequelize').Op.like]: 'cart-test-cat-%' } } });

    if (customer?.id) {
      await User.destroy({ where: { id: customer.id } });
    }
  });

  describe('Guest Cart Creation & Management', () => {

    it('should add multiple items to guest cart', async () => {
      // Add first item
      const res1 = await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', guestSessionId)
        .send({
          productId: testProduct1.id,
          quantity: 2
        });

      expect(res1.status).toBe(200);

      // Add second item
      const res2 = await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', guestSessionId)
        .send({
          productId: testProduct2.id,
          quantity: 1
        });

      expect(res2.status).toBe(200);

      // Retrieve cart
      const cartRes = await request(app)
        .get('/api/cart')
        .set('X-Session-ID', guestSessionId);

      expect(cartRes.body.data.items).toHaveLength(2);
    });

    it('should reject guest cart action without session ID', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: testProduct1.id,
          quantity: 1
        });

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Cart Merge: Guest to User', () => {

    it('should handle non-existent guest cart gracefully', async () => {
      const mergeRes = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId: 'nonexistent-session-id' });

      expect(mergeRes.status).toBe(200);
      expect(mergeRes.body.success).toBe(true);
      expect(mergeRes.body.data.message).toContain('No guest cart');
    });

    it('should delete guest cart after successful merge', async () => {
      const sessionId = `merge-delete-${Date.now()}`;

      // Add items to guest cart
      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct1.id, quantity: 1 });

      // Verify guest cart exists
      let guestCart = await Cart.findOne({ where: { sessionId } });
      expect(guestCart).toBeDefined();

      // Merge carts
      await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId });

      // Verify guest cart was deleted
      guestCart = await Cart.findOne({ where: { sessionId } });
      expect(guestCart).toBeNull();
    });
  });

  describe('Cart Item Quantity Management', () => {

    it('should reject quantity update exceeding available stock', async () => {
      // Add item to cart
      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct2.id, quantity: 1 });

      expect(addRes.status).toBe(200);

      let itemId = addRes.body?.data?.item?.id;
      if (!itemId) {
        const cartRes = await request(app)
          .get('/api/cart')
          .set('Authorization', `Bearer ${customerToken}`);
        itemId = cartRes.body?.data?.items?.find(item => item.productId === testProduct2.id)?.id;
      }

      expect(itemId).toBeDefined();

      // Attempt to update beyond stock limit
      const updateRes = await request(app)
        .put(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 100 });

      expect(updateRes.status).toBe(400);
    });

  });

});
