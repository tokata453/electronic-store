import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductFormPage from './ProductFormPage';

const mockNavigate = vi.fn();
const mockParams = vi.fn(() => ({}));
const mockListCategories = vi.fn();
const mockCreateProduct = vi.fn();
const mockGetProduct = vi.fn();
const mockUpdateProduct = vi.fn();
const mockUploadProductImage = vi.fn();
const mockDeleteProductImage = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
      useParams: () => mockParams(),
  };
});

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('./api', () => ({
  listCategories: (...args) => mockListCategories(...args),
  createProduct: (...args) => mockCreateProduct(...args),
  getProduct: (...args) => mockGetProduct(...args),
  updateProduct: (...args) => mockUpdateProduct(...args),
  uploadProductImage: (...args) => mockUploadProductImage(...args),
  deleteProductImage: (...args) => mockDeleteProductImage(...args),
}));

vi.mock('./ProductForm', () => ({
  default: ({ value, onChange, onSubmit }) => (
    <form onSubmit={onSubmit}>
      <div>{value.name}</div>
      <button type="button" onClick={() => onChange({ ...value, name: 'Updated Name', slug: 'updated-name' })}>Change Name</button>
      <button type="submit">Save Product</button>
    </form>
  ),
}));

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.mockReturnValue({});
  });

  it('creates a product', async () => {
    const user = userEvent.setup();
    mockListCategories.mockResolvedValue([{ id: 1, name: 'Phones' }]);
    mockCreateProduct.mockResolvedValue({ id: 42 });

    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <ProductFormPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /add product/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /save product/i }));

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalled();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('loads and updates a product', async () => {
    const user = userEvent.setup();
    mockParams.mockReturnValue({ id: '1' });
    mockListCategories.mockResolvedValue([{ id: 1, name: 'Phones' }]);
    mockGetProduct.mockResolvedValue({
      name: 'Phone',
      slug: 'phone',
      description: 'Desc',
      specifications: {},
      price: 100,
      salePrice: 80,
      sku: 'SKU',
      stock: 5,
      categoryId: 1,
      images: ['key1'],
      imageUrls: ['url1'],
      badge: 'Hot',
      isFeatured: true,
      isActive: true,
    });
    mockUpdateProduct.mockResolvedValue({ id: 1 });

    render(
      <MemoryRouter initialEntries={['/admin/products/1']}>
        <ProductFormPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /edit product/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /save product/i }));

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Phone' }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });
});
