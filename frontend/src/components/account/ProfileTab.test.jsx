import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileTab from './ProfileTab';
import { useState } from 'react';

const mockUpdateUserProfile = vi.fn();

vi.mock('@/services/user', () => ({
  updateUserProfile: (...args) => mockUpdateUserProfile(...args),
}));

describe('ProfileTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates profile details', async () => {
    const user = userEvent.setup();
    mockUpdateUserProfile.mockResolvedValue({ success: true });

    function Harness() {
      const [profile, setProfile] = useState({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555',
        address: { street: '', city: '', state: '', zipCode: '' },
      });

      return <ProfileTab user={profile} setUser={setProfile} />;
    }

    render(
      <Harness />
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.clear(textboxes[0]);
    await user.type(textboxes[0], 'Janet');
    await user.clear(textboxes[1]);
    await user.type(textboxes[1], 'Smith');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({ firstName: 'Janet', lastName: 'Smith', phone: '555' });
    });
  });

  it('saves shipping address', async () => {
    const user = userEvent.setup();
    mockUpdateUserProfile.mockResolvedValue({ success: true });

    function Harness() {
      const [profile, setProfile] = useState({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '555',
        address: { street: '', city: '', state: '', zipCode: '' },
      });

      return <ProfileTab user={profile} setUser={setProfile} />;
    }

    render(
      <Harness />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.type(screen.getByPlaceholderText(/123 main st/i), '123 Main St');
    await user.type(screen.getByPlaceholderText(/phnom penh/i), 'Phnom Penh');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        address: expect.objectContaining({ street: '123 Main St', city: 'Phnom Penh' }),
      });
    });
  });
});
