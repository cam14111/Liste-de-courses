import { state, saveToLocalStorage, getCurrentList } from './state';

export function openModal(modalId: string): void {
  document.getElementById(modalId)?.classList.add('active');
}

export function closeModal(modalId: string): void {
  document.getElementById(modalId)?.classList.remove('active');

  if (modalId === 'favoritesModal') {
    state.categoryOrder.forEach((cat) => {
      state.collapsedFavoriteCategories[cat] = true;
    });
    saveToLocalStorage();
  }
}

export let currentEditingId: string | null = null;

export function setCurrentEditingId(id: string | null): void {
  currentEditingId = id;
}

export function openEditModal(itemId: string): void {
  const list = getCurrentList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;

  currentEditingId = itemId;
  (document.getElementById('editItemName') as HTMLInputElement).value = item.name;
  (document.getElementById('editItemQuantity') as HTMLInputElement).value = item.quantity;

  const select = document.getElementById('editItemCategory') as HTMLSelectElement;
  select.innerHTML = Object.keys(state.categories)
    .map((cat) => {
      const data = state.categories[cat];
      return `<option value="${data.id}" ${data.id === item.category ? 'selected' : ''}>${data.icon} ${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`;
    })
    .join('');

  openModal('editModal');
}
