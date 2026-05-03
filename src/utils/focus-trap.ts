const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
  );
}

export interface FocusTrap {
  release(): void;
}

export function createFocusTrap(root: HTMLElement, onEscape?: () => void): FocusTrap {
  const handler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = getFocusables(root);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (active && !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', handler);
  return {
    release: () => document.removeEventListener('keydown', handler),
  };
}
