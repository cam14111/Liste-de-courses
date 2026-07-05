import { state, saveToLocalStorage, getCurrentList } from '../state';
import { getCategoryKeyById } from '../categorize';
import { getCategoryLabel } from '../constants';
import { setupCategoryDragDrop } from '../dragdrop';
import { setupItemInteractions } from '../interactions';
import { toggleFavorite, deleteItem } from '../items';
import { escapeHtml, escapeAttr, highlight } from '../utils/escape';
import { computeTotals, formatPrice } from '../utils/price';

export function renderItems(): void {
  const list = getCurrentList();
  const container = document.getElementById('container');
  const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
  const searchTerm = searchInput?.value.toLowerCase() ?? '';
  if (!container) return;

  let items = list.items;

  if (searchTerm) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.quantity.toLowerCase().includes(searchTerm),
    );
  }

  if (state.settings.hideChecked) {
    items = items.filter((item) => !item.checked);
  }

  renderSupermarketProgress();

  const grouped: Record<string, typeof items> = {};
  items.forEach((item) => {
    const key = getCategoryKeyById(item.category, state.categories);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  Object.keys(grouped).forEach((cat) => {
    grouped[cat].sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1));
  });

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-text">${searchTerm ? 'Aucun résultat' : 'Votre liste est vide'}</div>
        ${searchTerm ? '' : '<div class="empty-hint">Ajoutez un article ci-dessus, ou piochez dans vos favoris ⭐</div>'}
      </div>`;
    renderTotalsBar();
    return;
  }

  const ordered = state.categoryOrder
    .filter((cat) => grouped[cat])
    .map((cat) => [cat, grouped[cat]] as const);

  container.innerHTML = ordered
    .map(([category, catItems]) => {
      const data = state.categories[category];
      const isCollapsed = state.collapsedCategories[category];
      const checkedCount = catItems.filter((i) => i.checked).length;
      const catLabel = escapeHtml(getCategoryLabel(category));
      return `<div class="category-section ${isCollapsed ? 'collapsed' : ''}" data-category="${escapeAttr(category)}" draggable="false">
          <div class="category-header" style="border-color: ${data.color};" data-category-header="${escapeAttr(category)}">
            <span class="category-drag-handle" title="Réorganiser">☰</span>
            <span class="category-icon">${data.icon}</span>
            <span>${catLabel}</span>
            <span class="category-count">${checkedCount}/${catItems.length}</span>
            <button class="category-toggle" aria-label="Replier la catégorie ${catLabel}" aria-expanded="${!isCollapsed}">▼</button>
          </div>
          <ul class="items-list">
            ${catItems
              .map(
                (item) => `<li class="item ${item.checked ? 'checked' : ''}" data-id="${escapeAttr(item.id)}">
                <div class="item-checkbox" role="checkbox" aria-checked="${item.checked}" aria-label="${escapeAttr(item.name)}" tabindex="0"></div>
                <div class="item-content">
                  <div class="item-text">${highlight(item.name, searchTerm)}</div>
                  ${
                    item.quantity || typeof item.price === 'number'
                      ? `<div class="item-meta">${item.quantity ? `<span class="item-quantity">${highlight(item.quantity, searchTerm)}</span>` : ''}${typeof item.price === 'number' ? `<span class="item-price">${escapeHtml(formatPrice(item.price))}</span>` : ''}</div>`
                      : ''
                  }
                </div>
                <div class="item-actions">
                  <button class="item-btn favorite-btn ${item.favorite ? 'active' : ''}" data-action="favorite" aria-label="${item.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">★</button>
                  <button class="item-btn delete-btn" data-action="delete" aria-label="Supprimer l'article">🗑️</button>
                </div>
              </li>`,
              )
              .join('')}
          </ul>
        </div>`;
    })
    .join('');

  container.querySelectorAll<HTMLElement>('[data-category-header]').forEach((header) => {
    header.addEventListener('click', (e) => {
      handleCategoryHeaderClick(e, header.dataset.categoryHeader || '');
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.closest<HTMLElement>('.item')?.dataset.id;
      if (!itemId) return;
      if (btn.dataset.action === 'favorite') toggleFavorite(itemId);
      else if (btn.dataset.action === 'delete') deleteItem(itemId);
    });
  });

  setupCategoryDragDrop();
  setupItemInteractions();
  renderTotalsBar();
}

function renderTotalsBar(): void {
  const list = getCurrentList();
  const totals = computeTotals(list.items);
  let bar = document.getElementById('totalsBar');

  if (totals.itemsWithPrice === 0) {
    bar?.remove();
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'totalsBar';
    bar.className = 'totals-bar';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    document.body.appendChild(bar);
  }

  const note =
    totals.itemsWithoutPrice > 0
      ? ` <span class="totals-note">(${totals.itemsWithoutPrice} sans prix)</span>`
      : '';

  bar.innerHTML = `<span class="totals-remaining">Reste à payer : <strong>${formatPrice(totals.remaining)}</strong></span><span class="totals-total">Total : ${formatPrice(totals.total)}${note}</span>`;
}

/** Barre de progression affichée uniquement en mode supermarché. */
function renderSupermarketProgress(): void {
  const list = getCurrentList();
  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;
  let bar = document.getElementById('supermarketProgress');

  if (total === 0) {
    bar?.remove();
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'supermarketProgress';
    bar.className = 'supermarket-progress';
    document.body.appendChild(bar);
  }

  const pct = Math.round((checked / total) * 100);
  bar.innerHTML = `<div class="supermarket-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${checked}" aria-label="Articles pris"><div class="supermarket-progress-fill" style="width: ${pct}%"></div></div><span class="supermarket-progress-label">${checked}/${total}</span>`;
}

export function handleCategoryHeaderClick(event: Event, category: string): void {
  const target = event.target as HTMLElement;
  if (
    target.classList.contains('category-drag-handle') ||
    target.closest('.category-drag-handle')
  ) {
    return;
  }
  toggleCategory(category);
}

export function toggleCategory(category: string): void {
  state.collapsedCategories[category] = !state.collapsedCategories[category];
  saveToLocalStorage();
  renderItems();
}
