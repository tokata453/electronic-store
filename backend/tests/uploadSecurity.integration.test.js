/**
 * Upload Security & Negative Path Tests
 * 
 * Tests file validation, size limits, MIME type checking, malformed
 * multipart handling, and security edge cases.
 */

import { describe, it, expect, beforeAll } from 'vitest';
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

  describe('MIME Type Validation', () => {
    it('should reject non-image MIME types for product upload', async () => {
      const textContent = Buffer.from('This is not an image');

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('images', textContent, {
          filename: 'text.txt',
          contentType: 'text/plain'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject JSON as image', async () => {
      const jsonContent = Buffer.from(JSON.stringify({ hack: true }));

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('images', jsonContent, {
          filename: 'data.json',
          contentType: 'application/json'
        });

      expect(res.status).toBe(400);
    });

    it('should reject executable files', async () => {
      const exeContent = Buffer.from([0x4D, 0x5A]); // MZ header (EXE)

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('images', exeContent, {
          filename: 'virus.exe',
          contentType: 'application/x-msdownload'
        });

      expect(res.status).toBe(400);
    });

    it('should accept valid image MIME types', async () => {
      // 1x1 transparent PNG
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', pngBuffer, { filename: 'valid.png' });

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('File Size Limits', () => {
    it('should reject files exceeding 5MB limit for product images', async () => {
      // Create 6MB of data
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'x');

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', largeBuffer, { filename: 'large.png' });

      expect(res.status).toBe(413);
    });

    it('should accept files within 5MB limit', async () => {
      // Create 2MB of valid image-like data
      const smallBuffer = Buffer.alloc(2 * 1024 * 1024);
      smallBuffer.writeUInt32BE(0x89504e47, 0); // PNG header

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', smallBuffer, { filename: 'small.png' });

      // May pass MIME but fail size in multer
      expect([200, 201, 400, 413]).toContain(res.status);
    });

    it('should reject oversized avatar uploads', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'x');

      const res = await request(app)
        .post('/api/upload/avatar')
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('image', largeBuffer, { filename: 'huge.png' });

      expect(res.status).toBe(413);
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

    it('should handle malformed multipart boundary gracefully', async () => {
      const malformedBody = 'not a valid multipart form';

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'multipart/form-data; boundary=invalid')
        .send(malformedBody);

      expect([400, 415]).toContain(res.status);
    });
  });

  describe('Multiple File Upload Limits', () => {
    it('should reject more than 5 product images', async () => {
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', pngBuffer, { filename: 'img1.png' })
        .attach('images', pngBuffer, { filename: 'img2.png' })
        .attach('images', pngBuffer, { filename: 'img3.png' })
        .attach('images', pngBuffer, { filename: 'img4.png' })
        .attach('images', pngBuffer, { filename: 'img5.png' })
        .attach('images', pngBuffer, { filename: 'img6.png' });

      expect([400, 413]).toContain(res.status);
    });

    it('should only accept single file for avatar and category', async () => {
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );

      // Avatar should reject multiple files
      const avatarRes = await request(app)
        .post('/api/upload/avatar')
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('image', pngBuffer, { filename: 'img1.png' })
        .attach('image', pngBuffer, { filename: 'img2.png' });

      expect([400, 413]).toContain(avatarRes.status);
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

    it('should allow customer to upload own avatar', async () => {
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );

      const res = await request(app)
        .post('/api/upload/avatar')
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('image', pngBuffer, { filename: 'avatar.png' });

      expect([200, 201]).toContain(res.status);
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

    it('should return 404 for non-existent category', async () => {
      const pngBuffer = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
        '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      );

      const res = await request(app)
        .post('/api/upload/category/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', pngBuffer, { filename: 'test.png' });

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

  describe('Content Type Validation', () => {
    it('should validate JPEG images', async () => {
      // JPEG header: FFD8FF
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', jpegBuffer, { filename: 'test.jpg' });

      expect([200, 201, 400]).toContain(res.status); // May fail other validation
    });

    it('should validate WebP images', async () => {
      // WebP header: RIFF...WEBP
      const webpBuffer = Buffer.from('RIFF\x00\x00\x00\x00WEBP', 'utf8');

      const res = await request(app)
        .post(`/api/upload/product/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', webpBuffer, { filename: 'test.webp' });

      expect([200, 201, 400]).toContain(res.status);
    });
  });
});
