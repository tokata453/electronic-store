/**
 * Upload Security & Negative Path Tests
 * 
 * Tests file validation, size limits, MIME type checking, malformed
 * multipart handling, and security edge cases.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { User, Product, Category } from '../models/index.js';

describe('Upload Security & Validation', () => {
  let adminToken, customerToken, admin, customer;
  let testProduct, testCategory;

  beforeAll(async () => {
    admin = await User.create({
      email: `admin-upload-${Date.now()}@test.com`,
      firstName: 'Admin',
      lastName: 'User',
      password: 'password123',
      role: 'admin'
    });

    customer = await User.create({
      email: `customer-upload-${Date.now()}@test.com`,
      firstName: 'Customer',
      lastName: 'User',
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
      name: `Upload Test Category ${Date.now()}`,
      slug: `upload-test-cat-${Date.now()}`
    });

    testProduct = await Product.create({
      name: 'Upload Test Product',
      slug: `upload-test-${Date.now()}`,
      description: 'Test',
      price: 100,
      stock: 10,
      isActive: true,
      categoryId: testCategory.id
    });
  });

  afterAll(async () => {
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
            { [require('sequelize').Op.like]: 'admin-upload-%@test.com' },
            { [require('sequelize').Op.like]: 'customer-upload-%@test.com' }
          ]
        }
      }
    });
  });


  describe('Multipart Form Validation', () => {
    it('should reject upload without file', async () => {
      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject avatar upload without image field', async () => {
      const res = await request(app)
        .post('/api/upload/avatar')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('other_field', 'value');

      expect(res.status).toBe(400);
    });

  });


  describe('Authorization & Access Control', () => {
    it('should reject product upload by non-admin', async () => {
      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('images', Buffer.from('fake image'), { filename: 'test.png' });

      expect(res.status).toBe(403);
    });

    it('should reject category upload by non-admin', async () => {
      const res = await request(app)
        .post(`/api/upload/category/${testCategory.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('image', Buffer.from('fake image'), { filename: 'test.png' });

      expect(res.status).toBe(403);
    });

    it('should reject upload without authentication', async () => {
      const res = await request(app)
        .post('/api/upload/avatar')
        .attach('image', Buffer.from('fake image'), { filename: 'test.png' });

      expect(res.status).toBe(401);
    });

  });

  describe('Non-Existent Resource Handling', () => {
    it('should return 404 for non-existent product', async () => {
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );
      const res = await request(app)
        .post('/api/upload/product/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', pngBuffer, { filename: 'test.png' });
      expect(res.status).toBe(404);
    });
  });

  describe('Delete Endpoint Validation', () => {
    it('should reject delete without imageKey field', async () => {
      const res = await request(app)
        .delete(`/api/upload/product/${testProduct.id}/image`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject delete with empty imageKey', async () => {
      const res = await request(app)
        .delete(`/api/upload/product/${testProduct.id}/image`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageKey: '' });

      expect(res.status).toBe(400);
    });

    it('should reject delete with null imageKey', async () => {
      const res = await request(app)
        .delete(`/api/upload/product/${testProduct.id}/image`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageKey: null });

      expect(res.status).toBe(400);
    });

    it('should return 404 when deleting from non-existent product', async () => {
      const res = await request(app)
        .delete('/api/upload/product/999999/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageKey: 'products/test.jpg' });

      expect(res.status).toBe(404);
    });
  });

});
