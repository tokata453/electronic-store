import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountSidebar from './AccountSidebar';

const mockUploadAvatar = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/services/user', () => ({
  uploadAvatar: (...args) => mockUploadAvatar(...args),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}));

describe('AccountSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('changes tabs and logs out', async () => {
    const user = userEvent.setup();
    const changeTab = vi.fn();
    const handleLogout = vi.fn();

    render(
      <AccountSidebar
        user={{ firstName: 'Jane', lastName: 'Doe' }}
        setUser={vi.fn()}
        activeTab="profile"
        changeTab={changeTab}
        handleLogout={handleLogout}
      />
    );

    await user.click(screen.getByText(/Orders/i));
    await user.click(screen.getByText(/Logout/i));

    expect(changeTab).toHaveBeenCalledWith('orders');
    expect(handleLogout).toHaveBeenCalled();
  });

  it('uploads a small avatar image', async () => {
    const user = userEvent.setup();
    const setUser = vi.fn();
    mockUploadAvatar.mockResolvedValue({
      success: true,
      data: {
        avatarKey: 'avatar-key',
        avatarUrl: 'https://example.com/avatar.png',
      },
    });

    const { container } = render(
      <AccountSidebar
        user={{ firstName: 'Jane', lastName: 'Doe' }}
        setUser={setUser}
        activeTab="profile"
        changeTab={vi.fn()}
        handleLogout={vi.fn()}
      />
    );

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    await user.upload(container.querySelector('input[type="file"]'), file);

    expect(mockUploadAvatar).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalled();
  });
});
