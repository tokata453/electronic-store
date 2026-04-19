import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLastProductsQuery } from '@/test/msw/handlers';
import SearchResults from './SearchResults';

vi.mock('../components/ProductGalleryLayout', () => ({
  default: ({ headerContent, emptyMessage, products }) => (
    <div>
      <div data-testid="header">{headerContent}</div>
      <div data-testid="empty">{emptyMessage}</div>
      <div data-testid="count">{products.length}</div>
    </div>
  ),
}));

describe('SearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads search results for the query', async () => {
    render(
      <MemoryRouter initialEntries={['/products?search=phone&visual=true']}>
        <SearchResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getLastProductsQuery()).toEqual(expect.objectContaining({ search: 'phone', page: '1', maxPrice: '5000', limit: '6' }));
    });
    expect(await screen.findByText('Image Search Results')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
