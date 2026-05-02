import type { Item } from './types';
import { state, saveToLocalStorage, getCurrentList, generateId } from './state';
import { getCategory } from './categorize';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { renderSuggestions } from './render/suggestions';
import { renderFavorites } from './render/favorites';

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
  if (!confirm('Supprimer cet article ?')) return;
  const list = getCurrentList();
  list.items = list.items.filter((item) => item.id !== itemId);
  saveToLocalStorage();
  renderListTabs();
  renderItems();
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

export function clearCheckedItems(): void {
  const list = getCurrentList();
  const checkedCount = list.items.filter((i) => i.checked).length;
  if (checkedCount === 0) {
    alert('Aucun article coché');
    return;
  }
  if (confirm(`Supprimer ${checkedCount} article(s) coché(s) ?`)) {
    list.items = list.items.filter((item) => !item.checked);
    saveToLocalStorage();
    renderListTabs();
    renderItems();
  }
}
