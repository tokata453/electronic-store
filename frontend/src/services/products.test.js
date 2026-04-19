import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getProductById, getProducts } from './products';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('products service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets product list data', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          products: [{ id: 1 }],
          pagination: { total: 1 },
        },
      },
    });

    const result = await getProducts({ search: 'phone' });

    expect(api.get).toHaveBeenCalledWith('/api/products', { params: { search: 'phone' } });
    expect(result.products).toEqual([{ id: 1 }]);
  });

  it('gets a product by id', async () => {
    api.get.mockResolvedValue({ data: { data: { product: { id: 1 } } } });

    const product = await getProductById(1);

    expect(api.get).toHaveBeenCalledWith('/api/products/1');
    expect(product).toEqual({ id: 1 });
  });
});
