import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getCategories, getCategoryById } from './categories';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('categories service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sorted categories', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          categories: [
            { id: 2, name: 'B', sortOrder: 2 },
            { id: 1, name: 'A', sortOrder: 1 },
          ],
        },
      },
    });

    const categories = await getCategories();

    expect(api.get).toHaveBeenCalledWith('/api/categories');
    expect(categories.map((category) => category.id)).toEqual([1, 2]);
  });

  it('gets category by id', async () => {
    api.get.mockResolvedValue({ data: { data: { category: { id: 1 } } } });

    const category = await getCategoryById(1);

    expect(api.get).toHaveBeenCalledWith('/api/categories/1');
    expect(category).toEqual({ id: 1 });
  });
});
