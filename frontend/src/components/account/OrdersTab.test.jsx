import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersTab from './OrdersTab';

const mockGetOrders = vi.fn();

vi.mock('@/services/order', () => ({
  getOrders: (...args) => mockGetOrders(...args),
}));

describe('OrdersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state when there are no orders', async () => {
    mockGetOrders.mockResolvedValue({ success: true, data: { orders: [] } });

    render(
      <MemoryRouter>
        <OrdersTab />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No orders yet/i)).toBeInTheDocument();
  });

  it('renders order history entries', async () => {
    mockGetOrders.mockResolvedValue({
      success: true,
      data: {
        orders: [
          {
            id: 1,
            createdAt: '2026-04-19T00:00:00Z',
            totalAmount: 100,
            orderNumber: 'ORD-1',
            status: 'processing',
            items: [
              {
                id: 11,
                productName: 'Phone',
                quantity: 2,
                price: 50,
                totalPrice: 100,
              },
            ],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <OrdersTab />
      </MemoryRouter>
    );

    expect(await screen.findByText('ORD-1')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });
});
