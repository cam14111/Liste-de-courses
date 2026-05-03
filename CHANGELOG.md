# Changelog

## [Unreleased] — Phase B (UX & feedback)

### Added
- **`src/toast.ts`** — système de toasts (variants `success` / `error` / `info`), action optionnelle (ex. "Annuler"), auto-dismiss, conteneur `aria-live="polite"`.
- **`src/confirm.ts`** — `confirmDialog()` et `alertDialog()` remplacent les `confirm()` et `alert()` natifs : modal accessible (`role="dialog"`, `aria-modal`), focus trap, restauration du focus, `Esc` annule, fermeture par clic sur l'overlay.
- **`src/shortcuts.ts`** — raccourcis clavier globaux :
  - `Ctrl+K` / `Cmd+K` → focus sur la recherche
  - `/` → focus sur l'ajout d'article (hors champ texte)
  - `Esc` → ferme la modale en cours, ou vide la recherche
  - `?` → ouvre / ferme l'aide raccourcis (hors champ texte)
- **`src/utils/escape.ts`** — `escapeHtml`, `escapeAttr`, `highlight` (avec escape de l'input pour les regex). Tous les rendus utilisent maintenant l'échappement, ce qui ferme un trou XSS latent du code original (les noms d'items, de listes et de catégories étaient injectés bruts dans `innerHTML`).
- **Highlight visuel** des matches de recherche dans les noms et quantités d'articles (`<mark>`).
- **Bouton clear `×`** dans le champ de recherche, visible uniquement quand un terme est saisi.
- **Bouton menu `⋮`** visible sur chaque onglet de liste (remplace le long-press caché ; le long-press tactile reste actif en complément).
- **Undo sur suppression** :
  - Suppression d'un article : toast 5s "X supprimé — Annuler" qui restaure l'item à sa position d'origine.
  - Suppression batch d'articles cochés : toast 5s avec restauration intégrale.
- **A11y de surface** : `aria-label` FR ajoutés sur tous les boutons icône d'item (favori, suppr, drag, replier), checkbox `role="checkbox"` + `aria-checked`.

### Changed
- `deleteItem()` ne demande plus confirmation : suppression immédiate + toast undo (UX standard ≈ Gmail).
- `clearCheckedItems()` utilise un `confirmDialog` custom au lieu du `confirm()` natif.
- `deleteList`, `confirmDeleteList`, `deleteCategory`, `saveCategory`, `resetApp`, `processImportCode`, `copyShareCode` utilisent désormais les modales/toasts custom.
- Tous les listeners onclick sur les favoris et icônes de catégorie sont maintenant attachés via `addEventListener` (au lieu d'`onclick=""` inline avec interpolation fragile).

### Fixed
- **XSS latent** : le code original interpolait `item.name`, `list.name`, etc. directement dans `innerHTML`. Désormais tout passe par `escapeHtml` avant insertion DOM.

## [Released] — Phase 1 complète

### Added (commit initial)
- **Vite + TypeScript strict** : `package.json`, `tsconfig.json`, `vite.config.ts` avec `vite-plugin-singlefile`.
- **CI GitHub Actions** : lint + typecheck + test + build.
- **Tests Vitest** : 21 tests sur `categorize.ts`.

### Added (refactor complet)
- **Extraction complète** de `index.html` (2907 lignes) en 17 modules TypeScript :
  - `src/types.ts`, `src/constants.ts` (DEFAULT_CATEGORIES, AVAILABLE_ICONS).
  - `src/categorize.ts` — pur, testé.
  - `src/state.ts` — store + load/save + migration unifiée (`migrateState`).
  - `src/items.ts`, `src/lists.ts` — CRUD typés.
  - `src/modals.ts`, `src/settings.ts`, `src/share.ts`.
  - `src/render/items.ts`, `src/render/tabs.ts`, `src/render/suggestions.ts`, `src/render/favorites.ts`, `src/render/categories.ts`.
  - `src/dragdrop.ts`, `src/interactions.ts`.
  - `src/main.ts` — init + wire-up complet du DOM.
  - `src/styles.css` — tout le CSS extrait.
- **`index.html` réduit de 2907 lignes à 270 lignes** (squelette HTML pur + `<script type="module" src="/src/main.ts">`).
- **Migration localStorage unifiée** dans `migrateState()` (au lieu d'être éparpillée 3× dans le code).
- **Service Worker bumpé v2 → v3** pour invalider l'ancien cache au déploiement.
- **Bundle de production** : `dist/index.html` self-contained (Vite + `vite-plugin-singlefile`), 65 KB (vs 124 KB avant), gzip 18.75 KB.

### Changed
- Suppression des handlers `onclick="resetApp()"` / `onclick="copyShareCode()"` / `onclick="processImportCode()"` / `onclick="openAddCategoryModal()"` inline (remplacés par `id` + `addEventListener` dans `main.ts`).
- Les `onclick` restants (générés dynamiquement par les renders) appellent désormais `window.X()` (fonctions exposées explicitement dans `main.ts`).

### Backwards compatibility
- Le localStorage existant (`shoppingListApp`) est lu et migré silencieusement : items avec ancien format catégorie (nom au lieu d'ID), favoris extraits depuis les items, ordre de catégories complété avec les nouvelles défauts.
- Catégorisation v2.2 préservée à l'identique (21 tests le verrouillent).

### À venir
- Phase 2 (a11y) : retrait du `maximum-scale=1.0`, ARIA labels, focus trap, skip-link.
- Phase 3 (UX) : toast system, custom confirm, undo suppression, raccourcis clavier.
- Phase 4 (perf) : debounce localStorage, rendu incrémental, SW stale-while-revalidate, validation Zod.
- Phase 5 (features) : prix/budget, voix, mode supermarché, templates, import recettes.
