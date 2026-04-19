import { describe, expect, it } from 'vitest';
import {
  capitalize,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPaymentMethod,
} from './formatters';

describe('admin formatters', () => {
  it('formats currency values', () => {
    expect(formatCurrency(1234.5)).toMatch('$1,234.50');
  });

  it('formats numbers', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats date safely', () => {
    expect(formatDate('2026-04-19T00:00:00.000Z')).toContain('2026');
    expect(formatDate(null)).toBe('-');
  });

  it('capitalizes words', () => {
    expect(capitalize('admin')).toBe('Admin');
    expect(capitalize('')).toBe('');
  });

  it('formats payment method labels', () => {
    expect(formatPaymentMethod('credit_card')).toBe('Credit Card');
    expect(formatPaymentMethod(null)).toBe('-');
  });
});
