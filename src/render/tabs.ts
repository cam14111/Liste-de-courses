import { state } from '../state';
import { renderItems } from './items';
import { renderSuggestions } from './suggestions';
import { handleListContextMenu } from '../lists';
import { escapeHtml, escapeAttr } from '../utils/escape';

export function renderListTabs(): void {
  const container = document.getElementById('listSelector');
  if (!container) return;

  container.innerHTML = Object.entries(state.lists)
    .map(([id, list]) => {
      const itemCount = list.items.length;
      const checkedCount = list.items.filter((i) => i.checked).length;
      const counter = itemCount > 0 ? `(${checkedCount}/${itemCount})` : '';
      const active = id === state.currentList;
      return `<button class="list-tab ${active ? 'active' : ''}" role="tab" aria-selected="${active}" tabindex="${active ? 0 : -1}" data-list="${escapeAttr(id)}" oncontextmenu="window.handleListContextMenu(event, '${escapeAttr(id)}')"><span class="list-tab-name">${escapeHtml(list.name)} ${counter}</span><span class="list-tab-menu" role="button" tabindex="0" aria-label="Actions sur la liste ${escapeAttr(list.name)}" data-list-menu="${escapeAttr(id)}">⋮</span></button>`;
    })
    .join('');

  container.querySelectorAll<HTMLElement>('.list-tab-menu').forEach((menu) => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      handleListContextMenu(e, menu.dataset.listMenu || '');
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.list-tab').forEach((tab) => {
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let longPressTriggered = false;

    tab.addEventListener('touchstart', (e) => {
      longPressTriggered = false;
      longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        if (navigator.vibrate) navigator.vibrate(50);
        handleListContextMenu(e, tab.dataset.list || '');
      }, 500);
    });

    tab.addEventListener('touchend', () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    });

    tab.addEventListener('touchmove', () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    });

    tab.addEventListener('click', (e) => {
      if (!e.defaultPrevented && !longPressTriggered) {
        state.currentList = tab.dataset.list || state.currentList;
        renderListTabs();
        renderItems();
        renderSuggestions();
      }
    });
  });
}
