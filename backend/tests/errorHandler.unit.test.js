const { notFoundHandler, globalErrorHandler } = require('../middleware/errorHandler');

function createRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('error handlers', () => {
  it('returns structured 404 response from notFoundHandler', () => {
    const req = { originalUrl: '/api/missing' };
    const res = createRes();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Route not found',
        status: 404,
        path: '/api/missing',
      },
    });
  });

  it('returns error status and message from globalErrorHandler', () => {
    const req = {};
    const res = createRes();
    const next = vi.fn();
    const err = { status: 401, message: 'Invalid token' };

    globalErrorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid token',
        status: 401,
      },
    });
  });
});
