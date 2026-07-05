import './styles.css';

import { state, loadFromLocalStorage, flushPendingSave } from './state';
import { addItemFromInput, uncheckAllItems, clearCheckedItems, editItem } from './items';
import {
  createList,
  renameList,
  duplicateListWithName,
  confirmDeleteList,
  currentActionListId,
} from './lists';
import { renderListTabs } from './render/tabs';
import { renderItems, renderSupermarketProgress } from './render/items';
import { renderSuggestions } from './render/suggestions';
import { renderFavorites } from './render/favorites';
import { renderCategoriesList, openAddCategoryModal, saveCategory } from './render/categories';
import { openModal, closeModal, currentEditingId } from './modals';
import {
  generateQRCode,
  copyShareCode,
  copyShareLink,
  shareNative,
  processImportCode,
  checkImportUrl,
  handleImport,
} from './share';
import { applyTheme, toggleTheme, toggleHideChecked, adjustFontSize, resetApp } from './settings';
import { setupKeyboardShortcuts } from './shortcuts';
import { parsePrice } from './utils/price';
import { createVoiceController, isVoiceInputSupported } from './voice';
import { showToast } from './toast';

function wireUp(): void {
  const $ = (id: string) => document.getElementById(id);

  $('addItemForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('itemInput') as HTMLInputElement | null;
    const value = input?.value.trim() || '';
    if (value && input) {
      input.value = '';
      addItemFromInput(value);
    }
  });

  setupVoiceInput();
  setupSupermarketMode();

  // Autocomplétion live dans les chips de suggestions
  const itemInput = $('itemInput') as HTMLInputElement | null;
  let suggestTimer: ReturnType<typeof setTimeout> | null = null;
  itemInput?.addEventListener('input', () => {
    if (suggestTimer) clearTimeout(suggestTimer);
    suggestTimer = setTimeout(renderSuggestions, 120);
  });

  const searchInput = $('searchInput') as HTMLInputElement | null;
  const searchContainer = $('searchContainer');
  const updateSearchClear = (): void => {
    if (!searchContainer || !searchInput) return;
    searchContainer.classList.toggle('has-value', !!searchInput.value);
  };
  searchInput?.addEventListener('input', () => {
    updateSearchClear();
    renderItems();
  });
  $('searchClearBtn')?.addEventListener('click', () => {
    if (!searchInput) return;
    searchInput.value = '';
    updateSearchClear();
    renderItems();
    searchInput.focus();
  });
  $('clearCheckedBtn')?.addEventListener('click', clearCheckedItems);

  $('settingsBtn')?.addEventListener('click', () => {
    renderCategoriesList();
    openModal('settingsModal');
  });
  $('favoritesBtn')?.addEventListener('click', () => {
    renderFavorites();
    openModal('favoritesModal');
  });
  $('newListBtn')?.addEventListener('click', () => openModal('newListModal'));

  const closers: Array<[string, string]> = [
    ['closeEditModal', 'editModal'],
    ['closeFavoritesModal', 'favoritesModal'],
    ['closeSettingsModal', 'settingsModal'],
    ['closeNewListModal', 'newListModal'],
    ['closeShareModal', 'shareModal'],
    ['closeImportModal', 'importModal'],
    ['closeImportManualModal', 'importManualModal'],
    ['closeCategoryModal', 'categoryModal'],
    ['closeListActionsModal', 'listActionsModal'],
    ['closeRenameListModal', 'renameListModal'],
    ['closeDuplicateListModal', 'duplicateListModal'],
  ];
  closers.forEach(([btnId, modalId]) =>
    $(btnId)?.addEventListener('click', () => closeModal(modalId)),
  );

  $('renameListOption')?.addEventListener('click', () => {
    closeModal('listActionsModal');
    if (!currentActionListId) return;
    const list = state.lists[currentActionListId];
    const input = $('renameListInput') as HTMLInputElement | null;
    if (!input) return;
    input.value = list.name;
    openModal('renameListModal');
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  });

  $('duplicateListOption')?.addEventListener('click', () => {
    closeModal('listActionsModal');
    if (!currentActionListId) return;
    const list = state.lists[currentActionListId];
    const input = $('duplicateListInput') as HTMLInputElement | null;
    if (!input) return;
    input.value = list.name + ' (copie)';
    openModal('duplicateListModal');
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  });

  $('deleteListOption')?.addEventListener('click', () => {
    closeModal('listActionsModal');
    if (currentActionListId) confirmDeleteList(currentActionListId);
  });

  $('uncheckAllOption')?.addEventListener('click', () => {
    closeModal('listActionsModal');
    uncheckAllItems();
  });

  $('confirmRenameBtn')?.addEventListener('click', () => {
    if (!currentActionListId) return;
    const newName = ($('renameListInput') as HTMLInputElement | null)?.value || '';
    renameList(currentActionListId, newName);
    closeModal('renameListModal');
  });

  $('confirmDuplicateBtn')?.addEventListener('click', () => {
    if (!currentActionListId) return;
    const newName = ($('duplicateListInput') as HTMLInputElement | null)?.value || '';
    duplicateListWithName(currentActionListId, newName);
    closeModal('duplicateListModal');
  });

  $('renameListInput')?.addEventListener('keypress', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      ($('confirmRenameBtn') as HTMLButtonElement | null)?.click();
    }
  });

  $('duplicateListInput')?.addEventListener('keypress', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      ($('confirmDuplicateBtn') as HTMLButtonElement | null)?.click();
    }
  });

  $('saveEditBtn')?.addEventListener('click', () => {
    const name = ($('editItemName') as HTMLInputElement | null)?.value.trim() || '';
    const quantity = ($('editItemQuantity') as HTMLInputElement | null)?.value.trim() || '';
    const category = ($('editItemCategory') as HTMLSelectElement | null)?.value || '';
    const priceRaw = ($('editItemPrice') as HTMLInputElement | null)?.value || '';
    const price = parsePrice(priceRaw);
    if (name && currentEditingId) {
      editItem(currentEditingId, name, quantity, category, price);
      closeModal('editModal');
    }
  });

  $('saveCategoryBtn')?.addEventListener('click', saveCategory);

  $('themeToggle')?.addEventListener('click', toggleTheme);
  $('hideCheckedToggle')?.addEventListener('click', toggleHideChecked);
  $('decreaseFontBtn')?.addEventListener('click', () => adjustFontSize(-10));
  $('increaseFontBtn')?.addEventListener('click', () => adjustFontSize(10));
  $('shareSettingsBtn')?.addEventListener('click', generateQRCode);
  $('importSettingsBtn')?.addEventListener('click', () => openModal('importManualModal'));
  $('addCategoryBtn')?.addEventListener('click', openAddCategoryModal);
  $('copyShareBtn')?.addEventListener('click', copyShareCode);
  $('copyShareLinkBtn')?.addEventListener('click', copyShareLink);
  $('shareNativeBtn')?.addEventListener('click', shareNative);
  $('processImportBtn')?.addEventListener('click', processImportCode);
  $('resetAppBtn')?.addEventListener('click', () => void resetApp());

  $('createListBtn')?.addEventListener('click', () => {
    const input = $('newListName') as HTMLInputElement | null;
    const name = input?.value.trim() || '';
    if (name && input) {
      createList(name);
      input.value = '';
      closeModal('newListModal');
    }
  });

  document.querySelectorAll<HTMLElement>('.merge-option').forEach((option) => {
    option.addEventListener('click', () => {
      const action = option.dataset.action as 'replace' | 'merge' | 'new' | undefined;
      if (action) handleImport(action);
    });
  });

  document.querySelectorAll<HTMLElement>('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });
}

