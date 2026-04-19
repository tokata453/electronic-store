import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';

const mockGetDashboardStats = vi.fn();
const mockGetRecentOrders = vi.fn();
const mockGetLowStockProducts = vi.fn();
const mockGetTopProducts = vi.fn();

vi.mock('./products/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../services/admin', () => ({
  getDashboardStats: (...args) => mockGetDashboardStats(...args),
  getRecentOrders: (...args) => mockGetRecentOrders(...args),
  getLowStockProducts: (...args) => mockGetLowStockProducts(...args),
  getTopProducts: (...args) => mockGetTopProducts(...args),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard cards and data', async () => {
    mockGetDashboardStats.mockResolvedValue({
      data: {
        stats: {
          totalRevenue: { all: 12345.67, month: 2345.67 },
          totalOrders: { all: 89 },
          totalCustomers: 12,
          pendingOrders: 4,
          processingOrders: 3,
          lowStockProducts: 2,
        },
      },
    });
    mockGetRecentOrders.mockResolvedValue({
      data: {
        orders: [
          { id: 1, orderNumber: 'ORD-1', createdAt: '2026-04-19T00:00:00Z', customer: { name: 'Alice' }, totalAmount: 200, status: 'pending' },
        ],
      },
    });
    mockGetLowStockProducts.mockResolvedValue({
      data: {
        lowStockProducts: [{ id: 2, name: 'Phone Case', sku: 'CASE-1', stock: 3 }],
      },
    });
    mockGetTopProducts.mockResolvedValue({
      data: {
        topProducts: [{ id: 3, name: 'Laptop', totalSold: 9, totalRevenue: 4500 }],
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    expect(screen.getByText('Top Products')).toBeInTheDocument();
    expect(mockGetRecentOrders).toHaveBeenCalledWith({ limit: 5 });
    expect(mockGetLowStockProducts).toHaveBeenCalledWith({ threshold: 10 });
    expect(mockGetTopProducts).toHaveBeenCalledWith({ limit: 5, sortBy: 'revenue' });
  });
});
