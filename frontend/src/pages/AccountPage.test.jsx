import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountPage from './AccountPage';

const mockNavigate = vi.fn();
const mockGetUserProfile = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/services/user', () => ({
  getUserProfile: (...args) => mockGetUserProfile(...args),
}));

vi.mock('@/components/account/AccountSidebar', () => ({
  default: ({ activeTab, changeTab, handleLogout }) => (
    <div>
      <div>Sidebar</div>
      <button type="button" onClick={() => changeTab('orders')}>Switch Tab</button>
      <button type="button" onClick={handleLogout}>Logout</button>
      <div>{activeTab}</div>
    </div>
  ),
}));

vi.mock('@/components/account/ProfileTab', () => ({
  default: ({ user }) => <div>Profile: {user.firstName}</div>,
}));

vi.mock('@/components/account/OrdersTab', () => ({
  default: () => <div>Orders Tab</div>,
}));

describe('AccountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to login when token is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('loads the profile and renders the profile tab', async () => {
    localStorage.setItem('token', 'fake-token');
    mockGetUserProfile.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '555',
          address: { street: 'Main', city: 'Phnom Penh', state: 'PP', zipCode: '12000' },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/account?tab=profile']}>
        <Routes>
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Profile: Jane/i)).toBeInTheDocument();
    expect(mockGetUserProfile).toHaveBeenCalled();
  });
});
