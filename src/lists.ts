import { state, saveToLocalStorage, generateId } from './state';
import { renderItems } from './render/items';
import { renderListTabs } from './render/tabs';
import { renderSuggestions } from './render/suggestions';
import { openModal } from './modals';

export let currentActionListId: string | null = null;

export function setCurrentActionListId(id: string | null): void {
  currentActionListId = id;
}

export function createList(name: string): void {
  const id = generateId();
  state.lists[id] = { name, items: [] };
  state.currentList = id;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
  renderSuggestions();
}

export function deleteList(listId: string): void {
  if (Object.keys(state.lists).length === 1) {
    alert('Vous devez avoir au moins une liste');
    return;
  }
  if (confirm('Supprimer cette liste ?')) {
    delete state.lists[listId];
    state.currentList = Object.keys(state.lists)[0];
    saveToLocalStorage();
    renderListTabs();
    renderItems();
    renderSuggestions();
  }
}

export function duplicateList(listId: string): void {
  const list = state.lists[listId];
  const newId = generateId();
  state.lists[newId] = {
    name: list.name + ' (copie)',
    items: JSON.parse(JSON.stringify(list.items)),
  };
  state.currentList = newId;
  saveToLocalStorage();
  renderListTabs();
  renderItems();
}

export function renameList(listId: string, newName: string): void {
  if (!newName || !newName.trim()) {
    alert('Veuillez entrer un nom pour la liste');
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

export function confirmDeleteList(listId: string): void {
  if (Object.keys(state.lists).length === 1) {
    alert('Vous devez avoir au moins une liste');
    return;
  }
  if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
    deleteList(listId);
  }
}

export function handleListContextMenu(event: Event, listId: string): void {
  event.preventDefault();
  currentActionListId = listId;
  openModal('listActionsModal');
}
