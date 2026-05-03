import type { Item } from './types';
import { state, saveToLocalStorage, getCurrentList, generateId } from './state';
import { getCategory } from './categorize';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { renderSuggestions } from './render/suggestions';
import { renderFavorites } from './render/favorites';
import { showToast } from './toast';
import { confirmDialog } from './confirm';

export function addItem(name: string, quantity = '', category: string | null = null): void {
  const list = getCurrentList();
  const trimmed = name.trim();
  const isFavorite = state.favorites.some((f) => f.name.toLowerCase() === trimmed.toLowerCase());

  const item: Item = {
    id: generateId(),
    name: trimmed,
    quantity,
    category: category || getCategory(name, state.categories),
    checked: false,
    favorite: isFavorite,
    addedAt: Date.now(),
  };
  list.items.push(item);

  const key = name.toLowerCase();
  state.history[key] = (state.history[key] || 0) + 1;

  saveToLocalStorage();
  renderListTabs();
  renderItems();
  renderSuggestions();
}

export function deleteItem(itemId: string): void {
  const list = getCurrentList();
  const idx = list.items.findIndex((item) => item.id === itemId);
  if (idx === -1) return;

  const [removed] = list.items.splice(idx, 1);
  saveToLocalStorage();
  renderListTabs();
  renderItems();

  showToast(`"${removed.name}" supprimé`, {
    variant: 'info',
    duration: 5000,
    action: {
      label: 'Annuler',
      onClick: () => {
        const current = getCurrentList();
        const targetIdx = Math.min(idx, current.items.length);
        current.items.splice(targetIdx, 0, removed);
        saveToLocalStorage();
        renderListTabs();
        renderItems();
      },
    },
  });
}

export function toggleItem(itemId: string): void {
  const list = getCurrentList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  if (navigator.vibrate) navigator.vibrate(50);
  saveToLocalStorage();
  renderListTabs();
  renderItems();
}

export function toggleFavorite(itemId: string): void {
  const list = getCurrentList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;

  const newFavorite = !item.favorite;
  const nameLower = item.name.toLowerCase();

  Object.values(state.lists).forEach((l) => {
    l.items?.forEach((it) => {
      if (it.name.toLowerCase() === nameLower) it.favorite = newFavorite;
    });
  });

  if (newFavorite) {
    if (!state.favorites.find((f) => f.name.toLowerCase() === nameLower)) {
      state.favorites.push({ name: item.name, category: item.category });
    }
  } else {
    state.favorites = state.favorites.filter((f) => f.name.toLowerCase() !== nameLower);
  }

  saveToLocalStorage();
  renderItems();
  renderFavorites();
}

export function editItem(itemId: string, name: string, quantity: string, category: string): void {
  const list = getCurrentList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;
  item.name = name;
  item.quantity = quantity;
  item.category = category;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
}

export async function clearCheckedItems(): Promise<void> {
  const list = getCurrentList();
  const checked = list.items.filter((i) => i.checked);
  if (checked.length === 0) {
    showToast('Aucun article coché', { variant: 'info', duration: 2000 });
    return;
  }
  const ok = await confirmDialog({
    title: 'Effacer les articles cochés',
    message: `Supprimer ${checked.length} article(s) coché(s) ?`,
    confirmLabel: 'Supprimer',
    destructive: true,
  });
  if (!ok) return;

  const remaining = list.items.filter((item) => !item.checked);
  list.items = remaining;
  saveToLocalStorage();
  renderListTabs();
  renderItems();

  showToast(`${checked.length} article(s) supprimé(s)`, {
    variant: 'success',
    duration: 5000,
    action: {
      label: 'Annuler',
      onClick: () => {
        const current = getCurrentList();
        current.items = [...current.items, ...checked];
        saveToLocalStorage();
        renderListTabs();
        renderItems();
      },
    },
  });
}
