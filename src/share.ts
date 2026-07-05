import type { Item } from './types';
import { state, saveToLocalStorage, getCurrentList, generateId } from './state';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { renderSuggestions } from './render/suggestions';
import { openModal, closeModal } from './modals';
import { showToast } from './toast';
import { alertDialog } from './confirm';
import { utf8ToBase64, decodeShareCode } from './utils/base64';
import { ImportPayloadSchema, type ImportPayload } from './schemas';

declare global {
  interface Window {
    QRCode?: (new (
      element: HTMLElement,
      opts: { text: string; width: number; height: number; correctLevel?: number },
    ) => unknown) & { CorrectLevel?: { L: number; M: number; Q: number; H: number } };
  }
}

const QRCODE_CDN = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
const QR_LOAD_TIMEOUT_MS = 6000;
let qrScriptPromise: Promise<void> | null = null;

function loadQrLibrary(): Promise<void> {
  if (window.QRCode) return Promise.resolve();
  if (!qrScriptPromise) {
    qrScriptPromise = new Promise((resolve, reject) => {
      const fail = (): void => {
        qrScriptPromise = null;
        reject(new Error('QRCode library load failed'));
      };
      // Réseau lent/suspendu : ne pas attendre indéfiniment, le lien suffit.
      const timer = setTimeout(fail, QR_LOAD_TIMEOUT_MS);
      const script = document.createElement('script');
      script.src = QRCODE_CDN;
      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        fail();
      };
      document.head.appendChild(script);
    });
  }
  return qrScriptPromise;
}

function buildShareCode(): string {
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
  return utf8ToBase64(JSON.stringify(data));
}

export function buildShareUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}?import=${encodeURIComponent(code)}`;
}

export function generateQRCode(): void {
  let encoded: string;
  try {
    encoded = buildShareCode();
  } catch (e) {
    console.error('Share encode failed:', e);
    showToast('Impossible de générer le code de partage', { variant: 'error' });
    return;
  }

  const shareUrl = buildShareUrl(encoded);

  const codeEl = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (codeEl) codeEl.value = encoded;

  const shareNativeBtn = document.getElementById('shareNativeBtn');
  if (shareNativeBtn) shareNativeBtn.hidden = typeof navigator.share !== 'function';

  openModal('shareModal');

  const qrEl = document.getElementById('qrcode');
  if (qrEl) {
    const qrMessage = (text: string): void => {
      qrEl.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem;">${text}</p>`;
    };
    qrEl.innerHTML = '';
    loadQrLibrary()
      .then(() => {
        if (!window.QRCode || qrEl.childElementCount > 0) return;
        try {
          new window.QRCode(qrEl, {
            text: shareUrl,
            width: 220,
            height: 220,
            // Niveau L : capacité maximale (~2,9 Ko) pour les longues listes
            correctLevel: window.QRCode.CorrectLevel?.L,
          });
        } catch (e) {
          // Payload au-delà de la capacité d'un QR code
          console.error('QR generation failed:', e);
          qrMessage('Liste trop longue pour un QR code — utilisez le bouton « Copier le lien ».');
        }
      })
      .catch(() => {
        qrMessage('QR code indisponible hors ligne — utilisez le lien ou le code ci-dessous.');
      });
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    helper.remove();
    return ok;
  }
}

export function copyShareCode(): void {
  const code = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (!code || !code.value) return;
  void copyToClipboard(code.value).then((ok) =>
    ok
      ? showToast('Code copié !', { variant: 'success', duration: 2000 })
      : showToast('Erreur lors de la copie', { variant: 'error' }),
  );
}

export function copyShareLink(): void {
  const code = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (!code || !code.value) return;
  void copyToClipboard(buildShareUrl(code.value)).then((ok) =>
    ok
      ? showToast('Lien copié !', { variant: 'success', duration: 2000 })
      : showToast('Erreur lors de la copie', { variant: 'error' }),
  );
}

export function shareNative(): void {
  const code = document.getElementById('shareCode') as HTMLTextAreaElement | null;
  if (!code || !code.value || typeof navigator.share !== 'function') return;
  const list = getCurrentList();
  navigator
    .share({
      title: `Liste de courses : ${list.name}`,
      text: `Ouvre ce lien pour importer ma liste « ${list.name} »`,
      url: buildShareUrl(code.value),
    })
    .catch(() => {
      /* partage annulé par l'utilisateur */
    });
}

function decodeAndValidate(code: string): ImportPayload {
  const decoded = JSON.parse(decodeShareCode(code));
  return ImportPayloadSchema.parse(decoded);
}

function extractCode(input: string): string {
  const trimmed = input.trim();
  // Accepte aussi un lien de partage complet collé tel quel
  const urlMatch = trimmed.match(/[?&]import=([^&\s]+)/);
  if (urlMatch) return decodeURIComponent(urlMatch[1]);
  return trimmed;
}

function showImportDialog(payload: ImportPayload): void {
  state.importData = payload;
  const nameEl = document.getElementById('importListName');
  const countEl = document.getElementById('importItemCount');
  if (nameEl) nameEl.textContent = payload.name;
  if (countEl) countEl.textContent = String(payload.items.length);
  openModal('importModal');
}

export function processImportCode(): void {
  const codeEl = document.getElementById('importCode') as HTMLTextAreaElement | null;
  if (!codeEl) return;
  const code = extractCode(codeEl.value);
  if (!code) {
    showToast('Veuillez coller un code valide', { variant: 'error' });
    return;
  }
  try {
    const payload = decodeAndValidate(code);
    closeModal('importManualModal');
    showImportDialog(payload);
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
    showImportDialog(payload);
  } catch (e) {
    showToast('Lien d’import invalide', { variant: 'error' });
    console.error('Erreur import:', e);
  } finally {
    window.history.replaceState({}, '', window.location.pathname);
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

  const toItem = (raw: (typeof normalized)[number]): Item => ({
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
  renderSuggestions();
  closeModal('importModal');
  showToast('Liste importée', { variant: 'success', duration: 2500 });
}
