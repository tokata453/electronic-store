import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersPage from './OrdersPage';

const mockGetAdminOrders = vi.fn();
const mockUpdateOrderStatus = vi.fn();

vi.mock('./products/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../services/admin', () => ({
  getAdminOrders: (...args) => mockGetAdminOrders(...args),
  updateOrderStatus: (...args) => mockUpdateOrderStatus(...args),
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an order and updates status through the modal', async () => {
    const user = userEvent.setup();
    mockGetAdminOrders.mockResolvedValue({
      data: {
        orders: [
          {
            id: 1,
            orderNumber: 'ORD-1001',
            status: 'pending',
            totalAmount: 99.99,
            paymentMethod: 'credit_card',
            createdAt: '2026-04-19T00:00:00Z',
            user: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
            items: [{ id: 1 }],
          },
        ],
        pagination: { page: 1, pages: 1 },
      },
    });
    mockUpdateOrderStatus.mockResolvedValue({ data: { success: true } });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /update/i }));
    expect(screen.getByText(/update order status/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status', { selector: '#next-status' }), 'shipped');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/tracking number is required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/tracking number/i), 'TRK123');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(1, {
        status: 'shipped',
        trackingNumber: 'TRK123',
      });
    });
  });
});
