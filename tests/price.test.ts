import { describe, expect, it } from 'vitest';
import { parsePrice, formatPrice, computeTotals } from '../src/utils/price';
import type { Item } from '../src/types';

const item = (overrides: Partial<Item> = {}): Item => ({
  id: 'x',
  name: 'item',
  quantity: '',
  category: 'default_autre',
  checked: false,
  favorite: false,
  addedAt: 0,
  ...overrides,
});

describe('parsePrice', () => {
  it('parses dot decimals', () => {
    expect(parsePrice('2.50')).toBe(2.5);
  });

  it('parses comma decimals (FR)', () => {
    expect(parsePrice('2,50')).toBe(2.5);
  });

  it('rounds to 2 decimals', () => {
    expect(parsePrice('1.999')).toBe(2);
  });

  it('returns undefined for empty', () => {
    expect(parsePrice('')).toBeUndefined();
    expect(parsePrice('   ')).toBeUndefined();
  });

  it('rejects negatives and non-numeric', () => {
    expect(parsePrice('-1')).toBeUndefined();
    expect(parsePrice('abc')).toBeUndefined();
  });
});

describe('formatPrice', () => {
  it('formats as EUR fr-FR', () => {
    const out = formatPrice(2.5);
    expect(out).toMatch(/2,50/);
    expect(out).toMatch(/€/);
  });
});

describe('computeTotals', () => {
  it('returns zeros for empty list', () => {
    expect(computeTotals([])).toEqual({
      total: 0,
      remaining: 0,
      itemsWithPrice: 0,
      itemsWithoutPrice: 0,
    });
  });

  it('sums priced items, subtracts checked from remaining', () => {
    const totals = computeTotals([
      item({ price: 2.5 }),
      item({ price: 3.5, checked: true }),
      item({ price: 1.0 }),
      item({}),
    ]);
    expect(totals.total).toBe(7);
    expect(totals.remaining).toBe(3.5);
    expect(totals.itemsWithPrice).toBe(3);
    expect(totals.itemsWithoutPrice).toBe(1);
  });
});
