export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

let lastFocused: HTMLElement | null = null;

function buildOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  return overlay;
}

function trapFocus(container: HTMLElement, onEscape: () => void): () => void {
  const focusables = () =>
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

  const handler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(focusables());
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    lastFocused = document.activeElement as HTMLElement | null;
    const overlay = buildOverlay();

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    if (opts.title) {
      const title = document.createElement('h2');
      title.className = 'confirm-title';
      title.id = 'confirm-title';
      title.textContent = opts.title;
      overlay.setAttribute('aria-labelledby', title.id);
      dialog.appendChild(title);
    }

    const body = document.createElement('p');
    body.className = 'confirm-message';
    body.textContent = opts.message;
    dialog.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'confirm-actions';

    const showCancel = opts.cancelLabel !== '';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'confirm-btn confirm-btn-cancel';
    cancel.textContent = opts.cancelLabel || 'Annuler';

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = `confirm-btn ${opts.destructive ? 'confirm-btn-danger' : 'confirm-btn-primary'}`;
    confirm.textContent = opts.confirmLabel || 'Confirmer';

    if (showCancel) actions.appendChild(cancel);
    actions.appendChild(confirm);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const close = (result: boolean): void => {
      releaseFocus();
      overlay.classList.add('confirm-leaving');
      setTimeout(() => overlay.remove(), 200);
      lastFocused?.focus?.();
      resolve(result);
    };

    const releaseFocus = trapFocus(overlay, () => close(false));

    cancel.addEventListener('click', () => close(false));
    confirm.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });

    requestAnimationFrame(() => {
      overlay.classList.add('confirm-enter');
      confirm.focus();
    });
  });
}

export function alertDialog(message: string, title?: string): Promise<void> {
  return confirmDialog({
    title,
    message,
    confirmLabel: 'OK',
    cancelLabel: '',
  }).then(() => undefined);
}
