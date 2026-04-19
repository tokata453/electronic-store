import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/services/authentication', () => ({
  authService: {
    register: (...args) => mockRegister(...args),
    loginWithGoogle: vi.fn(),
    loginWithFacebook: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}));

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/Please fill out all fields/i)).toBeInTheDocument();
  });

  it('registers a user and redirects to home', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      success: true,
      data: {
        token: 'register-token',
        user: { id: 3, email: 'new@example.com', role: 'customer' },
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/enter first name/i), 'Test');
    await user.type(screen.getByPlaceholderText(/enter last name/i), 'User');
    await user.type(screen.getByPlaceholderText(/name@example.com/i), 'new@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');

    fireEvent.blur(screen.getByPlaceholderText(/enter first name/i));
    fireEvent.blur(screen.getByPlaceholderText(/enter last name/i));
    fireEvent.blur(screen.getByPlaceholderText(/name@example.com/i));
    fireEvent.blur(screen.getByPlaceholderText(/••••••••/i));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
          email: 'new@example.com',
          password: 'password123',
        })
      );
    });

    expect(localStorage.getItem('token')).toBe('register-token');
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
