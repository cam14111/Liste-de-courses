export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.appendChild(container);
  return container;
}

export function showToast(message: string, options: ToastOptions = {}): () => void {
  const { variant = 'info', duration = 3000, action } = options;
  const root = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;

  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;
  toast.appendChild(text);

  let timer: ReturnType<typeof setTimeout> | null = null;

  const dismiss = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    toast.classList.add('toast-leaving');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  };

  if (action) {
    const btn = document.createElement('button');
    btn.className = 'toast-action';
    btn.type = 'button';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      action.onClick();
      dismiss();
    });
    toast.appendChild(btn);
  }

  const close = document.createElement('button');
  close.className = 'toast-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Fermer la notification');
  close.textContent = '×';
  close.addEventListener('click', dismiss);
  toast.appendChild(close);

  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-enter'));

  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return dismiss;
}
