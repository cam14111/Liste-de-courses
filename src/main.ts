import './styles.css';

import { state, loadFromLocalStorage } from './state';
import {
  addItem,
  deleteItem,
  toggleItem,
  toggleFavorite,
  clearCheckedItems,
  editItem,
} from './items';
import {
  createList,
  renameList,
  duplicateListWithName,
  confirmDeleteList,
  handleListContextMenu,
  currentActionListId,
} from './lists';
import { renderListTabs } from './render/tabs';
import {
  renderItems,
  handleCategoryHeaderClick,
  toggleCategory,
} from './render/items';
import { renderSuggestions, addItemFromSuggestion } from './render/suggestions';
import {
  renderFavorites,
  addItemFromFavorite,
  toggleFavoriteCategory,
} from './render/favorites';
import {
  renderCategoriesList,
  renderIconGrid,
  selectIcon,
  openAddCategoryModal,
  editCategory,
  deleteCategory,
  saveCategory,
} from './render/categories';
import {
  openModal,
  closeModal,
  openEditModal,
  currentEditingId,
} from './modals';
import {
  generateQRCode,
  copyShareCode,
  processImportCode,
  checkImportUrl,
  handleImport,
} from './share';
import { toggleTheme, toggleHideChecked, adjustFontSize, resetApp } from './settings';

declare global {
  interface Window {
    addItemFromSuggestion: typeof addItemFromSuggestion;
    addItemFromFavorite: typeof addItemFromFavorite;
    toggleFavoriteCategory: typeof toggleFavoriteCategory;
    toggleFavorite: typeof toggleFavorite;
    deleteItem: typeof deleteItem;
    handleCategoryHeaderClick: typeof handleCategoryHeaderClick;
    toggleCategory: typeof toggleCategory;
    handleListContextMenu: typeof handleListContextMenu;
    selectIcon: typeof selectIcon;
    editCategory: typeof editCategory;
    deleteCategory: typeof deleteCategory;
    openAddCategoryModal: typeof openAddCategoryModal;
    copyShareCode: typeof copyShareCode;
    processImportCode: typeof processImportCode;
    resetApp: typeof resetApp;
  }
}

window.addItemFromSuggestion = addItemFromSuggestion;
window.addItemFromFavorite = addItemFromFavorite;
window.toggleFavoriteCategory = toggleFavoriteCategory;
window.toggleFavorite = toggleFavorite;
window.deleteItem = deleteItem;
window.handleCategoryHeaderClick = handleCategoryHeaderClick;
window.toggleCategory = toggleCategory;
window.handleListContextMenu = handleListContextMenu;
window.selectIcon = selectIcon;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.openAddCategoryModal = openAddCategoryModal;
window.copyShareCode = copyShareCode;
window.processImportCode = processImportCode;
window.resetApp = resetApp;

function wireUp(): void {
  const $ = (id: string) => document.getElementById(id);

  $('addItemForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('itemInput') as HTMLInputElement | null;
    const value = input?.value.trim() || '';
    if (value && input) {
      addItem(value);
      input.value = '';
    }
  });

  $('searchInput')?.addEventListener('input', renderItems);
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
    if (name && currentEditingId) {
      editItem(currentEditingId, name, quantity, category);
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
  $('processImportBtn')?.addEventListener('click', processImportCode);
  $('resetAppBtn')?.addEventListener('click', resetApp);

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

  // Référence l'icône non utilisée (toggleItem, renderIconGrid) pour éviter le warning d'import
  void toggleItem;
  void renderIconGrid;
}

function init(): void {
  loadFromLocalStorage();
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  if (state.settings.theme === 'dark') {
    document.getElementById('themeToggle')?.classList.add('active');
  }
  if (state.settings.hideChecked) {
    document.getElementById('hideCheckedToggle')?.classList.add('active');
  }
  document.documentElement.style.setProperty(
    '--font-size-base',
    `${state.settings.fontSize}%`,
  );
  document.documentElement.style.fontSize = `${state.settings.fontSize}%`;
  const fontLabel = document.getElementById('fontSizeLabel');
  if (fontLabel) fontLabel.textContent = `${state.settings.fontSize}%`;

  wireUp();

  renderListTabs();
  renderItems();
  renderSuggestions();
  checkImportUrl();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exporte openEditModal pour les tests + symétrie (non utilisé dans main, déjà câblé via interactions.ts)
export { openEditModal };
