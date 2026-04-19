/**
 * Cart Flow & Merge Tests
 * 
 * Tests guest cart handling, cart merging on login, stock validation,
 * price change detection, and cleanup of unavailable products.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
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

  describe('Guest Cart Creation & Management', () => {
    it('should create cart for guest with session ID', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', guestSessionId)
        .send({
          productId: testProduct1.id,
          quantity: 1
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cartId).toBeDefined();
      expect(res.body.data.item).toBeDefined();

      // Verify cart exists in DB
      const cart = await Cart.findOne({ where: { sessionId: guestSessionId } });
      expect(cart).toBeDefined();
      expect(cart.userId).toBeNull();
    });

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
    it('should merge guest cart into empty user cart', async () => {
      const sessionId = `merge-test-${Date.now()}`;

      // Add items to guest cart
      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct1.id, quantity: 2 });

      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct2.id, quantity: 1 });

      // Merge carts
      const mergeRes = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId });

      expect(mergeRes.status).toBe(200);
      expect(mergeRes.body.success).toBe(true);
      expect(mergeRes.body.data.mergedItems).toBe(2);

      // Verify user cart now contains the items
      const userCartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(userCartRes.body.data.items).toHaveLength(2);
    });

    it('should merge guest cart with existing user cart items', async () => {
      const sessionId = `merge-existing-${Date.now()}`;

      // Add item to user cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 1 });

      // Add items to guest cart
      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct1.id, quantity: 2 });

      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct2.id, quantity: 1 });

      // Merge carts
      const mergeRes = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId });

      expect(mergeRes.status).toBe(200);

      // Verify merge: should combine quantities for product1
      const userCartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      const product1Item = userCartRes.body.data.items.find(
        item => item.productId === testProduct1.id
      );

      expect(product1Item).toBeDefined();
      expect(product1Item.quantity).toBe(3); // 1 + 2
    });

    it('should cap merged quantity at available stock', async () => {
      const sessionId = `merge-capped-${Date.now()}`;

      // Guest attempts to add more than available stock
      await request(app)
        .post('/api/cart/items')
        .set('X-Session-ID', sessionId)
        .send({ productId: testProduct2.id, quantity: 10 }); // Stock is only 5

      // Merge carts
      const mergeRes = await request(app)
        .post('/api/cart/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId });

      expect(mergeRes.status).toBe(200);

      // Verify quantity was capped at stock
      const userCartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      const product2Item = userCartRes.body.data.items.find(
        item => item.productId === testProduct2.id
      );

      expect(product2Item.quantity).toBeLessThanOrEqual(5);
    });

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

  describe('Cart Validation & Stock Checks', () => {
    it('should detect out-of-stock products', async () => {
      // Add out-of-stock product to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct3.id, quantity: 1 });

      // Validate cart
      const validateRes = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(validateRes.status).toBe(200);
      expect(validateRes.body.data.issues.length).toBeGreaterThan(0);

      const stockIssue = validateRes.body.data.issues.find(
        issue => issue.type === 'stock' || issue.type === 'removed'
      );
      expect(stockIssue).toBeDefined();
    });

    it('should remove unavailable products from cart during validation', async () => {
      // Add product to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 1 });

      // Deactivate the product
      await testProduct1.update({ isActive: false });

      // Validate cart
      const validateRes = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(validateRes.status).toBe(200);
      expect(validateRes.body.data.removedItems).toBeGreaterThan(0);

      // Reactivate for other tests
      await testProduct1.update({ isActive: true });
    });

    it('should detect price changes on cart items', async () => {
      // Add item to cart with current price
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 1 });

      // Change product price
      const originalPrice = testProduct1.salePrice;
      await testProduct1.update({ salePrice: 50 });

      // Validate cart
      const validateRes = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(validateRes.status).toBe(200);

      const priceIssue = validateRes.body.data.issues.find(
        issue => issue.type === 'price_change'
      );
      expect(priceIssue).toBeDefined();

      // Restore price
      await testProduct1.update({ salePrice: originalPrice });
    });

    it('should detect insufficient stock for requested quantity', async () => {
      // Add item with quantity exceeding stock
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct2.id, quantity: 10 }); // Stock is 5

      // Validate cart
      const validateRes = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(validateRes.status).toBe(200);

      const stockIssue = validateRes.body.data.issues.find(
        issue => issue.type === 'stock'
      );
      expect(stockIssue).toBeDefined();
      expect(stockIssue.availableStock).toBe(5);
    });
  });

  describe('Cart Item Quantity Management', () => {
    it('should update item quantity in cart', async () => {
      // Add item to cart
      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 1 });

      const itemId = addRes.body.data.item.id;

      // Update quantity
      const updateRes = await request(app)
        .put(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 5 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.item.quantity).toBe(5);
    });

    it('should reject quantity update exceeding available stock', async () => {
      // Add item to cart
      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct2.id, quantity: 1 });

      const itemId = addRes.body.data.item.id;

      // Attempt to update beyond stock limit
      const updateRes = await request(app)
        .put(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 100 });

      expect(updateRes.status).toBe(400);
    });

    it('should combine quantities when adding duplicate product', async () => {
      // Add first quantity
      const res1 = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 2 });

      // Add same product again
      const res2 = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 3 });

      expect(res2.status).toBe(200);
      expect(res2.body.data.item.quantity).toBe(5); // 2 + 3
    });
  });

  describe('Cart Expiration & Cleanup', () => {
    it('should extend cart expiration on item addition', async () => {
      const addRes = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct1.id, quantity: 1 });

      const cartId = addRes.body.data.cartId;
      const cart = await Cart.findByPk(cartId);

      expect(cart.expiresAt).toBeDefined();
      expect(new Date(cart.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });
});
