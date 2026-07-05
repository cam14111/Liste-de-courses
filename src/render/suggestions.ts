import { state, getCurrentList } from '../state';
import { addItem } from '../items';
import { normalizeText } from '../categorize';
import { escapeHtml } from '../utils/escape';

const MAX_CHIPS = 6;

/** Noms candidats : historique (trié par fréquence) puis favoris. */
function candidateNames(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (name: string): void => {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  };
  Object.entries(state.history)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name]) => push(name));
  state.favorites.forEach((fav) => push(fav.name));
  return out;
}

/**
 * Affiche les chips de suggestions. Sans saisie : les articles les plus
 * fréquents. Avec saisie : autocomplétion (insensible aux accents/casse).
 */
export function renderSuggestions(): void {
  const container = document.getElementById('suggestions');
  if (!container) return;

  const input = document.getElementById('itemInput') as HTMLInputElement | null;
  const query = normalizeText(input?.value.trim() ?? '');

  const list = getCurrentList();
  const existing = new Set(list.items.map((i) => i.name.toLowerCase()));

  let names = candidateNames().filter((name) => !existing.has(name.toLowerCase()));
  if (query) {
    const starts: string[] = [];
    const contains: string[] = [];
    for (const name of names) {
      const norm = normalizeText(name);
      if (norm === query) continue;
      if (norm.startsWith(query)) starts.push(name);
      else if (norm.includes(query)) contains.push(name);
    }
    names = [...starts, ...contains];
  }

  container.innerHTML = names
    .slice(0, MAX_CHIPS)
    .map(
      (name) =>
        `<button type="button" class="suggestion-chip" data-name="${escapeHtml(name)}">+ ${escapeHtml(name)}</button>`,
    )
    .join('');

  container.querySelectorAll<HTMLButtonElement>('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.name;
      if (name) addItemFromSuggestion(name);
    });
  });
}

export function addItemFromSuggestion(name: string): void {
  addItem(name);
  const input = document.getElementById('itemInput') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    renderSuggestions();
  }
}
