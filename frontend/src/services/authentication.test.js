import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authentication';
import api from './api';

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('posts login credentials', async () => {
    api.post.mockResolvedValue({ data: { ok: true } });

    const result = await authService.login('admin@example.com', 'password123');

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123',
    });
    expect(result).toEqual({ ok: true });
  });

  it('posts register payload', async () => {
    api.post.mockResolvedValue({ data: { ok: true } });

    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
    };

    const result = await authService.register(payload);

    expect(api.post).toHaveBeenCalledWith('/api/auth/register', payload);
    expect(result).toEqual({ ok: true });
  });

  it('returns null when no token exists for getCurrentUser', async () => {
    const result = await authService.getCurrentUser();

    expect(result).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('gets current user when token exists', async () => {
    localStorage.setItem('token', 'fake-token');
    api.get.mockResolvedValue({ data: { user: { id: 1 } } });

    const result = await authService.getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/api/auth/me');
    expect(result).toEqual({ user: { id: 1 } });
  });
});
