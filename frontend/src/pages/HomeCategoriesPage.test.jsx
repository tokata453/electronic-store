import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeCategoriesPage from './HomeCategoriesPage';

const mockGetCategories = vi.fn();
const mockGetProducts = vi.fn();

vi.mock('@/services/categories', () => ({
  getCategories: (...args) => mockGetCategories(...args),
}));

vi.mock('@/services/products', () => ({
  getProducts: (...args) => mockGetProducts(...args),
}));

vi.mock('@/components/categories/CategoryGrid', () => ({
  default: ({ categories }) => <div data-testid="category-grid">{categories.length}</div>,
}));

vi.mock('@/components/categories/FeaturedProducts', () => ({
  default: ({ products }) => <div data-testid="featured-products">{products.length}</div>,
}));

describe('HomeCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads categories and featured products', async () => {
    mockGetCategories.mockResolvedValue([{ id: 1, name: 'Phones', icon: 'Smartphone' }]);
    mockGetProducts.mockResolvedValue({ products: [{ id: 2 }] });

    render(
      <MemoryRouter>
        <HomeCategoriesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
      expect(mockGetProducts).toHaveBeenCalledWith({ limit: 3 });
    });
    expect(screen.getByTestId('category-grid')).toHaveTextContent('1');
    expect(screen.getByTestId('featured-products')).toHaveTextContent('1');
  });
});
