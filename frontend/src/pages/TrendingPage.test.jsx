import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TrendingPage from './TrendingPage';

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

describe('TrendingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests hot products', async () => {
    mockGetProducts.mockResolvedValue({ products: [], pagination: { total: 0, page: 1, pages: 1 } });

    render(
      <MemoryRouter>
        <TrendingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalledWith(expect.objectContaining({ badge: 'Hot', limit: 6, sortBy: 'price', order: 'ASC' }));
    });
    expect(await screen.findByText('The Standard of Excellence')).toBeInTheDocument();
  });
});
