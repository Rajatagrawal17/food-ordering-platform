import { describe, expect, test } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  test('formats values as INR', () => {
    expect(formatCurrency(250)).toBe('₹250');
  });
});