const request = require('supertest');
const app = require('../server');

describe('happy path integration flows', () => {
  const state = {
    adminToken: null,
    customerToken: null,
    createdCategoryId: null,
    createdProductId: null,
    createdOrderId: null,
    guestSessionId: `guest-test-${Date.now()}`,
  };

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@iceelectronics.com', password: 'password123' });

    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.success).toBe(true);

    state.adminToken = adminLogin.body.data.token;

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sokha@example.com', password: 'password123' });

    if (customerLogin.status === 200) {
      state.customerToken = customerLogin.body.data.token;
      return;
    }

    const fallbackEmail = `integration_${Date.now()}@example.com`;
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Integration',
        lastName: 'Customer',
        email: fallbackEmail,
        password: 'password123',
        phone: '+85512345678',
      });

    expect(register.status).toBe(201);
    state.customerToken = register.body.data.token;
  });

  it('creates, updates, and soft-deletes a category as admin', async () => {
    const create = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({
        name: `Integration Category ${Date.now()}`,
        slug: `integration-category-${Date.now()}`,
        description: 'integration test category',
        sortOrder: 77,
      });

    expect(create.status).toBe(201);
    expect(create.body.success).toBe(true);
    state.createdCategoryId = create.body.data.category.id;

    const update = await request(app)
      .put(`/api/categories/${state.createdCategoryId}`)
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({ description: 'updated integration category' });

    expect(update.status).toBe(200);
    expect(update.body.success).toBe(true);
    expect(update.body.data.category.description).toBe('updated integration category');

    const remove = await request(app)
      .delete(`/api/categories/${state.createdCategoryId}`)
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(remove.status).toBe(200);
    expect(remove.body.success).toBe(true);
  });

  it('creates, updates, and deletes a product as admin', async () => {
    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({
        name: `Integration Product ${Date.now()}`,
        slug: `integration-product-${Date.now()}`,
        description: 'integration product',
        price: 120,
        salePrice: 99,
        sku: `INT-${Date.now()}`,
        stock: 5,
        categoryId: 1,
      });

    expect(create.status).toBe(201);
    expect(create.body.success).toBe(true);
    state.createdProductId = create.body.data.product.id;

    const update = await request(app)
      .put(`/api/products/${state.createdProductId}`)
      .set('Authorization', `Bearer ${state.adminToken}`)
      .send({ stock: 8, price: 140 });

    expect(update.status).toBe(200);
    expect(update.body.success).toBe(true);
    expect(Number(update.body.data.product.stock)).toBe(8);

    const remove = await request(app)
      .delete(`/api/products/${state.createdProductId}`)
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(remove.status).toBe(200);
    expect(remove.body.success).toBe(true);
  });

  it('returns profile and user list for proper roles', async () => {
    const profile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${state.customerToken}`);

    expect(profile.status).toBe(200);
    expect(profile.body.success).toBe(true);
    expect(profile.body.data.user.email).toBeTruthy();

    const users = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${state.adminToken}`);

    expect(users.status).toBe(200);
    expect(users.body.success).toBe(true);
    expect(Array.isArray(users.body.data.users)).toBe(true);
  });
});
