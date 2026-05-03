import { toggleItem } from './items';
import { openEditModal } from './modals';

export function setupItemInteractions(): void {
  const items = document.querySelectorAll<HTMLElement>('.item');

  items.forEach((item) => {
    const itemId = item.dataset.id || '';
    const checkbox = item.querySelector<HTMLElement>('.item-checkbox');
    const content = item.querySelector<HTMLElement>('.item-content');

    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let isLongPress = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let hasMoved = false;
    const MOVEMENT_THRESHOLD = 10;

    const startLongPress = (e: TouchEvent): void => {
      isLongPress = false;
      hasMoved = false;
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        if (navigator.vibrate) navigator.vibrate(50);
        openEditModal(itemId);
      }, 500);
    };

    const detectMovement = (e: TouchEvent): void => {
      if (e.touches.length > 0) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > MOVEMENT_THRESHOLD || dy > MOVEMENT_THRESHOLD) hasMoved = true;
      }
      if (hasMoved && longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const cancelLongPress = (): void => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const handleClick = (): void => {
      if (!isLongPress && !hasMoved) toggleItem(itemId);
      isLongPress = false;
      hasMoved = false;
    };

    if (checkbox) {
      checkbox.addEventListener('click', () => toggleItem(itemId));
      checkbox.addEventListener('touchstart', startLongPress, { passive: true });
      checkbox.addEventListener('touchend', (e) => {
        e.preventDefault();
        cancelLongPress();
        handleClick();
      });
      checkbox.addEventListener('touchmove', detectMovement, { passive: true });
    }

    if (content) {
      content.addEventListener('click', () => toggleItem(itemId));
      content.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openEditModal(itemId);
      });
      content.addEventListener('touchstart', startLongPress, { passive: true });
      content.addEventListener('touchend', (e) => {
        e.preventDefault();
        cancelLongPress();
        handleClick();
      });
      content.addEventListener('touchmove', detectMovement, { passive: true });
    }
  });
}
