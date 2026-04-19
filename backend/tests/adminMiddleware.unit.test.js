const { admin } = require('../middleware/admin');

function createRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('admin middleware', () => {
  it('calls next when user role is admin', () => {
    const req = { user: { role: 'admin' } };
    const res = createRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns AppError through next for non-admin users', () => {
    const req = { user: { role: 'customer' } };
    const res = createRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      status: 403,
      message: 'Access denied. Admin privileges required.',
    });
  });

  it('returns AppError through next when user is missing', () => {
    const req = {};
    const res = createRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      status: 403,
      message: 'Access denied. Admin privileges required.',
    });
  });
});
