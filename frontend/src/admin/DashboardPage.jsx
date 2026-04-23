import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getLowStockProducts, getRecentOrders, getSalesReport, getTopProducts } from '../services/admin';
import { formatCurrency, formatDate, formatNumber } from './utils/formatters';
import { useTheme } from './products/useTheme';

const REVENUE_PERIODS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  total: 'Total',
};

function getRevenueRange(period) {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [err, setErr] = useState('');
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [revenueTotals, setRevenueTotals] = useState({});

  async function loadRevenue(period) {
    setLoadingRevenue(true);
    setErr('');

    try {
      if (period === 'total') {
        const totalRevenue = Number(stats?.totalRevenue?.all || 0);
        setRevenueTotals((prev) => ({
          ...prev,
          total: totalRevenue,
        }));
        return;
      }

      const { startDate, endDate } = getRevenueRange(period);
      const response = await getSalesReport({ startDate, endDate, groupBy: 'day' });
      const totalRevenue = Number(
        response?.data?.summary?.totalRevenue ?? response?.summary?.totalRevenue ?? 0
      );

      setRevenueTotals((prev) => ({
        ...prev,
        [period]: totalRevenue,
      }));
    } catch (error) {
      setErr(error?.response?.data?.error?.message || error?.message || 'Failed to load revenue data');
    } finally {
      setLoadingRevenue(false);
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr('');

      try {
        const [dashboardRes, recentRes, lowStockRes, topProductsRes] = await Promise.all([
          getDashboardStats(),
          getRecentOrders({ limit: 5 }),
          getLowStockProducts({ threshold: 10 }),
          getTopProducts({ limit: 5, sortBy: 'revenue' }),
        ]);

        setStats(dashboardRes?.data?.stats ?? dashboardRes?.stats ?? null);
        setRecentOrders(recentRes?.data?.orders ?? recentRes?.orders ?? []);
        setLowStock(lowStockRes?.data?.lowStockProducts ?? lowStockRes?.lowStockProducts ?? []);
        setTopProducts(topProductsRes?.data?.topProducts ?? topProductsRes?.topProducts ?? []);
        await loadRevenue('monthly');
      } catch (error) {
        setErr(error?.response?.data?.message || error?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (revenueTotals[revenuePeriod] != null) {
      return;
    }

    loadRevenue(revenuePeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenuePeriod]);

  const cards = useMemo(() => {
    const revenueAll = Number(stats?.totalRevenue?.all || 0);
    const revenueValue = Number(
      revenueTotals[revenuePeriod] ?? (revenuePeriod === 'total' ? revenueAll : stats?.totalRevenue?.month ?? 0)
    );
    const ordersAll = Number(stats?.totalOrders?.all || 0);
    const customers = Number(stats?.totalCustomers || 0);
    const lowStockCount = Number(stats?.lowStockProducts || lowStock.length || 0);

    return [
      {
        isRevenue: true,
        label: `${REVENUE_PERIODS[revenuePeriod]} Revenue`,
        value: formatCurrency(revenueValue),
        sub: '',
      },
      { label: 'Total Orders', value: formatNumber(ordersAll), sub: `Pending: ${formatNumber(Number(stats?.pendingOrders || 0))}` },
      { label: 'Customers', value: formatNumber(customers), sub: `Processing: ${formatNumber(Number(stats?.processingOrders || 0))} orders` },
      { label: 'Low Stock Items', value: formatNumber(lowStockCount), sub: 'Threshold: less than 10 units' },
    ];
  }, [revenuePeriod, revenueTotals, stats, lowStock.length]);

  const cardClass = `rounded-xl border p-4 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Dashboard
          </h1>
          <p className={dark ? 'text-slate-400' : 'text-slate-600'}>
            Overview of revenue, orders, stock health, and top-selling products.
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className={cardClass}>
            <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {card.label}
            </p>
            {card.isRevenue ? (
              <div className="mt-2 space-y-3">
                <div className="flex flex-nowrap gap-1.5">
                  {Object.entries(REVENUE_PERIODS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRevenuePeriod(key)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                        revenuePeriod === key
                          ? 'bg-emerald-400 text-slate-950'
                          : dark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-pressed={revenuePeriod === key}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className={`text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {loading || loadingRevenue ? '...' : card.value}
                </p>
              </div>
            ) : (
              <>
                <p className={`mt-2 text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {loading ? '...' : card.value}
                </p>
                <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {loading ? 'Loading...' : card.sub}
                </p>
              </>
            )}
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-sm font-semibold">Recent Orders</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className={dark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}>
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={4}>
                    No recent orders.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className={dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.orderNumber || `#${order.id}`}</p>
                      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">{order.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(order.totalAmount || 0))}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadgeClass(order.status, dark)}>{order.status || 'unknown'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
            <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Low Stock Alerts</h2>
                <Link
                  to="/admin/products/out-of-stock"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    dark
                      ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  }`}
                >
                  View Out of Stock
                </Link>
              </div>
            </div>
          <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {loading ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
            ) : lowStock.length === 0 ? (
              <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>No low stock products.</p>
            ) : (
              lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className={`flex items-center justify-between px-4 py-3 ${dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}`}>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.sku || 'No SKU'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500">
                    {item.stock ?? 0} left
                  </span>
                </div>
              ))
            )}
          </div>
          </div>

          <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
            <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className="text-sm font-semibold">Top Products</h2>
            </div>
            <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {loading ? (
                <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
              ) : topProducts.length === 0 ? (
                <p className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>No top product data.</p>
              ) : (
                topProducts.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between px-4 py-3 ${dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}`}>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Sold: {formatNumber(Number(item.totalSold || 0))}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(Number(item.totalRevenue || 0))}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function statusBadgeClass(status, dark) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'delivered') {
    return 'inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500';
  }

  if (normalized === 'cancelled') {
    return 'inline-flex rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500';
  }

  if (normalized === 'shipped' || normalized === 'processing') {
    return 'inline-flex rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-500';
  }

  if (normalized === 'pending') {
    return 'inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500';
  }

  return `inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
    dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
  }`;
}