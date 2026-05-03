import type { Item } from '../types';

export function parsePrice(raw: string): number | undefined {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return undefined;
  return Math.round(num * 100) / 100;
}

const FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return FORMATTER.format(value);
}

export interface CartTotals {
  total: number;
  remaining: number;
  itemsWithPrice: number;
  itemsWithoutPrice: number;
}

export function computeTotals(items: Item[]): CartTotals {
  let total = 0;
  let remaining = 0;
  let withPrice = 0;
  let withoutPrice = 0;
  for (const item of items) {
    if (typeof item.price === 'number') {
      total += item.price;
      if (!item.checked) remaining += item.price;
      withPrice++;
    } else {
      withoutPrice++;
    }
  }
  return {
    total: Math.round(total * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    itemsWithPrice: withPrice,
    itemsWithoutPrice: withoutPrice,
  };
}
