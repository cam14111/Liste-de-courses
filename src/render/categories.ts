import { state, saveToLocalStorage } from '../state';
import { AVAILABLE_ICONS } from '../constants';
import { openModal, closeModal } from '../modals';
import { renderItems } from './items';

let currentEditingCategory: string | null = null;
let selectedIcon: string | null = null;

export function renderCategoriesList(): void {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  container.innerHTML = Object.entries(state.categories)
    .map(
      ([id, data]) => `<div class="category-item">
        <div class="category-item-info">
          <span class="category-item-icon">${data.icon}</span>
          <span class="category-item-name">${id.charAt(0).toUpperCase() + id.slice(1)}</span>
        </div>
        <div class="category-item-actions">
          <button class="item-btn" onclick="window.editCategory('${id}')" title="Modifier">✏️</button>
          <button class="item-btn" onclick="window.deleteCategory('${id}')" title="Supprimer">🗑️</button>
        </div>
      </div>`,
    )
    .join('');
}

export function renderIconGrid(): void {
  const grid = document.getElementById('iconGrid');
  if (!grid) return;
  grid.innerHTML = AVAILABLE_ICONS.map(
    (icon) =>
      `<div class="icon-option ${selectedIcon === icon ? 'selected' : ''}" onclick="window.selectIcon('${icon}')">${icon}</div>`,
  ).join('');
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

export function deleteCategory(categoryKey: string): void {
  if (
    !confirm(
      `Supprimer la catégorie "${categoryKey}" ?\n\nLes articles de cette catégorie seront déplacés dans "autre".`,
    )
  ) {
    return;
  }

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

  saveToLocalStorage();
  renderCategoriesList();
  renderItems();
}

export function saveCategory(): void {
  const input = document.getElementById('categoryName') as HTMLInputElement | null;
  const name = input?.value.trim().toLowerCase() || '';

  if (!name) {
    alert('Veuillez entrer un nom de catégorie');
    return;
  }
  if (!selectedIcon) {
    alert('Veuillez sélectionner une icône');
    return;
  }

  if (currentEditingCategory) {
    const oldId = currentEditingCategory;
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
    } else {
      state.categories[name].icon = selectedIcon;
    }
  } else {
    if (state.categories[name]) {
      alert('Cette catégorie existe déjà');
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
