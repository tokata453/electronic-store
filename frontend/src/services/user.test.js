import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getUserProfile, updateUserProfile, uploadAvatar } from './user';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('user service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets profile', async () => {
    api.get.mockResolvedValue({ data: { user: { id: 1 } } });

    const result = await getUserProfile();

    expect(api.get).toHaveBeenCalledWith('/api/users/profile');
    expect(result).toEqual({ user: { id: 1 } });
  });

  it('updates profile', async () => {
    api.put.mockResolvedValue({ data: { user: { id: 1 } } });

    const payload = { firstName: 'Test' };
    const result = await updateUserProfile(payload);

    expect(api.put).toHaveBeenCalledWith('/api/users/profile', payload);
    expect(result).toEqual({ user: { id: 1 } });
  });

  it('uploads avatar with multipart header', async () => {
    api.post.mockResolvedValue({ data: { avatarUrl: 'url' } });
    const formData = new FormData();

    const result = await uploadAvatar(formData);

    expect(api.post).toHaveBeenCalledWith('/api/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result).toEqual({ avatarUrl: 'url' });
  });
});
