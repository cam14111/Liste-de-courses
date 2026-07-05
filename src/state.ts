import type { AppState, Category, ShoppingList } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_CATEGORY_ORDER, SCHEMA_VERSION, STORAGE_KEY } from './constants';
import { showToast } from './toast';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildEmptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lists: {},
    currentList: 'courses',
    settings: { theme: 'light', fontSize: 100, hideChecked: false },
    collapsedCategories: {},
    collapsedFavoriteCategories: {},
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)) as Record<string, Category>,
    categoryOrder: [...DEFAULT_CATEGORY_ORDER],
    history: {},
    importData: null,
    favorites: [],
    removedDefaultCategories: [],
  };
}

export const state: AppState = buildEmptyState();

function assignState(next: AppState): void {
  for (const key of Object.keys(state) as Array<keyof AppState>) {
    delete (state as unknown as Record<string, unknown>)[key];
  }
  Object.assign(state, next);
}

const SAVE_DEBOUNCE_MS = 200;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let storageWarned = false;

function writeNow(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('localStorage save failed:', e);
    if (!storageWarned) {
      storageWarned = true;
      try {
        showToast('Stockage local indisponible — vos modifications ne sont pas sauvegardées', {
          variant: 'error',
          duration: 6000,
        });
      } catch {
        /* noop */
      }
    }
  }
}

export function saveToLocalStorage(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    writeNow();
  }, SAVE_DEBOUNCE_MS);
}

export function flushPendingSave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    writeNow();
  }
}

function mergeCategories(
  saved: Record<string, Partial<Category>> | undefined,
  removedDefaults: string[],
): Record<string, Category> {
  const out: Record<string, Category> = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  // « autre » est indispensable (catégorie de repli), on ne la retire jamais.
  for (const removed of removedDefaults) {
    if (removed !== 'autre') delete out[removed];
  }
  if (!saved) return out;

  for (const [key, savedCat] of Object.entries(saved)) {
    const defaultCat = DEFAULT_CATEGORIES[key];
    if (defaultCat) {
      out[key] = {
        id: defaultCat.id,
        icon: savedCat.icon || defaultCat.icon,
        color: defaultCat.color,
        keywords: defaultCat.keywords,
        priority: defaultCat.priority || 0,
      };
    } else {
      out[key] = {
        id: savedCat.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        icon: savedCat.icon || '📦',
        color: savedCat.color || 'var(--cat-autre)',
        keywords: savedCat.keywords || [],
        priority: savedCat.priority ?? 2,
      };
    }
  }
  return out;
}

function mergeCategoryOrder(saved: string[] | undefined, removedDefaults: string[]): string[] {
  let order = saved && saved.length > 0 ? [...saved] : [...DEFAULT_CATEGORY_ORDER];
  const missing = DEFAULT_CATEGORY_ORDER.filter(
    (c) => !order.includes(c) && (c === 'autre' || !removedDefaults.includes(c)),
  );
  if (missing.length > 0) {
    const autreIndex = order.indexOf('autre');
    if (autreIndex !== -1) {
      order = [
        ...order.slice(0, autreIndex),
        ...missing.filter((c) => c !== 'autre'),
        ...order.slice(autreIndex),
      ];
    } else {
      order = [...order, ...missing];
    }
  }
  return order;
}

function migrateItemCategories(next: AppState): void {
  Object.values(next.lists).forEach((list) => {
    if (!list.items) return;
    list.items.forEach((item) => {
      if (item.favorite === undefined) item.favorite = false;

      let found = false;
      for (const data of Object.values(next.categories)) {
        if (data.id === item.category) {
          found = true;
          break;
        }
      }
      if (!found) {
        if (next.categories[item.category]) {
          item.category = next.categories[item.category].id;
        } else {
          item.category = next.categories['autre']?.id || 'default_autre';
        }
      }
    });
  });
}

function migrateFavorites(next: AppState): void {
  if (next.favorites.length === 0) {
    const seen = new Set<string>();
    Object.values(next.lists).forEach((list) => {
      list.items?.forEach((item) => {
        if (item.favorite) {
          const key = item.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            next.favorites.push({ name: item.name, category: item.category });
          }
        }
      });
    });
  }

  next.favorites.forEach((fav) => {
    let found = false;
    for (const data of Object.values(next.categories)) {
      if (data.id === fav.category) {
        found = true;
        break;
      }
    }
    if (!found) {
      if (next.categories[fav.category]) {
        fav.category = next.categories[fav.category].id;
      } else {
        fav.category = next.categories['autre']?.id || 'default_autre';
      }
    }
  });
}

export function migrateState(raw: unknown): AppState {
  const next = buildEmptyState();
  if (!raw || typeof raw !== 'object') return next;
  const loaded = raw as Partial<AppState> & { categories?: Record<string, Partial<Category>> };

  next.schemaVersion = SCHEMA_VERSION;
  next.lists = loaded.lists || {};
  next.currentList = loaded.currentList || 'courses';
  next.settings = {
    theme: loaded.settings?.theme === 'dark' ? 'dark' : 'light',
    fontSize: loaded.settings?.fontSize || 100,
    hideChecked: loaded.settings?.hideChecked || false,
  };
  next.collapsedCategories = loaded.collapsedCategories || {};
  next.collapsedFavoriteCategories = loaded.collapsedFavoriteCategories || {};
  next.removedDefaultCategories = Array.isArray(loaded.removedDefaultCategories)
    ? loaded.removedDefaultCategories.filter((k): k is string => typeof k === 'string')
    : [];
  next.categories = mergeCategories(loaded.categories, next.removedDefaultCategories);
  next.categoryOrder = mergeCategoryOrder(loaded.categoryOrder, next.removedDefaultCategories);
  next.history = loaded.history || {};
  next.importData = loaded.importData || null;
  next.favorites = loaded.favorites || [];

  // Garantit au moins une liste et une liste courante valide.
  if (Object.keys(next.lists).length === 0) {
    next.lists['courses'] = { name: 'Courses', items: [] };
  }
  Object.values(next.lists).forEach((list) => {
    if (!Array.isArray(list.items)) list.items = [];
  });
  if (!next.lists[next.currentList]) {
    next.currentList = Object.keys(next.lists)[0];
  }

  migrateItemCategories(next);
  migrateFavorites(next);

  return next;
}

export function loadFromLocalStorage(): void {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.error('localStorage read failed:', e);
  }

  if (saved) {
    try {
      const raw = JSON.parse(saved);
      assignState(migrateState(raw));
      if (state.favorites.length > 0) flushPendingSave();
    } catch (e) {
      console.error('localStorage parse failed, resetting:', e);
      assignState(buildEmptyState());
      state.lists['courses'] = { name: 'Courses', items: [] };
    }
  } else {
    state.lists['courses'] = { name: 'Courses', items: [] };
    // Premier lancement : suit la préférence système pour le thème.
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.settings.theme = 'dark';
    }
  }
}

export function getCurrentList(): ShoppingList {
  let list = state.lists[state.currentList];
  if (!list) {
    // État incohérent (liste courante supprimée) : on se raccroche à la
    // première liste existante, ou on en recrée une plutôt que de planter.
    const firstId = Object.keys(state.lists)[0];
    if (firstId) {
      state.currentList = firstId;
    } else {
      state.lists['courses'] = { name: 'Courses', items: [] };
      state.currentList = 'courses';
    }
    list = state.lists[state.currentList];
    saveToLocalStorage();
  }
  return list;
}
