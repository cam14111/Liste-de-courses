import { describe, expect, it } from 'vitest';
import { ImportPayloadSchema } from '../src/schemas';

describe('ImportPayloadSchema', () => {
  it('accepts a minimal valid payload', () => {
    const out = ImportPayloadSchema.parse({
      name: 'Courses',
      items: [{ name: 'Pommes', category: 'default_fruits' }],
    });
    expect(out.items[0].quantity).toBe('');
    expect(out.items[0].checked).toBe(false);
  });

  it('rejects empty list name', () => {
    expect(() => ImportPayloadSchema.parse({ name: '', items: [] })).toThrow();
  });

  it('rejects oversized items', () => {
    const items = Array.from({ length: 2001 }, () => ({ name: 'x', category: 'c' }));
    expect(() => ImportPayloadSchema.parse({ name: 'L', items })).toThrow();
  });

  it('rejects missing category on an item', () => {
    expect(() =>
      ImportPayloadSchema.parse({ name: 'L', items: [{ name: 'x' }] }),
    ).toThrow();
  });

  it('rejects non-string fields', () => {
    expect(() =>
      ImportPayloadSchema.parse({ name: 'L', items: [{ name: 42, category: 'c' }] }),
    ).toThrow();
  });
});
