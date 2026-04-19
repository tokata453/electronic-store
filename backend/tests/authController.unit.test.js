const request = require('supertest');
const app = require('../server');
const { Op } = require('sequelize');
const { User } = require('../models');

describe('auth endpoints (DB-backed)', () => {
  afterAll(async () => {
    await User.destroy({
      where: {
        email: {
          [Op.like]: 'auth_test_%@example.com'
        }
      },
      force: true
    });
  });

  it('registers a new customer and returns token plus user', async () => {
    const email = `auth_test_${Date.now()}@example.com`;

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: 'password123',
        phone: '+85512345678',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTypeOf('string');
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.role).toBe('customer');
  });

  it('rejects register requests missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing-fields@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('logs in a valid user and returns token plus user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iceelectronics.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTypeOf('string');
    expect(response.body.data.user.email).toBe('admin@iceelectronics.com');
    expect(response.body.data.user.role).toBe('admin');
  });

  it('returns current user from /api/auth/me for valid token', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iceelectronics.com',
        password: 'password123',
      });

    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(me.status).toBe(200);
    expect(me.body.success).toBe(true);
    expect(me.body.data.user.email).toBe('admin@iceelectronics.com');
    expect(me.body.data.user.role).toBe('admin');
  });
});
