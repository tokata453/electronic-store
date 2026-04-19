const request = require('supertest');
const app = require('../server');

describe('protected route guards', () => {
  it('rejects /api/auth/me without token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects /api/orders without token', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects /api/users/profile without token', async () => {
    const response = await request(app).get('/api/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects admin endpoints for invalid token', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
