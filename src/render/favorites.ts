import { state, saveToLocalStorage } from '../state';
import { getCategoryKeyById } from '../categorize';
import { addItem } from '../items';
import { escapeHtml, escapeAttr } from '../utils/escape';

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
      const catLabel = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));
      return `<div class="favorite-category ${isCollapsed ? 'collapsed' : ''}">
          <div class="favorite-category-title" onclick="window.toggleFavoriteCategory('${escapeAttr(category)}')">
            <span>${data.icon} ${catLabel} (${items.length})</span>
            <button class="favorite-category-toggle" aria-label="Replier la catégorie">▼</button>
          </div>
          <div class="favorite-items-grid">
            ${items
              .map(
                (item, idx) =>
                  `<div class="favorite-item" id="fav-${escapeAttr(category)}-${idx}" data-fav-name="${escapeAttr(item.name)}" data-fav-category="${escapeAttr(item.category)}" data-fav-element-id="fav-${escapeAttr(category)}-${idx}" role="button" tabindex="0">
                    <div class="favorite-icon">${data.icon}</div>
                    <div class="favorite-name">${escapeHtml(item.name)}</div>
                  </div>`,
              )
              .join('')}
          </div>
        </div>`;
    })
    .join('');

  grid.querySelectorAll<HTMLElement>('.favorite-item').forEach((el) => {
    el.addEventListener('click', () => {
      const name = el.dataset.favName || '';
      const category = el.dataset.favCategory || '';
      const elementId = el.dataset.favElementId || '';
      addItemFromFavorite(name, category, elementId);
    });
  });
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
