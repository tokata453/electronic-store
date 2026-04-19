import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './SettingsPage';

const mockSetTheme = vi.fn();

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches theme mode', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dark/i }));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
