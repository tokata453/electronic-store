import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartPage from './CartPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the cart and removes an item', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Phone X')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() => {
      expect(screen.queryByText('Phone X')).not.toBeInTheDocument();
    });
  });

  it('sends guests to login when checking out', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    await screen.findByText('Proceed to Checkout');
    await user.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/checkout');
  });
});
