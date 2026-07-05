import { state, saveToLocalStorage, generateId } from './state';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { renderSuggestions } from './render/suggestions';
import { openModal } from './modals';
import { confirmDialog } from './confirm';
import { showToast } from './toast';

export let currentActionListId: string | null = null;

export function createList(name: string): void {
  const id = generateId();
  state.lists[id] = { name, items: [] };
  state.currentList = id;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
  renderSuggestions();
}

export function renameList(listId: string, newName: string): void {
  if (!newName || !newName.trim()) {
    showToast('Veuillez entrer un nom pour la liste', { variant: 'error' });
    return;
  }
  state.lists[listId].name = newName.trim();
  saveToLocalStorage();
  renderListTabs();
}

export function duplicateListWithName(listId: string, newName: string): void {
  const list = state.lists[listId];
  const newId = generateId();
  const name = newName && newName.trim() ? newName.trim() : list.name + ' (copie)';
  state.lists[newId] = {
    name,
    items: JSON.parse(JSON.stringify(list.items)),
  };
  state.currentList = newId;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
}

export async function confirmDeleteList(listId: string): Promise<void> {
  if (Object.keys(state.lists).length === 1) {
    showToast('Vous devez avoir au moins une liste', { variant: 'error' });
    return;
  }
  const ok = await confirmDialog({
    title: 'Supprimer la liste',
    message: 'Êtes-vous sûr de vouloir supprimer cette liste ?',
    confirmLabel: 'Supprimer',
    destructive: true,
  });
  if (!ok) return;
  delete state.lists[listId];
  state.currentList = Object.keys(state.lists)[0];
  saveToLocalStorage();
  renderListTabs();
  renderItems();
  renderSuggestions();
}

export function handleListContextMenu(event: Event, listId: string): void {
  event.preventDefault();
  currentActionListId = listId;
  openModal('listActionsModal');
}
