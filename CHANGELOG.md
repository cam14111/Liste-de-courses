# Changelog

## [Unreleased] — Phase 1 complète

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
