import { useEffect, useMemo, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../services/admin';
import { capitalize, formatCurrency, formatDate, formatNumber, formatPaymentMethod } from './utils/formatters';
import { useTheme } from './products/useTheme';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const [editingOrder, setEditingOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const response = await getAdminOrders({
        status: statusFilter || undefined,
        page,
        limit: 10,
      });

      setOrders(response?.data?.orders ?? response?.orders ?? []);
      setPagination(response?.data?.pagination ?? response?.pagination ?? null);
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  function openEditModal(order) {
    setEditingOrder(order);
    setNextStatus(order?.status || 'pending');
    setTrackingNumber(order?.trackingNumber || '');
  }

  function closeEditModal() {
    setEditingOrder(null);
    setNextStatus('');
    setTrackingNumber('');
  }

  async function handleUpdateStatus(e) {
    e.preventDefault();
    if (!editingOrder) return;

    if (nextStatus === 'shipped' && !trackingNumber.trim()) {
      setErr('Tracking number is required when status is set to shipped.');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      const payload = { status: nextStatus };
      if (trackingNumber.trim()) {
        payload.trackingNumber = trackingNumber.trim();
      }

      await updateOrderStatus(editingOrder.id, payload);
      closeEditModal();
      await load();
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = `rounded-lg px-3 py-2 outline-none transition ${
    dark
      ? 'border border-slate-700 bg-slate-900 text-white focus:border-slate-500'
      : 'border border-slate-300 bg-white text-slate-900 focus:border-slate-400'
  }`;

  const pageLabel = useMemo(() => {
    if (!pagination) return `Page ${page}`;
    return `Page ${pagination.page} of ${pagination.pages}`;
  }, [pagination, page]);

  const canGoNext = useMemo(() => {
    if (loading) return false;
    if (pagination?.pages) return page < pagination.pages;
    return orders.length === 10;
  }, [loading, orders.length, page, pagination?.pages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Orders
          </h1>
          <p className={dark ? 'text-slate-400' : 'text-slate-600'}>
            Review all orders and update fulfillment status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className={inputCls}
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {capitalize(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      )}

      <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-245 w-full text-left text-sm">
          <thead className={dark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}>
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 hidden md:table-cell">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {loading ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={8}>
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={8}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className={dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.orderNumber || `#${order.id}`}</p>
                    {order.trackingNumber ? (
                      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tracking: {order.trackingNumber}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{formatUserName(order.user)}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {order.user?.email || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatNumber(order.items?.length || 0)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(order.totalAmount || 0))}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{formatPaymentMethod(order.paymentMethod)}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadgeClass(order.status, dark)}>{capitalize(order.status || 'unknown')}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(order)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        dark
                          ? 'bg-slate-800 text-white hover:bg-slate-700'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={loading || page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            loading || page <= 1
              ? dark
                ? 'cursor-not-allowed bg-slate-900 text-slate-600'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
              : dark
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
        >
          Previous
        </button>

        <span className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{pageLabel}</span>

        <button
          disabled={!canGoNext}
          onClick={() => setPage((prev) => prev + 1)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            !canGoNext
              ? dark
                ? 'cursor-not-allowed bg-slate-900 text-slate-600'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
              : dark
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
        >
          Next
        </button>
      </div>

      {editingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-xl border p-5 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Update Order Status
            </h2>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {editingOrder.orderNumber || `Order #${editingOrder.id}`}
            </p>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
              <div>
                <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="next-status">
                  Status
                </label>
                <select
                  id="next-status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className={`w-full ${inputCls}`}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {capitalize(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="tracking-number">
                  Tracking Number
                </label>
                <input
                  id="tracking-number"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={nextStatus === 'shipped' ? 'Required for shipped orders' : 'Optional'}
                  className={`w-full ${inputCls}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    dark
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatUserName(user) {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return fullName || user?.email || '-';
}

function statusBadgeClass(status, dark) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'delivered') {
    return 'inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500';
  }

  if (normalized === 'cancelled' || normalized === 'refunded') {
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