const AppError = require('../utils/appError');

describe('AppError', () => {
  it('creates an error with status', () => {
    const error = new AppError('Forbidden', 403);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Forbidden');
    expect(error.status).toBe(403);
  });
});
