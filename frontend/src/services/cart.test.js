import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { addToCart, getCart, mergeCarts, removeFromCart, updateCartItem } from './cart';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cart service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets cart data', async () => {
    api.get.mockResolvedValue({ data: { data: { items: [] } } });

    await getCart();

    expect(api.get).toHaveBeenCalledWith('/api/cart');
  });

  it('adds item to cart', async () => {
    api.post.mockResolvedValue({ data: { data: { ok: true } } });

    await addToCart(10, 2);

    expect(api.post).toHaveBeenCalledWith('/api/cart/items', { productId: 10, quantity: 2 });
  });

  it('updates cart item', async () => {
    api.put.mockResolvedValue({ data: { data: { ok: true } } });

    await updateCartItem(5, 3);

    expect(api.put).toHaveBeenCalledWith('/api/cart/items/5', { quantity: 3 });
  });

  it('removes cart item', async () => {
    api.delete.mockResolvedValue({ data: { data: { ok: true } } });

    await removeFromCart(9);

    expect(api.delete).toHaveBeenCalledWith('/api/cart/items/9');
  });

  it('merges carts by session id', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await mergeCarts('guest_123');

    expect(api.post).toHaveBeenCalledWith('/api/cart/merge', { sessionId: 'guest_123' });
  });
});
