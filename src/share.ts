import type { Item } from './types';
import { state, saveToLocalStorage, getCurrentList, generateId } from './state';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { openModal, closeModal } from './modals';

declare global {
  interface Window {
    QRCode?: new (
      element: HTMLElement,
      opts: { text: string; width: number; height: number },
    ) => unknown;
  }
}

export function generateQRCode(): void {
  const list = getCurrentList();
  const data = {
    version: 2,
    name: list.name,
    items: list.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      checked: item.checked,
    })),
    timestamp: Date.now(),
  };

  const encoded = btoa(JSON.stringify(data));

  const qrEl = document.getElementById('qrcode');
  if (qrEl) {
    qrEl.innerHTML = '';
    if (window.QRCode) {
      new window.QRCode(qrEl, { text: encoded, width: 256, height: 256 });
    }
  }

  const codeEl = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (codeEl) codeEl.value = encoded;

  openModal('shareModal');
}

export function copyShareCode(): void {
  const code = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (!code) return;
  code.select();
  code.setSelectionRange(0, 99999);
  try {
    document.execCommand('copy');
    alert('Code copié !');
  } catch {
    navigator.clipboard
      .writeText(code.value)
      .then(() => alert('Code copié !'))
      .catch(() => alert('Erreur lors de la copie'));
  }
}

export function processImportCode(): void {
  const codeEl = document.getElementById('importCode') as HTMLTextAreaElement | null;
  if (!codeEl) return;
  const code = codeEl.value.trim();
  if (!code) {
    alert('Veuillez coller un code valide');
    return;
  }
  try {
    const decoded = JSON.parse(atob(code));
    if (!decoded.name || !decoded.items) throw new Error('Format invalide');
    state.importData = decoded;
    const nameEl = document.getElementById('importListName');
    const countEl = document.getElementById('importItemCount');
    if (nameEl) nameEl.textContent = decoded.name;
    if (countEl) countEl.textContent = String(decoded.items.length);
    closeModal('importManualModal');
    openModal('importModal');
    codeEl.value = '';
  } catch (e) {
    alert('Code invalide. Veuillez vérifier et réessayer.');
    console.error('Erreur import:', e);
  }
}

export function checkImportUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const importData = params.get('import');
  if (!importData) return;
  try {
    const decoded = JSON.parse(atob(importData));
    state.importData = decoded;
    const nameEl = document.getElementById('importListName');
    const countEl = document.getElementById('importItemCount');
    if (nameEl) nameEl.textContent = decoded.name;
    if (countEl) countEl.textContent = String(decoded.items.length);
    openModal('importModal');
    window.history.replaceState({}, '', window.location.pathname);
  } catch (e) {
    console.error('Erreur import:', e);
  }
}

export function normalizeCategoryOnImport(importedCategory: string): string {
  for (const data of Object.values(state.categories)) {
    if (data.id === importedCategory) return data.id;
  }
  if (importedCategory && importedCategory.startsWith('default_')) {
    const defaultKey = importedCategory.replace('default_', '');
    if (state.categories[defaultKey]?.id === importedCategory) return importedCategory;
  }
  if (state.categories[importedCategory]) {
    return state.categories[importedCategory].id || importedCategory;
  }
  return state.categories['autre']?.id || 'default_autre';
}

type ImportItem = Omit<Item, 'id' | 'favorite' | 'addedAt'>;

export function handleImport(action: 'replace' | 'merge' | 'new'): void {
  const importData = state.importData as
    | { name: string; items: ImportItem[] }
    | null;
  if (!importData) return;

  const list = getCurrentList();
  const normalized = importData.items.map((item) => ({
    ...item,
    category: normalizeCategoryOnImport(item.category),
  }));

  if (action === 'replace') {
    list.items = normalized.map((item) => ({
      ...item,
      id: generateId(),
      favorite: false,
      addedAt: Date.now(),
    }));
  } else if (action === 'merge') {
    const existing = list.items.map((i) => i.name.toLowerCase());
    normalized.forEach((item) => {
      if (!existing.includes(item.name.toLowerCase())) {
        list.items.push({
          ...item,
          id: generateId(),
          favorite: false,
          addedAt: Date.now(),
        });
      }
    });
  } else if (action === 'new') {
    const newId = generateId();
    state.lists[newId] = {
      name: importData.name,
      items: normalized.map((item) => ({
        ...item,
        id: generateId(),
        favorite: false,
        addedAt: Date.now(),
      })),
    };
    state.currentList = newId;
  }

  state.importData = null;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
  closeModal('importModal');
}
