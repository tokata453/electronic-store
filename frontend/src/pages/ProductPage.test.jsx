import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductPage from './ProductPage';

const mockGetProductById = vi.fn();

vi.mock('../services/products', () => ({
  getProductById: (...args) => mockGetProductById(...args),
}));

vi.mock('../components/ProductGallery', () => ({
  default: ({ productName }) => <div data-testid="gallery">{productName}</div>,
}));

vi.mock('../components/ProductInfo', () => ({
  default: ({ product }) => <div data-testid="info">{product.name}</div>,
}));

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads product details', async () => {
    mockGetProductById.mockResolvedValue({
      id: 11,
      name: 'Phone X',
      imageUrls: ['https://example.com/phone.jpg'],
      category: { id: 7, name: 'Phones' },
    });

    render(
      <MemoryRouter initialEntries={['/product/11']}>
        <Routes>
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('11');
    });
    expect(await screen.findByTestId('gallery')).toHaveTextContent('Phone X');
    expect(screen.getByTestId('info')).toHaveTextContent('Phone X');
  });
});
