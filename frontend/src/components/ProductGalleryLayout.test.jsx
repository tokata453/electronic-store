import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProductGalleryLayout from './ProductGalleryLayout';

vi.mock('./ProductCard', () => ({
  default: ({ product }) => <div data-testid="product-card">{product.name}</div>,
}));

describe('ProductGalleryLayout', () => {
  it('handles filters, sorting, and pagination', async () => {
    const user = userEvent.setup();
    const setUiMaxPrice = vi.fn();
    const handleApplyFilters = vi.fn();
    const setSortOption = vi.fn();
    const handlePageChange = vi.fn();

    render(
      <ProductGalleryLayout
        products={[{ id: 1, name: 'Phone X' }]}
        pagination={{ total: 1, page: 1, pages: 2 }}
        isLoading={false}
        error={null}
        emptyMessage="No items"
        headerContent={<div>Header</div>}
        uiMaxPrice={500}
        setUiMaxPrice={setUiMaxPrice}
        handleApplyFilters={handleApplyFilters}
        sortOption="price-asc"
        setSortOption={setSortOption}
        currentPage={1}
        handlePageChange={handlePageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /apply filters/i }));
    expect(handleApplyFilters).toHaveBeenCalled();

    await user.selectOptions(screen.getByRole('combobox'), 'price-desc');
    expect(setSortOption).toHaveBeenCalledWith('price-desc');

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(handlePageChange).toHaveBeenCalledWith(2);

    expect(screen.getByTestId('product-card')).toHaveTextContent('Phone X');
  });
});
