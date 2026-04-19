import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLastPlacedOrder } from '@/test/msw/handlers';
import CheckoutPage from './CheckoutPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects guests to login', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('prefills the form and places an order', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'token-123');

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('0000 0000 0000 0000'), '4111111111111111');
    await user.type(screen.getByPlaceholderText('MM / YY'), '12/30');
    await user.type(screen.getByPlaceholderText('•••'), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(getLastPlacedOrder()).toEqual(expect.objectContaining({
        items: [{ productId: 10, quantity: 2 }],
        shippingAddress: expect.objectContaining({ fullName: 'Jane Doe', addressLine1: '123 Main' }),
      }));
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
