const request = require('supertest');
const app = require('../server');

describe('route integration coverage', () => {
  it('rejects login when password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@iceelectronics.com' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns categories for public route', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.endpoints).toBeTypeOf('object');
  });

  it('returns 404 payload for unknown route', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Route not found');
  });

  it('rejects category creation without auth token', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({ name: `Unauthorized Category ${Date.now()}` });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
