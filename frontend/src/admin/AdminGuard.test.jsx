import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminGuard from './AdminGuard';

const mockGetCurrentUser = vi.fn();

vi.mock('../services/authentication', () => ({
  authService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
  },
}));

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders admin content when the current user is admin', async () => {
    localStorage.setItem('token', 'fake-token');
    mockGetCurrentUser.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: 'admin@iceelectronics.com',
          role: 'admin',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<div>Admin Area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Area')).toBeInTheDocument();
    });
  });

  it('redirects non-admin users to login', async () => {
    localStorage.setItem('token', 'fake-token');
    mockGetCurrentUser.mockResolvedValue({
      data: {
        user: {
          id: 2,
          email: 'customer@example.com',
          role: 'customer',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<div>Admin Area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('redirects to login and clears token when verification fails', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<div>Admin Area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
