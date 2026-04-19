import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersPage from './UsersPage';

const mockGetUsers = vi.fn();
const mockGetUserById = vi.fn();
const mockUpdateUserById = vi.fn();
const mockDeleteUserById = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('./products/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../services/admin', () => ({
  getUsers: (...args) => mockGetUsers(...args),
  getUserById: (...args) => mockGetUserById(...args),
  updateUserById: (...args) => mockUpdateUserById(...args),
  deleteUserById: (...args) => mockDeleteUserById(...args),
}));

vi.mock('../services/authentication', () => ({
  authService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
  },
}));

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders users and edits one account', async () => {
    const user = userEvent.setup();
    mockGetUsers.mockResolvedValue({
      data: {
        users: [
          { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', role: 'customer', isActive: true, createdAt: '2026-04-19T00:00:00Z' },
        ],
      },
    });
    mockGetCurrentUser.mockResolvedValue({ data: { user: { id: 99 } } });
    mockGetUserById.mockResolvedValue({ data: { user: { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555', role: 'customer', isActive: true } } });
    mockUpdateUserById.mockResolvedValue({ data: { success: true } });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByText(/edit user/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), 'Janet');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateUserById).toHaveBeenCalledWith(1, expect.objectContaining({ firstName: 'Janet' }));
    });
  });
});
