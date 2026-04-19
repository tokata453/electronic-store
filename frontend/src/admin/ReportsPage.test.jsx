import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReportsPage from './ReportsPage';

const mockGetSalesReport = vi.fn();
const mockGetRevenueAnalytics = vi.fn();
const mockExportSalesReport = vi.fn();

vi.mock('./products/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../services/admin', () => ({
  getSalesReport: (...args) => mockGetSalesReport(...args),
  getRevenueAnalytics: (...args) => mockGetRevenueAnalytics(...args),
  exportSalesReport: (...args) => mockExportSalesReport(...args),
}));

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:report'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
      element.click = vi.fn();
      return element;
    });
  });

  it('renders report data and exports csv', async () => {
    const user = userEvent.setup();
    mockGetSalesReport.mockResolvedValue({
      data: {
        report: [{ date: '2026-04-01', revenue: 1000, orders: 5, averageOrderValue: 200 }],
        summary: { totalRevenue: 1000, totalOrders: 5, averageOrderValue: 200 },
      },
    });
    mockGetRevenueAnalytics.mockResolvedValue({
      data: {
        chartData: [{ date: '2026-04-01', revenue: 1000, orders: 5 }],
        revenueByCategory: [{ categoryName: 'Phones', revenue: 700, percentage: 70 }],
        revenueByPayment: [{ method: 'credit_card', revenue: 1000, percentage: 100 }],
      },
    });
    mockExportSalesReport.mockResolvedValue({ data: new Blob(['date,revenue']) });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    expect(screen.getByText('Sales Report Filters')).toBeInTheDocument();
    expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /export csv/i }));

    await waitFor(() => {
      expect(mockExportSalesReport).toHaveBeenCalledWith(expect.objectContaining({ format: 'csv' }));
    });
  });
});
