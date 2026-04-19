import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  deleteUserById,
  exportSalesReport,
  getAdminAccessCheck,
  getAdminOrders,
  getCustomerStats,
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
  getRevenueAnalytics,
  getSalesReport,
  getTopProducts,
  getUserById,
  getUsers,
  updateOrderStatus,
  updateUserById,
} from './admin';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('admin service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls admin access check', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    await getAdminAccessCheck();
    expect(api.get).toHaveBeenCalledWith('/api/admin');
  });

  it('calls dashboard stats endpoint', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    await getDashboardStats();
    expect(api.get).toHaveBeenCalledWith('/api/admin/dashboard');
  });

  it('calls sales report with params', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    await getSalesReport({ startDate: '2026-01-01', endDate: '2026-01-31', groupBy: 'day' });
    expect(api.get).toHaveBeenCalledWith('/api/admin/sales-report', {
      params: { startDate: '2026-01-01', endDate: '2026-01-31', groupBy: 'day' },
    });
  });

  it('uses blob response for csv exports', async () => {
    api.get.mockResolvedValue({ data: new Blob(['csv']) });
    await exportSalesReport({ format: 'csv' });
    expect(api.get).toHaveBeenCalledWith('/api/admin/export-sales', expect.objectContaining({ responseType: 'blob' }));
  });

  it('uses json response for json exports', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    await exportSalesReport({ format: 'json' });
    expect(api.get).toHaveBeenCalledWith('/api/admin/export-sales', expect.objectContaining({ responseType: 'json' }));
  });

  it('calls admin orders and users endpoints', async () => {
    api.get.mockResolvedValue({ data: { success: true } });
    api.put.mockResolvedValue({ data: { success: true } });
    api.delete.mockResolvedValue({ data: { success: true } });

    await getAdminOrders({ status: 'pending', page: 2, limit: 10 });
    await getUsers();
    await getUserById(4);
    await getCustomerStats();
    await getTopProducts({ limit: 5, sortBy: 'revenue' });
    await getLowStockProducts({ threshold: 3 });
    await getRecentOrders({ limit: 4 });
    await getRevenueAnalytics({ period: '30days' });
    await updateOrderStatus(9, { status: 'shipped' });
    await updateUserById(3, { role: 'admin' });
    await deleteUserById(3);

    expect(api.get).toHaveBeenCalledWith('/api/orders/admin/all', { params: { status: 'pending', page: 2, limit: 10 } });
    expect(api.get).toHaveBeenCalledWith('/api/users');
    expect(api.get).toHaveBeenCalledWith('/api/users/4');
    expect(api.get).toHaveBeenCalledWith('/api/admin/customer-stats');
    expect(api.get).toHaveBeenCalledWith('/api/admin/top-products', { params: { limit: 5, sortBy: 'revenue' } });
    expect(api.get).toHaveBeenCalledWith('/api/admin/low-stock', { params: { threshold: 3 } });
    expect(api.get).toHaveBeenCalledWith('/api/admin/recent-orders', { params: { limit: 4 } });
    expect(api.get).toHaveBeenCalledWith('/api/admin/revenue-analytics', { params: { period: '30days' } });
    expect(api.put).toHaveBeenCalledWith('/api/orders/9/status', { status: 'shipped' });
    expect(api.put).toHaveBeenCalledWith('/api/users/3', { role: 'admin' });
    expect(api.delete).toHaveBeenCalledWith('/api/users/3');
  });
});
