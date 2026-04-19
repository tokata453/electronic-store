const request = require('supertest');
const app = require('../server');

function tinyPngBuffer() {
  return Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
    '0000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
    'hex'
  );
}

describe('upload endpoints integration', () => {
  const state = {
    adminToken: null,
    customerToken: null,
  };

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@iceelectronics.com', password: 'password123' });

    expect(adminLogin.status).toBe(200);
    state.adminToken = adminLogin.body.data.token;

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sokha@example.com', password: 'password123' });

    if (customerLogin.status === 200) {
      state.customerToken = customerLogin.body.data.token;
      return;
    }

    const fallbackEmail = `upload_customer_${Date.now()}@example.com`;
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Upload',
        lastName: 'Customer',
        email: fallbackEmail,
        password: 'password123',
        phone: '+85512345678',
      });

    expect(register.status).toBe(201);
    state.customerToken = register.body.data.token;
  });

  it('rejects avatar upload without auth', async () => {
    const response = await request(app)
      .post('/api/upload/avatar')
      .attach('image', tinyPngBuffer(), 'avatar.png');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('blocks customer from product image upload', async () => {
    const response = await request(app)
      .post('/api/upload/product/1')
      .set('Authorization', `Bearer ${state.customerToken}`)
      .attach('images', tinyPngBuffer(), 'blocked.png');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns 404 for non-existent product on admin upload', async () => {
    const response = await request(app)
      .post('/api/upload/product/999999')
      .set('Authorization', `Bearer ${state.adminToken}`)
      .attach('images', tinyPngBuffer(), 'missing-product.png');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('validates delete payload requirements', async () => {
    const response = await request(app)
      .delete('/api/upload/product/1/image')
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
