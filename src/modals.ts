import { state, saveToLocalStorage, getCurrentList } from './state';
import { getCategoryLabel } from './constants';
import { escapeHtml, escapeAttr } from './utils/escape';
import { createFocusTrap, type FocusTrap, getFocusables } from './utils/focus-trap';

const traps = new Map<string, FocusTrap>();
const previousFocus = new Map<string, HTMLElement | null>();

export function openModal(modalId: string): void {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  previousFocus.set(modalId, document.activeElement as HTMLElement | null);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  const trap = createFocusTrap(modal, () => closeModal(modalId));
  traps.set(modalId, trap);

  requestAnimationFrame(() => {
    const items = getFocusables(modal);
    const initial = items.find((el) => el.tagName !== 'BUTTON' || !el.classList.contains('close-btn'));
    (initial || items[0])?.focus();
  });
}

export function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  traps.get(modalId)?.release();
  traps.delete(modalId);

  const prev = previousFocus.get(modalId);
  previousFocus.delete(modalId);
  prev?.focus?.();

  if (modalId === 'favoritesModal') {
    state.categoryOrder.forEach((cat) => {
      state.collapsedFavoriteCategories[cat] = true;
    });
    saveToLocalStorage();
  }
}

export let currentEditingId: string | null = null;

export function openEditModal(itemId: string): void {
  const list = getCurrentList();
  const item = list.items.find((i) => i.id === itemId);
  if (!item) return;

  currentEditingId = itemId;
  (document.getElementById('editItemName') as HTMLInputElement).value = item.name;
  (document.getElementById('editItemQuantity') as HTMLInputElement).value = item.quantity;
  const priceInput = document.getElementById('editItemPrice') as HTMLInputElement | null;
  if (priceInput) priceInput.value = typeof item.price === 'number' ? String(item.price) : '';

  const select = document.getElementById('editItemCategory') as HTMLSelectElement;
  select.innerHTML = state.categoryOrder
    .filter((cat) => state.categories[cat])
    .map((cat) => {
      const data = state.categories[cat];
      return `<option value="${escapeAttr(data.id)}" ${data.id === item.category ? 'selected' : ''}>${data.icon} ${escapeHtml(getCategoryLabel(cat))}</option>`;
    })
    .join('');

  openModal('editModal');
}
