import { state, saveToLocalStorage } from './state';

export function setupCategoryDragDrop(): void {
  const categories = document.querySelectorAll<HTMLElement>('.category-section');
  let draggedElement: HTMLElement | null = null;
  let draggedCategory: string | null = null;

  let touchStartY = 0;
  let touchCurrentY = 0;
  let isTouchDragging = false;
  let touchStartTimer: ReturnType<typeof setTimeout> | null = null;
  let touchStartX = 0;
  let isPendingDrag = false;
  const DRAG_DELAY = 500;
  const MOVEMENT_THRESHOLD = 10;

  categories.forEach((category) => {
    category.addEventListener('dragstart', (e) => {
      draggedElement = category;
      draggedCategory = category.dataset.category || null;
      category.classList.add('dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });

    category.addEventListener('dragend', () => {
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement.draggable = false;
        draggedElement = null;
        draggedCategory = null;
      }
    });

    category.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedElement || draggedElement === category) return;
      const rect = category.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (e.clientY < midpoint) {
        category.parentNode?.insertBefore(draggedElement, category);
      } else {
        category.parentNode?.insertBefore(draggedElement, category.nextSibling);
      }
    });

    category.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedCategory) return;
      const newOrder = Array.from(document.querySelectorAll<HTMLElement>('.category-section'))
        .map((el) => el.dataset.category || '')
        .filter(Boolean);
      state.categoryOrder = newOrder;
      saveToLocalStorage();
    });

    const header = category.querySelector<HTMLElement>('.category-header');
    header?.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      const onHandle =
        target.classList.contains('category-drag-handle') ||
        !!target.closest('.category-drag-handle');
      category.draggable = onHandle;
    });

    const handle = category.querySelector<HTMLElement>('.category-drag-handle');
    handle?.addEventListener(
      'touchstart',
      (e) => {
        e.stopPropagation();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isPendingDrag = true;

        touchStartTimer = setTimeout(() => {
          if (isPendingDrag) {
            isTouchDragging = true;
            draggedElement = category;
            draggedCategory = category.dataset.category || null;
            if (navigator.vibrate) navigator.vibrate(50);
            category.classList.add('dragging');
          }
        }, DRAG_DELAY);
      },
      { passive: true },
    );
  });

  document.addEventListener(
    'touchmove',
    (e) => {
      if (isPendingDrag && !isTouchDragging) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > MOVEMENT_THRESHOLD || dy > MOVEMENT_THRESHOLD) {
          if (touchStartTimer) clearTimeout(touchStartTimer);
          isPendingDrag = false;
        }
        return;
      }
      if (!isTouchDragging || !draggedElement) return;
      e.preventDefault();
      touchCurrentY = e.touches[0].clientY;
      const elementBelow = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY,
      );
      const categoryBelow = elementBelow?.closest<HTMLElement>('.category-section');
      if (!categoryBelow || categoryBelow === draggedElement) return;
      const rect = categoryBelow.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (touchCurrentY < midpoint) {
        categoryBelow.parentNode?.insertBefore(draggedElement, categoryBelow);
      } else {
        categoryBelow.parentNode?.insertBefore(draggedElement, categoryBelow.nextSibling);
      }
    },
    { passive: false },
  );

  document.addEventListener(
    'touchend',
    () => {
      if (isPendingDrag && !isTouchDragging) {
        if (touchStartTimer) clearTimeout(touchStartTimer);
        isPendingDrag = false;
        return;
      }
      if (!isTouchDragging) return;
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        const newOrder = Array.from(document.querySelectorAll<HTMLElement>('.category-section'))
          .map((el) => el.dataset.category || '')
          .filter(Boolean);
        state.categoryOrder = newOrder;
        saveToLocalStorage();
        draggedElement = null;
        draggedCategory = null;
      }
      isTouchDragging = false;
      isPendingDrag = false;
      touchStartY = 0;
      touchCurrentY = 0;
      touchStartX = 0;
    },
    { passive: true },
  );
}
