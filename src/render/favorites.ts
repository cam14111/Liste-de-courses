import { state, saveToLocalStorage } from '../state';
import { getCategoryKeyById } from '../categorize';
import { addItem } from '../items';

export function renderFavorites(): void {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;

  if (state.favorites.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucun favori pour le moment</p>';
    return;
  }

  const grouped: Record<string, typeof state.favorites> = {};
  state.favorites.forEach((item) => {
    const key = getCategoryKeyById(item.category, state.categories);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const ordered = state.categoryOrder
    .filter((c) => grouped[c])
    .map((c) => [c, grouped[c]] as const);

  ordered.forEach(([category]) => {
    if (state.collapsedFavoriteCategories[category] === undefined) {
      state.collapsedFavoriteCategories[category] = true;
    }
  });

  grid.innerHTML = ordered
    .map(([category, items]) => {
      const data = state.categories[category];
      const isCollapsed = state.collapsedFavoriteCategories[category];
      return `<div class="favorite-category ${isCollapsed ? 'collapsed' : ''}">
          <div class="favorite-category-title" onclick="window.toggleFavoriteCategory('${category}')">
            <span>${data.icon} ${category.charAt(0).toUpperCase() + category.slice(1)} (${items.length})</span>
            <button class="favorite-category-toggle">▼</button>
          </div>
          <div class="favorite-items-grid">
            ${items
              .map(
                (item, idx) =>
                  `<div class="favorite-item" id="fav-${category}-${idx}" onclick="window.addItemFromFavorite('${item.name.replace(/'/g, "\\'")}', '${item.category}', 'fav-${category}-${idx}')">
                    <div class="favorite-icon">${data.icon}</div>
                    <div class="favorite-name">${item.name}</div>
                  </div>`,
              )
              .join('')}
          </div>
        </div>`;
    })
    .join('');
}

export function addItemFromFavorite(name: string, category: string, elementId: string): void {
  addItem(name, '', category);
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('added');
    setTimeout(() => element.classList.remove('added'), 600);
  }
}

export function toggleFavoriteCategory(category: string): void {
  const wasCollapsed = state.collapsedFavoriteCategories[category];
  state.categoryOrder.forEach((cat) => {
    state.collapsedFavoriteCategories[cat] = true;
  });
  state.collapsedFavoriteCategories[category] = !wasCollapsed;
  saveToLocalStorage();
  renderFavorites();
}
