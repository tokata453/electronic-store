export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function capitalize(value) {
  const str = String(value || '');
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPaymentMethod(value) {
  if (!value) return '-';
  return String(value)
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}