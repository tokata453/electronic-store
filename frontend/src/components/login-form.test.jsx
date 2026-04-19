import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './login-form';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockMergeCarts = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?redirect=%2Fcheckout' }),
  };
});

vi.mock('@/services/authentication', () => ({
  authService: {
    login: (...args) => mockLogin(...args),
    loginWithGoogle: vi.fn(),
    loginWithFacebook: vi.fn(),
  },
}));

vi.mock('@/services/cart', () => ({
  mergeCarts: (...args) => mockMergeCarts(...args),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('logs in a customer, merges guest cart, and redirects to requested page', async () => {
    const user = userEvent.setup();

    localStorage.setItem('guest_session_id', 'guest_abc123');
    mockLogin.mockResolvedValue({
      success: true,
      data: {
        token: 'fake-token',
        user: { id: 10, email: 'customer@example.com', role: 'customer' },
      },
    });
    mockMergeCarts.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'customer@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('customer@example.com', 'password123');
    });

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toContain('customer@example.com');

    await waitFor(() => {
      expect(mockMergeCarts).toHaveBeenCalledWith('guest_abc123');
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('redirects admin users to admin products page', async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      success: true,
      data: {
        token: 'admin-token',
        user: { id: 1, email: 'admin@iceelectronics.com', role: 'admin' },
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'admin@iceelectronics.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
    });
  });
});