function setupSupermarketMode(): void {
  const enterBtn = document.getElementById('supermarketBtn');
  const exitBtn = document.getElementById('supermarketExitBtn') as HTMLButtonElement | null;
  if (!enterBtn || !exitBtn) return;

  const setActive = (active: boolean): void => {
    document.body.classList.toggle('supermarket-mode', active);
    enterBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    exitBtn.hidden = !active;
    renderSupermarketProgress();
    if (active) exitBtn.focus();
    else enterBtn.focus();
  };

  enterBtn.addEventListener('click', () => setActive(true));
  exitBtn.addEventListener('click', () => setActive(false));
}

function setupVoiceInput(): void {
  const btn = document.getElementById('voiceBtn') as HTMLButtonElement | null;
  const input = document.getElementById('itemInput') as HTMLInputElement | null;
  if (!btn || !input) return;
  if (!isVoiceInputSupported()) {
    btn.remove();
    return;
  }
  btn.hidden = false;

  const controller = createVoiceController({
    onTranscript: (text) => {
      addItemFromInput(text);
      input.value = '';
      showToast(`"${text}" ajouté`, { variant: 'success', duration: 1800 });
    },
    onStart: () => btn.classList.add('recording'),
    onEnd: () => btn.classList.remove('recording'),
    onError: (msg) => {
      btn.classList.remove('recording');
      if (msg !== 'no-speech' && msg !== 'aborted') {
        showToast(`Reconnaissance vocale : ${msg}`, { variant: 'error', duration: 3000 });
      }
    },
  });
  if (!controller) {
    btn.remove();
    return;
  }

  btn.addEventListener('click', () => {
    if (btn.classList.contains('recording')) {
      controller.stop();
    } else {
      controller.start();
    }
  });
}

function init(): void {
  loadFromLocalStorage();
  applyTheme(state.settings.theme);
  const hideToggle = document.getElementById('hideCheckedToggle');
  if (state.settings.hideChecked) hideToggle?.classList.add('active');
  hideToggle?.setAttribute('aria-checked', state.settings.hideChecked ? 'true' : 'false');
  document.documentElement.style.setProperty(
    '--font-size-base',
    `${state.settings.fontSize}%`,
  );
  document.documentElement.style.fontSize = `${state.settings.fontSize}%`;
  const fontLabel = document.getElementById('fontSizeLabel');
  if (fontLabel) fontLabel.textContent = `${state.settings.fontSize}%`;

  wireUp();
  setupKeyboardShortcuts();

  renderListTabs();
  renderItems();
  renderSuggestions();
  checkImportUrl();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}

window.addEventListener('pagehide', flushPendingSave);
window.addEventListener('beforeunload', flushPendingSave);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPendingSave();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
