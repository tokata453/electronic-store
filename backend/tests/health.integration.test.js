const request = require('supertest');
const app = require('../server');

describe('health and api info endpoints', () => {
  it('GET /health returns 200', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('OK');
  });

  it('GET /api returns API metadata', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.endpoints).toBeTypeOf('object');
  });
});
