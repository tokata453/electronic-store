const request = require('supertest');
const app = require('../server');

describe('admin analytics endpoints', () => {
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

    const fallbackEmail = `admin_endpoints_${Date.now()}@example.com`;
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Analytics',
        lastName: 'Customer',
        email: fallbackEmail,
        password: 'password123',
        phone: '+85512345678',
      });

    expect(register.status).toBe(201);
    state.customerToken = register.body.data.token;
  });

  it('returns admin home payload for admin token', async () => {
    const response = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.admin).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      role: 'admin',
    });
  });

  it('blocks non-admin user on admin home', async () => {
    const response = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${state.customerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns dashboard stats shape', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.stats).toMatchObject({
      totalRevenue: expect.any(Object),
      totalOrders: expect.any(Object),
      totalProducts: expect.any(Number),
      totalCustomers: expect.any(Number),
      revenueGrowth: expect.any(Object),
    });
  });

  it('validates sales-report query requirements', async () => {
    const missingDates = await request(app)
      .get('/api/admin/sales-report')
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(missingDates.status).toBe(400);
    expect(missingDates.body.success).toBe(false);

    const today = new Date();
    const last30 = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    const startDate = last30.toISOString();
    const endDate = today.toISOString();

    const valid = await request(app)
      .get('/api/admin/sales-report')
      .set('Authorization', `Bearer ${state.adminToken}`)
      .query({ startDate, endDate, groupBy: 'day' });

    expect(valid.status).toBe(200);
    expect(valid.body.success).toBe(true);
    expect(Array.isArray(valid.body.data.report)).toBe(true);
    expect(valid.body.data.summary).toMatchObject({
      totalRevenue: expect.any(Number),
      totalOrders: expect.any(Number),
      averageOrderValue: expect.any(Number),
    });
  });
});
