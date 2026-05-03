import type { Item } from './types';
import { state, saveToLocalStorage, getCurrentList, generateId } from './state';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { openModal, closeModal } from './modals';
import { showToast } from './toast';
import { alertDialog } from './confirm';
import { ImportPayloadSchema, type ImportPayload } from './schemas';

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
    version: 3,
    name: list.name,
    items: list.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      checked: item.checked,
      ...(typeof item.price === 'number' ? { price: item.price } : {}),
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
    showToast('Code copié !', { variant: 'success', duration: 2000 });
  } catch {
    navigator.clipboard
      .writeText(code.value)
      .then(() => showToast('Code copié !', { variant: 'success', duration: 2000 }))
      .catch(() => showToast('Erreur lors de la copie', { variant: 'error' }));
  }
}

function decodeAndValidate(code: string): ImportPayload {
  const decoded = JSON.parse(atob(code));
  return ImportPayloadSchema.parse(decoded);
}

export function processImportCode(): void {
  const codeEl = document.getElementById('importCode') as HTMLTextAreaElement | null;
  if (!codeEl) return;
  const code = codeEl.value.trim();
  if (!code) {
    showToast('Veuillez coller un code valide', { variant: 'error' });
    return;
  }
  try {
    const payload = decodeAndValidate(code);
    state.importData = payload;
    const nameEl = document.getElementById('importListName');
    const countEl = document.getElementById('importItemCount');
    if (nameEl) nameEl.textContent = payload.name;
    if (countEl) countEl.textContent = String(payload.items.length);
    closeModal('importManualModal');
    openModal('importModal');
    codeEl.value = '';
  } catch (e) {
    void alertDialog('Code invalide. Veuillez vérifier et réessayer.', 'Import impossible');
    console.error('Erreur import:', e);
  }
}

export function checkImportUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const importData = params.get('import');
  if (!importData) return;
  try {
    const payload = decodeAndValidate(importData);
    state.importData = payload;
    const nameEl = document.getElementById('importListName');
    const countEl = document.getElementById('importItemCount');
    if (nameEl) nameEl.textContent = payload.name;
    if (countEl) countEl.textContent = String(payload.items.length);
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

export function handleImport(action: 'replace' | 'merge' | 'new'): void {
  const importData = state.importData as ImportPayload | null;
  if (!importData) return;

  const list = getCurrentList();
  const normalized = importData.items.map((item) => ({
    ...item,
    category: normalizeCategoryOnImport(item.category),
  }));

  const toItem = (raw: typeof normalized[number]): Item => ({
    id: generateId(),
    name: raw.name,
    quantity: raw.quantity ?? '',
    category: raw.category,
    checked: raw.checked ?? false,
    favorite: false,
    addedAt: Date.now(),
    ...(typeof raw.price === 'number' ? { price: raw.price } : {}),
  });

  if (action === 'replace') {
    list.items = normalized.map(toItem);
  } else if (action === 'merge') {
    const existing = list.items.map((i) => i.name.toLowerCase());
    normalized.forEach((item) => {
      if (!existing.includes(item.name.toLowerCase())) {
        list.items.push(toItem(item));
      }
    });
  } else if (action === 'new') {
    const newId = generateId();
    state.lists[newId] = {
      name: importData.name,
      items: normalized.map(toItem),
    };
    state.currentList = newId;
  }

  state.importData = null;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
  closeModal('importModal');
}
