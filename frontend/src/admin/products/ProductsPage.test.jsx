import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsPage from './ProductsPage';

const mockListProducts = vi.fn();
const mockListCategories = vi.fn();
const mockDeleteProduct = vi.fn();

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('./api', () => ({
  listProducts: (...args) => mockListProducts(...args),
  listCategories: (...args) => mockListCategories(...args),
  deleteProduct: (...args) => mockDeleteProduct(...args),
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products and deletes one', async () => {
    const user = userEvent.setup();
    mockListCategories.mockResolvedValue([{ id: 1, name: 'Phones' }]);
    mockListProducts.mockResolvedValue({
      products: [
        {
          id: 10,
          name: 'iPhone 15',
          price: 999,
          stock: 5,
          category: { name: 'Phones' },
          imageUrls: ['img.jpg'],
          isActive: true,
        },
      ],
      pagination: { page: 1, totalPages: 1 },
    });
    mockDeleteProduct.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Phones' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete iPhone 15/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete iPhone 15/i }));

    await waitFor(() => {
      expect(mockDeleteProduct).toHaveBeenCalledWith(10);
    });
  });
});
