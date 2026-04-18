import { useEffect, useMemo, useState } from 'react';
import { exportSalesReport, getRevenueAnalytics, getSalesReport } from '../services/admin';
import { capitalize, formatCurrency, formatNumber, formatPaymentMethod } from './utils/formatters';
import { useTheme } from './products/useTheme';

const PERIOD_OPTIONS = ['7days', '30days', '90days', '1year', 'all'];
const GROUP_BY_OPTIONS = ['day', 'week', 'month'];

export default function ReportsPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [startDate, setStartDate] = useState(getDateInputValue(daysAgo(30)));
  const [endDate, setEndDate] = useState(getDateInputValue(new Date()));
  const [groupBy, setGroupBy] = useState('day');
  const [period, setPeriod] = useState('30days');

  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [exporting, setExporting] = useState('');
  const [err, setErr] = useState('');

  const [salesReport, setSalesReport] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [revenueByPayment, setRevenueByPayment] = useState([]);

  async function loadSalesReport() {
    setLoadingSales(true);
    setErr('');

    try {
      const response = await getSalesReport({ startDate, endDate, groupBy });
      setSalesReport(response?.data?.report ?? response?.report ?? []);
      setSalesSummary(
        response?.data?.summary ??
          response?.summary ?? {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
          }
      );
    } catch (error) {
      setErr(error?.response?.data?.error?.message || error?.message || 'Failed to load sales report');
    } finally {
      setLoadingSales(false);
    }
  }

  function hasValidDateRange() {
    if (!startDate || !endDate) {
      setErr('Please select both start and end dates.');
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErr('Start date cannot be later than end date.');
      return false;
    }
    return true;
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    setErr('');

    try {
      const response = await getRevenueAnalytics({ period });
      setChartData(response?.data?.chartData ?? response?.chartData ?? []);
      setRevenueByCategory(response?.data?.revenueByCategory ?? response?.revenueByCategory ?? []);
      setRevenueByPayment(response?.data?.revenueByPayment ?? response?.revenueByPayment ?? []);
    } catch (error) {
      setErr(error?.response?.data?.error?.message || error?.message || 'Failed to load revenue analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  }

  useEffect(() => {
    loadSalesReport();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRunSalesReport(e) {
    e.preventDefault();
    if (!hasValidDateRange()) return;
    await loadSalesReport();
  }

  async function handleRunAnalytics(e) {
    e.preventDefault();
    await loadAnalytics();
  }

  async function handleExport(format) {
    if (!hasValidDateRange()) return;
    setErr('');
    setExporting(format);
    try {
      const response = await exportSalesReport({ startDate, endDate, format });

      if (format === 'csv') {
        const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data], { type: 'text/csv;charset=utf-8;' });
        triggerBrowserDownload(blob, `sales-report-${startDate}-to-${endDate}.csv`);
      } else {
        const payload = response?.data?.data ?? response?.data ?? {};
        const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
        triggerBrowserDownload(jsonBlob, `sales-report-${startDate}-to-${endDate}.json`);
      }
    } catch (error) {
      setErr(error?.response?.data?.error?.message || error?.message || 'Failed to export report');
    } finally {
      setExporting('');
    }
  }

  const chartMax = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map((item) => Number(item.revenue || 0)), 0);
  }, [chartData]);

  const inputCls = `rounded-lg px-3 py-2 outline-none transition ${
    dark
      ? 'border border-slate-700 bg-slate-900 text-white focus:border-slate-500'
      : 'border border-slate-300 bg-white text-slate-900 focus:border-slate-400'
  }`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className={`text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
          Reports
        </h1>
        <p className={dark ? 'text-slate-400' : 'text-slate-600'}>
          Analyze sales performance and export reports by date range.
        </p>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <form
          onSubmit={handleRunSalesReport}
          className={`rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
        >
          <h2 className="text-sm font-semibold">Sales Report Filters</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`} htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full ${inputCls}`}
                required
              />
            </div>
            <div>
              <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`} htmlFor="endDate">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full ${inputCls}`}
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`} htmlFor="groupBy">
              Group By
            </label>
            <select id="groupBy" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className={`w-full ${inputCls}`}>
              {GROUP_BY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingSales}
            className="mt-4 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSales ? 'Loading...' : 'Run Sales Report'}
          </button>
        </form>

        <form
          onSubmit={handleRunAnalytics}
          className={`rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
        >
          <h2 className="text-sm font-semibold">Revenue Analytics</h2>
          <div className="mt-3">
            <label className={`mb-1 block text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`} htmlFor="period">
              Period
            </label>
            <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)} className={`w-full ${inputCls}`}>
              {PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatPeriodLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingAnalytics}
            className="mt-4 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAnalytics ? 'Loading...' : 'Run Analytics'}
          </button>

          <div className={`mt-4 rounded-lg border p-3 ${dark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Export based on the selected sales report date range.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={exporting === 'csv'}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  dark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {exporting === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                disabled={exporting === 'json'}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  dark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {exporting === 'json' ? 'Exporting JSON...' : 'Export JSON'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Total Revenue</p>
          <p className={`mt-2 text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {loadingSales ? '...' : formatCurrency(Number(salesSummary.totalRevenue || 0))}
          </p>
        </article>
        <article className={`rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Total Orders</p>
          <p className={`mt-2 text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {loadingSales ? '...' : formatNumber(Number(salesSummary.totalOrders || 0))}
          </p>
        </article>
        <article className={`rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Average Order Value</p>
          <p className={`mt-2 text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {loadingSales ? '...' : formatCurrency(Number(salesSummary.averageOrderValue || 0))}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-sm font-semibold">Sales Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-175 w-full text-left text-sm">
            <thead className={dark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3 hidden sm:table-cell">AOV</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loadingSales ? (
                <tr>
                  <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : salesReport.length === 0 ? (
                <tr>
                  <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={4}>
                    No data for selected range.
                  </td>
                </tr>
              ) : (
                salesReport.slice(0, 10).map((row) => (
                  <tr key={row.date} className={dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(Number(row.revenue || 0))}</td>
                    <td className="px-4 py-3">{formatNumber(Number(row.orders || 0))}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{formatCurrency(Number(row.averageOrderValue || 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

        <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-sm font-semibold">Revenue Trend</h2>
          </div>
          <div className="space-y-3 p-4">
            {loadingAnalytics ? (
              <p className={dark ? 'text-slate-400' : 'text-slate-500'}>Loading...</p>
            ) : chartData.length === 0 ? (
              <p className={dark ? 'text-slate-400' : 'text-slate-500'}>No trend data available.</p>
            ) : (
              chartData.slice(-10).map((point) => {
                const revenue = Number(point.revenue || 0);
                const widthPercent = chartMax > 0 ? Math.max((revenue / chartMax) * 100, 2) : 0;
                return (
                  <div key={point.date}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={dark ? 'text-slate-300' : 'text-slate-700'}>{point.date}</span>
                      <span className={dark ? 'text-slate-400' : 'text-slate-500'}>{formatCurrency(revenue)}</span>
                    </div>
                    <div className={`h-2 rounded-full ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${widthPercent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-sm font-semibold">Revenue by Category</h2>
          </div>
          <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {loadingAnalytics ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
            ) : revenueByCategory.length === 0 ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>No category data.</p>
            ) : (
              revenueByCategory.slice(0, 8).map((item) => (
                <div key={item.categoryName} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{item.categoryName}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.percentage}% of revenue</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(Number(item.revenue || 0))}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-sm font-semibold">Revenue by Payment Method</h2>
          </div>
          <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {loadingAnalytics ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
            ) : revenueByPayment.length === 0 ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>No payment data.</p>
            ) : (
              revenueByPayment.map((item) => (
                <div key={item.method} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{formatPaymentMethod(item.method)}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.percentage}% of revenue</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(Number(item.revenue || 0))}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPeriodLabel(period) {
  if (period === '1year') return '1 Year';
  if (period === 'all') return 'All Time';
  return `${period.replace('days', ' Days')}`;
}

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}