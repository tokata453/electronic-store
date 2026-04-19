process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@127.0.0.1:5432/testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect, optionalProtect } = require('../middleware/auth');

function createRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects protect when token is missing', async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      status: 401,
      message: 'Not authorized token to access',
    });
  });

  it('rejects protect when token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer bad.token.value' } };
    const res = createRes();
    const next = vi.fn();
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid token');
    });

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      status: 401,
      message: 'Invalid token',
    });
  });

  it('attaches user and calls next for valid token', async () => {
    const req = { headers: { authorization: 'Bearer good.token.value' } };
    const res = createRes();
    const next = vi.fn();

    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 10 });
    vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 10, role: 'admin', isActive: true });

    await protect(req, res, next);

    expect(req.user).toMatchObject({ id: 10, role: 'admin', isActive: true });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('optionalProtect continues without token', async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = vi.fn();

    await optionalProtect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });
});
