import { state, saveToLocalStorage } from '../state';
import { AVAILABLE_ICONS, DEFAULT_CATEGORIES, getCategoryLabel } from '../constants';
import { openModal, closeModal } from '../modals';
import { renderItems } from './items';
import { confirmDialog, alertDialog } from '../confirm';
import { showToast } from '../toast';
import { escapeHtml, escapeAttr } from '../utils/escape';

let currentEditingCategory: string | null = null;
let selectedIcon: string | null = null;

export function renderCategoriesList(): void {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  container.innerHTML = state.categoryOrder
    .filter((id) => state.categories[id])
    .map((id) => {
      const data = state.categories[id];
      const label = escapeHtml(getCategoryLabel(id));
      return `<div class="category-item">
        <div class="category-item-info">
          <span class="category-item-icon">${data.icon}</span>
          <span class="category-item-name">${label}</span>
        </div>
        <div class="category-item-actions">
          <button class="item-btn" data-cat-edit="${escapeAttr(id)}" title="Modifier" aria-label="Modifier la catégorie ${label}">✏️</button>
          <button class="item-btn" data-cat-delete="${escapeAttr(id)}" title="Supprimer" aria-label="Supprimer la catégorie ${label}">🗑️</button>
        </div>
      </div>`;
    })
    .join('');

  container.querySelectorAll<HTMLButtonElement>('[data-cat-edit]').forEach((btn) => {
    btn.addEventListener('click', () => editCategory(btn.dataset.catEdit || ''));
  });
  container.querySelectorAll<HTMLButtonElement>('[data-cat-delete]').forEach((btn) => {
    btn.addEventListener('click', () => void deleteCategory(btn.dataset.catDelete || ''));
  });
}

export function renderIconGrid(): void {
  const grid = document.getElementById('iconGrid');
  if (!grid) return;
  grid.innerHTML = AVAILABLE_ICONS.map(
    (icon) =>
      `<div class="icon-option ${selectedIcon === icon ? 'selected' : ''}" data-icon="${escapeAttr(icon)}" role="button" tabindex="0" aria-label="Choisir l'icône ${escapeAttr(icon)}">${icon}</div>`,
  ).join('');

  grid.querySelectorAll<HTMLElement>('.icon-option').forEach((el) => {
    el.addEventListener('click', () => {
      const ic = el.dataset.icon;
      if (ic) selectIcon(ic);
    });
  });
}

export function selectIcon(icon: string): void {
  selectedIcon = icon;
  renderIconGrid();
}

export function openAddCategoryModal(): void {
  currentEditingCategory = null;
  selectedIcon = null;
  const title = document.getElementById('categoryModalTitle');
  const input = document.getElementById('categoryName') as HTMLInputElement | null;
  if (title) title.textContent = 'Nouvelle catégorie';
  if (input) input.value = '';
  renderIconGrid();
  openModal('categoryModal');
}

export function editCategory(categoryId: string): void {
  currentEditingCategory = categoryId;
  const category = state.categories[categoryId];
  selectedIcon = category.icon;
  const title = document.getElementById('categoryModalTitle');
  const input = document.getElementById('categoryName') as HTMLInputElement | null;
  if (title) title.textContent = 'Modifier la catégorie';
  if (input) input.value = categoryId;
  renderIconGrid();
  openModal('categoryModal');
}

export async function deleteCategory(categoryKey: string): Promise<void> {
  if (categoryKey === 'autre') {
    await alertDialog('La catégorie "Autre" sert de repli et ne peut pas être supprimée.');
    return;
  }
  const ok = await confirmDialog({
    title: `Supprimer la catégorie "${getCategoryLabel(categoryKey)}"`,
    message: 'Les articles de cette catégorie seront déplacés dans "autre".',
    confirmLabel: 'Supprimer',
    destructive: true,
  });
  if (!ok) return;

  const idToDelete = state.categories[categoryKey]?.id;
  const autreId = state.categories['autre']?.id || 'default_autre';

  Object.values(state.lists).forEach((list) => {
    list.items?.forEach((item) => {
      if (item.category === idToDelete) item.category = autreId;
    });
  });

  state.favorites.forEach((fav) => {
    if (fav.category === idToDelete) fav.category = autreId;
  });

  delete state.categories[categoryKey];
  state.categoryOrder = state.categoryOrder.filter((cat) => cat !== categoryKey);
  // Empêche la migration de restaurer une catégorie par défaut supprimée.
  if (DEFAULT_CATEGORIES[categoryKey] && !state.removedDefaultCategories.includes(categoryKey)) {
    state.removedDefaultCategories.push(categoryKey);
  }

  saveToLocalStorage();
  renderCategoriesList();
  renderItems();
  showToast(`Catégorie "${getCategoryLabel(categoryKey)}" supprimée`, {
    variant: 'success',
    duration: 2500,
  });
}

export async function saveCategory(): Promise<void> {
  const input = document.getElementById('categoryName') as HTMLInputElement | null;
  const name = input?.value.trim().toLowerCase() || '';

  if (!name) {
    await alertDialog('Veuillez entrer un nom de catégorie');
    return;
  }
  if (!selectedIcon) {
    await alertDialog('Veuillez sélectionner une icône');
    return;
  }

  if (currentEditingCategory) {
    const oldId = currentEditingCategory;
    if (oldId === 'autre' && name !== oldId) {
      await alertDialog('La catégorie "Autre" sert de repli et ne peut pas être renommée.');
      return;
    }
    if (name !== oldId && state.categories[name]) {
      await alertDialog('Cette catégorie existe déjà');
      return;
    }
    if (name !== oldId) {
      const oldCat = state.categories[oldId];
      state.categories[name] = {
        id: oldCat.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        icon: selectedIcon,
        color: oldCat.color || 'var(--cat-autre)',
        keywords: oldCat.keywords || [],
        priority: oldCat.priority ?? 2,
      };
      delete state.categories[oldId];

      const categoryId = state.categories[name].id;
      Object.values(state.lists).forEach((list) => {
        list.items?.forEach((item) => {
          if (item.category === oldId) item.category = categoryId;
        });
      });
      state.favorites.forEach((fav) => {
        if (fav.category === oldId) fav.category = categoryId;
      });

      const idx = state.categoryOrder.indexOf(oldId);
      if (idx !== -1) state.categoryOrder[idx] = name;

      if (DEFAULT_CATEGORIES[oldId] && !state.removedDefaultCategories.includes(oldId)) {
        state.removedDefaultCategories.push(oldId);
      }
    } else {
      state.categories[name].icon = selectedIcon;
    }
  } else {
    if (state.categories[name]) {
      await alertDialog('Cette catégorie existe déjà');
      return;
    }
    state.categories[name] = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      icon: selectedIcon,
      color: 'var(--cat-autre)',
      keywords: [],
      priority: 2,
    };
    const autreIdx = state.categoryOrder.indexOf('autre');
    if (autreIdx !== -1) {
      state.categoryOrder.splice(autreIdx, 0, name);
    } else {
      state.categoryOrder.push(name);
    }
  }

  saveToLocalStorage();
  renderCategoriesList();
  renderItems();
  closeModal('categoryModal');
}
