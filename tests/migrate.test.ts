import { describe, expect, it } from 'vitest';
import { migrateState } from '../src/state';
import { SCHEMA_VERSION } from '../src/constants';

describe('migrateState', () => {
  it('returns a fully populated empty state for null/garbage input', () => {
    const s = migrateState(null);
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.lists).toEqual({});
    expect(s.categories.fruits.id).toBe('default_fruits');
    expect(s.categoryOrder).toContain('autre');
  });

  it('guarantees at least one list and a valid currentList', () => {
    const empty = migrateState({ lists: {}, currentList: 'fantome' });
    expect(Object.keys(empty.lists)).toHaveLength(1);
    expect(empty.lists[empty.currentList]).toBeDefined();

    const dangling = migrateState({
      lists: { a: { name: 'L', items: [] } },
      currentList: 'supprimee',
    });
    expect(dangling.currentList).toBe('a');
  });

  it('repairs lists whose items array is missing', () => {
    const s = migrateState({ lists: { a: { name: 'L' } }, currentList: 'a' });
    expect(Array.isArray(s.lists.a.items)).toBe(true);
  });

  it('does not resurrect removed default categories', () => {
    const s = migrateState({
      removedDefaultCategories: ['voyage', 'auto'],
      categoryOrder: ['fruits', 'autre'],
    });
    expect(s.categories.voyage).toBeUndefined();
    expect(s.categories.auto).toBeUndefined();
    expect(s.categoryOrder).not.toContain('voyage');
    // les autres catégories par défaut restent restaurées
    expect(s.categories.sport).toBeDefined();
  });

  it('never removes the "autre" fallback category', () => {
    const s = migrateState({ removedDefaultCategories: ['autre'] });
    expect(s.categories.autre).toBeDefined();
  });

  it('migrates legacy items that store category as a name (not id)', () => {
    const raw = {
      lists: {
        a: {
          name: 'L',
          items: [{ id: '1', name: 'pomme', quantity: '', category: 'fruits', checked: false }],
        },
      },
      currentList: 'a',
    };
    const s = migrateState(raw);
    expect(s.lists.a.items[0].category).toBe('default_fruits');
  });

  it('falls back to "autre" for unknown category strings', () => {
    const raw = {
      lists: {
        a: {
          name: 'L',
          items: [
            { id: '1', name: 'x', quantity: '', category: 'inexistant', checked: false },
          ],
        },
      },
    };
    const s = migrateState(raw);
    expect(s.lists.a.items[0].category).toBe('default_autre');
  });

  it('extracts favorites from items when state.favorites is empty', () => {
    const raw = {
      lists: {
        a: {
          name: 'L',
          items: [
            {
              id: '1',
              name: 'Lait',
              quantity: '',
              category: 'default_laitiers',
              checked: false,
              favorite: true,
            },
          ],
        },
      },
      favorites: [],
    };
    const s = migrateState(raw);
    expect(s.favorites).toHaveLength(1);
    expect(s.favorites[0].name).toBe('Lait');
  });

  it('inserts missing default categories before "autre" in categoryOrder', () => {
    const raw = {
      categoryOrder: ['fruits', 'legumes', 'autre'],
    };
    const s = migrateState(raw);
    expect(s.categoryOrder).toContain('voyage');
    expect(s.categoryOrder.indexOf('voyage')).toBeLessThan(s.categoryOrder.indexOf('autre'));
  });

  it('preserves custom categories defined by the user', () => {
    const raw = {
      categories: {
        atelier: { id: 'custom_xyz', icon: '🪛', color: 'var(--cat-bricolage)', keywords: [] },
      },
    };
    const s = migrateState(raw);
    expect(s.categories.atelier.id).toBe('custom_xyz');
    expect(s.categories.atelier.priority).toBe(2);
  });
});
