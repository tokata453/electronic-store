import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Navbar';

const mockGetCategories = vi.fn();
const mockGetCart = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('../services/categories', () => ({
  getCategories: (...args) => mockGetCategories(...args),
}));

vi.mock('../services/cart', () => ({
  getCart: (...args) => mockGetCart(...args),
}));

vi.mock('../services/authentication', () => ({
  authService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
    loginWithGoogle: vi.fn(),
    loginWithFacebook: vi.fn(),
  },
}));

vi.mock('./VisualSearchButton', () => ({
  default: () => <button type="button">Visual Search</button>,
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders categories and cart count', async () => {
    mockGetCategories.mockResolvedValue([{ id: 1, name: 'Phones', icon: 'Smartphone' }]);
    mockGetCart.mockResolvedValue({ summary: { itemCount: 3 } });
    mockGetCurrentUser.mockResolvedValue({ data: { user: { id: 1 } } });
    localStorage.setItem('token', 'fake-token');

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Phones')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/search catalog/i)).toBeInTheDocument();
    expect(screen.getByText('Visual Search')).toBeInTheDocument();
  });
});
