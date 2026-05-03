import { closeModal } from './modals';

const MODAL_IDS = [
  'editModal',
  'favoritesModal',
  'settingsModal',
  'newListModal',
  'shareModal',
  'importModal',
  'importManualModal',
  'categoryModal',
  'listActionsModal',
  'renameListModal',
  'duplicateListModal',
];

function topmostOpenModal(): string | null {
  for (let i = MODAL_IDS.length - 1; i >= 0; i--) {
    const el = document.getElementById(MODAL_IDS[i]);
    if (el?.classList.contains('active')) return MODAL_IDS[i];
  }
  return null;
}

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function showHelp(): void {
  const existing = document.getElementById('shortcutsHelp');
  if (existing) {
    existing.remove();
    return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'shortcutsHelp';
  overlay.className = 'confirm-overlay confirm-enter';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Raccourcis clavier');
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <h2 class="confirm-title">Raccourcis clavier</h2>
      <ul class="shortcuts-list">
        <li><kbd>Ctrl</kbd>+<kbd>K</kbd> <span>Focus sur la recherche</span></li>
        <li><kbd>/</kbd> <span>Focus sur l'ajout d'article</span></li>
        <li><kbd>Esc</kbd> <span>Fermer la modale ou vider la recherche</span></li>
        <li><kbd>Enter</kbd> <span>Valider le champ courant</span></li>
        <li><kbd>?</kbd> <span>Afficher / masquer cette aide</span></li>
      </ul>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn confirm-btn-primary" id="closeShortcutsHelp">Fermer</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = (): void => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.getElementById('closeShortcutsHelp')?.addEventListener('click', close);
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') close();
    },
    { once: true },
  );
}

export function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const help = document.getElementById('shortcutsHelp');
      if (help) {
        help.remove();
        return;
      }
      const open = topmostOpenModal();
      if (open) {
        closeModal(open);
        return;
      }
      const search = document.getElementById('searchInput') as HTMLInputElement | null;
      if (search && search.value) {
        search.value = '';
        search.dispatchEvent(new Event('input'));
        return;
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      (document.getElementById('searchInput') as HTMLInputElement | null)?.focus();
      return;
    }

    if (!isTextField(e.target)) {
      if (e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('itemInput') as HTMLInputElement | null;
        input?.focus();
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        showHelp();
        return;
      }
    }
  });
}
