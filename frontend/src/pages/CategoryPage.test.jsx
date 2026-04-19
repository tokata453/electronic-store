import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoryPage from './CategoryPage';

const mockGetCategoryById = vi.fn();
const mockGetProducts = vi.fn();

vi.mock('@/services/categories', () => ({
  getCategoryById: (...args) => mockGetCategoryById(...args),
}));

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

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a category and its products', async () => {
    mockGetCategoryById.mockResolvedValue({ id: 7, name: 'Phones', description: 'Mobile devices' });
    mockGetProducts.mockResolvedValue({ products: [{ id: 1 }], pagination: { total: 1, page: 1, pages: 1 } });

    render(
      <MemoryRouter initialEntries={['/category/7']}>
        <Routes>
          <Route path="/category/:id" element={<CategoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetCategoryById).toHaveBeenCalledWith('7');
      expect(mockGetProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: '7', limit: 6, sortBy: 'price', order: 'ASC' }));
    });
    expect(await screen.findByRole('heading', { name: /phones/i })).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
