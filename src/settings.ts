import { state, saveToLocalStorage } from './state';
import { renderItems } from './render/items';
import { STORAGE_KEY } from './constants';

export function toggleTheme(): void {
  state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  document.getElementById('themeToggle')?.classList.toggle('active');
  saveToLocalStorage();
}

export function toggleHideChecked(): void {
  state.settings.hideChecked = !state.settings.hideChecked;
  document.getElementById('hideCheckedToggle')?.classList.toggle('active');
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

export function resetApp(): void {
  const ok = confirm(
    "⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir réinitialiser l'application ?\n\nCette action supprimera TOUTES vos données :\n• Toutes vos listes de courses\n• Tous vos articles\n• Tous vos favoris\n• Toutes vos catégories personnalisées\n• Tous vos paramètres\n\nCette action est IRRÉVERSIBLE !",
  );
  if (!ok) return;

  const ok2 = confirm(
    'Dernière confirmation !\n\nTapez OK pour confirmer la suppression définitive de toutes vos données.',
  );
  if (!ok2) return;

  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
