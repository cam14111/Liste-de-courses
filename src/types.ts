export interface Item {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  favorite: boolean;
  addedAt: number;
  price?: number;
}

export interface ShoppingList {
  name: string;
  items: Item[];
}

export interface Category {
  id: string;
  icon: string;
  color: string;
  priority: number;
  keywords: string[];
}

export interface Favorite {
  name: string;
  category: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  hideChecked: boolean;
}

export interface AppState {
  schemaVersion?: number;
  lists: Record<string, ShoppingList>;
  currentList: string;
  settings: AppSettings;
  collapsedCategories: Record<string, boolean>;
  collapsedFavoriteCategories: Record<string, boolean>;
  categories: Record<string, Category>;
  categoryOrder: string[];
  history: Record<string, number>;
  importData: unknown;
  favorites: Favorite[];
  /** Clés des catégories par défaut supprimées/renommées, à ne pas restaurer. */
  removedDefaultCategories: string[];
}

export interface CategoryMatch {
  category: string;
  id: string;
  priority: number;
  keyword: string;
}
