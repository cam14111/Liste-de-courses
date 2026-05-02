import { state } from '../state';
import { renderItems } from './items';
import { renderSuggestions } from './suggestions';
import { handleListContextMenu } from '../lists';

export function renderListTabs(): void {
  const container = document.getElementById('listSelector');
  if (!container) return;

  container.innerHTML = Object.entries(state.lists)
    .map(([id, list]) => {
      const itemCount = list.items.length;
      const checkedCount = list.items.filter((i) => i.checked).length;
      return `<button class="list-tab ${id === state.currentList ? 'active' : ''}" data-list="${id}" oncontextmenu="window.handleListContextMenu(event, '${id}')">${list.name} ${itemCount > 0 ? `(${checkedCount}/${itemCount})` : ''}</button>`;
    })
    .join('');

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
