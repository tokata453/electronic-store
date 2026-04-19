import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnSalePage from './OnSalePage';

const mockGetProducts = vi.fn();

vi.mock('@/services/products', () => ({
  getProducts: (...args) => mockGetProducts(...args),
}));

vi.mock('../components/ProductGalleryLayout', () => ({
  default: ({ headerContent, products }) => (
    <div>
      <div>{headerContent}</div>
      <div data-testid="count">{products.length}</div>
    </div>
  ),
}));

describe('OnSalePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests sale products', async () => {
    mockGetProducts.mockResolvedValue({ products: [], pagination: { total: 0, page: 1, pages: 1 } });

    render(
      <MemoryRouter>
        <OnSalePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalledWith(expect.objectContaining({ badge: 'Sale', limit: 6, sortBy: 'price', order: 'ASC' }));
    });
    expect(await screen.findByRole('heading', { name: /special offers/i })).toBeInTheDocument();
  });
});
