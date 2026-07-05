import { state, saveToLocalStorage } from './state';
import { renderItems } from './render/items';
import { STORAGE_KEY } from './constants';
import { confirmDialog } from './confirm';

/** Applique le thème au document, au toggle et à la barre système (theme-color). */
export function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('themeToggle');
  toggle?.classList.toggle('active', theme === 'dark');
  toggle?.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#1a1a1a' : '#4CAF50';
}

export function toggleTheme(): void {
  state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.settings.theme);
  saveToLocalStorage();
}

export function toggleHideChecked(): void {
  state.settings.hideChecked = !state.settings.hideChecked;
  const toggle = document.getElementById('hideCheckedToggle');
  toggle?.classList.toggle('active');
  toggle?.setAttribute('aria-checked', state.settings.hideChecked ? 'true' : 'false');
  saveToLocalStorage();
  renderItems();
}

export function adjustFontSize(delta: number): void {
  state.settings.fontSize = Math.max(80, Math.min(150, state.settings.fontSize + delta));
  document.documentElement.style.setProperty(
    '--font-size-base',
    `${state.settings.fontSize}%`,
  );
  document.documentElement.style.fontSize = `${state.settings.fontSize}%`;
  const label = document.getElementById('fontSizeLabel');
  if (label) label.textContent = `${state.settings.fontSize}%`;
  saveToLocalStorage();
}

export async function resetApp(): Promise<void> {
  const ok = await confirmDialog({
    title: '⚠️ Réinitialiser l\'application',
    message:
      "Cette action supprimera TOUTES vos données :\n• Toutes vos listes\n• Tous vos articles\n• Tous vos favoris\n• Toutes vos catégories personnalisées\n• Tous vos paramètres\n\nCette action est IRRÉVERSIBLE.",
    confirmLabel: 'Continuer',
    destructive: true,
  });
  if (!ok) return;

  const ok2 = await confirmDialog({
    title: 'Dernière confirmation',
    message: 'Confirmer la suppression définitive de toutes vos données ?',
    confirmLabel: 'Tout supprimer',
    destructive: true,
  });
  if (!ok2) return;

  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
