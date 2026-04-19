import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

const mockAddToCart = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('@/services/cart', () => ({
  addToCart: (...args) => mockAddToCart(...args),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
  },
}));

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows add to cart and triggers cart action', async () => {
    const user = userEvent.setup();
    mockAddToCart.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <ProductCard
          product={{
            id: 1,
            name: 'Test Phone',
            price: 100,
            salePrice: 80,
            stock: 5,
            badge: 'Hot',
            rating: 4,
            reviewCount: 2,
            category: { name: 'Phones' },
            imageUrls: ['image.jpg'],
          }}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it('shows sold out for zero stock', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={{
            id: 2,
            name: 'Out of stock item',
            price: 100,
            stock: 0,
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });
});
