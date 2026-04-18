import api from './api';

// Admin access and dashboard
export async function getAdminAccessCheck() {
  const response = await api.get('/api/admin');
  return response.data;
}

export async function getDashboardStats() {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
}

export async function getSalesReport({ startDate, endDate, groupBy } = {}) {
  const response = await api.get('/api/admin/sales-report', {
    params: { startDate, endDate, groupBy },
  });
  return response.data;
}

export async function getRevenueAnalytics({ period } = {}) {
  const response = await api.get('/api/admin/revenue-analytics', {
    params: { period },
  });
  return response.data;
}

export async function getTopProducts({ limit, sortBy } = {}) {
  const response = await api.get('/api/admin/top-products', {
    params: { limit, sortBy },
  });
  return response.data;
}

export async function getLowStockProducts({ threshold } = {}) {
  const response = await api.get('/api/admin/low-stock', {
    params: { threshold },
  });
  return response.data;
}

export async function getRecentOrders({ limit } = {}) {
  const response = await api.get('/api/admin/recent-orders', {
    params: { limit },
  });
  return response.data;
}

export async function getCustomerStats() {
  const response = await api.get('/api/admin/customer-stats');
  return response.data;
}

export async function exportSalesReport({ startDate, endDate, format = 'csv' } = {}) {
  const response = await api.get('/api/admin/export-sales', {
    params: { startDate, endDate, format },
    responseType: format === 'csv' ? 'blob' : 'json',
  });
  return response;
}

// Admin orders
export async function getAdminOrders({ status, page = 1, limit = 20 } = {}) {
  const response = await api.get('/api/orders/admin/all', {
    params: { status, page, limit },
  });
  return response.data;
}

export async function updateOrderStatus(id, payload) {
  const response = await api.put(`/api/orders/${id}/status`, payload);
  return response.data;
}

// Admin users
export async function getUsers() {
  const response = await api.get('/api/users');
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
}

export async function updateUserById(id, payload) {
  const response = await api.put(`/api/users/${id}`, payload);
  return response.data;
}

export async function deleteUserById(id) {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
}