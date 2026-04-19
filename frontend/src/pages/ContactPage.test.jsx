import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import ContactPage from './ContactPage';

const mockToastSuccess = vi.fn();

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
  },
}));

describe('ContactPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('submits the form and resets after the delay', async () => {
    render(<ContactPage />);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Describe your requirements in detail...'), { target: { value: 'Need help with an order' } });

    const form = screen.getByRole('button', { name: /submit inquiry/i }).closest('form');
    fireEvent.submit(form);

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("Message sent successfully! We'll be in touch soon.");
    expect(screen.getByPlaceholderText('John Doe')).toHaveValue('');
    expect(screen.getByPlaceholderText('john@example.com')).toHaveValue('');
  });
});
