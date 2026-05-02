import { state, getCurrentList } from '../state';
import { addItem } from '../items';

export function renderSuggestions(): void {
  const container = document.getElementById('suggestions');
  if (!container) return;

  const suggestions = Object.entries(state.history)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  const list = getCurrentList();
  const existing = list.items.map((i) => i.name.toLowerCase());
  const filtered = suggestions.filter((s) => !existing.includes(s));

  container.innerHTML = filtered
    .slice(0, 5)
    .map((name) => `<button class="suggestion-chip" onclick="window.addItemFromSuggestion('${name.replace(/'/g, "\\'")}')">${name}</button>`)
    .join('');
}

export function addItemFromSuggestion(name: string): void {
  addItem(name);
  const input = document.getElementById('itemInput') as HTMLInputElement | null;
  if (input) input.value = '';
}
