# Changelog

## [Unreleased] — Phase E (perf & robustesse)

### Added
- **Debounce** sur `saveToLocalStorage` (200 ms) : un batch d'actions ne déclenche plus N writes synchrones.
- **`flushPendingSave()`** : flush forcé de la sauvegarde en attente. Câblé sur `pagehide`, `beforeunload` et `visibilitychange:hidden` pour ne jamais perdre une mutation in-flight.
- **`SCHEMA_VERSION`** stocké dans `state.schemaVersion` à chaque migration. Préparation pour migrations explicites futures.
- **`src/schemas.ts`** : schémas **Zod** pour valider les payloads d'import (`ImportPayloadSchema`, `ImportItemSchema`). Bornes (200 chars sur les noms, 2000 items max) pour éviter les payloads malicieux/corrompus.
- **Tests** : 5 sur `schemas` + 6 sur `migrateState` (legacy categorie nom→id, fallback "autre", extraction favoris, ajout categoryOrder, préservation custom). 32 tests au total (vs 21).

### Changed
- **Service Worker** réécrit en **stale-while-revalidate** : sert le cache immédiatement et rafraîchit en arrière-plan. Plus de blocage utilisateur sur une vieille version après update.
- `processImportCode` et `checkImportUrl` valident désormais le payload via Zod et affichent un message clair si invalide.
- `handleImport` consomme `ImportPayload` typé directement (plus de cast `Item`).
- Erreurs `localStorage.setItem` (quota dépassé, navigation privée Safari, etc.) affichent un toast d'erreur explicite (une seule fois par session).

### Notes
- Bundle de prod : 136 KB / 35.8 KB gzip (vs 82 / 22.9 avant) ; +50 KB pour Zod. Compromis assumé pour la sécurité de l'import. Optimisation possible via validation custom plus tard si besoin.

## [Released b444644] — Phase C (accessibilité)

### Fixed
- **Violation WCAG 1.4.4** : retrait de `maximum-scale=1.0, user-scalable=no` de la meta viewport. Le zoom utilisateur est maintenant possible.

### Added
- **`src/utils/focus-trap.ts`** — `createFocusTrap(root, onEscape)` réutilisable + helper `getFocusables`.
- **Skip-link** "Aller au contenu" en début de page (visible uniquement au focus clavier, redirige vers `#mainContent`).
- **Sémantique HTML** :
  - `<header role="banner">`, `<main id="mainContent" role="main">`, `<nav aria-label="Actions principales">`, `<form aria-label="Ajouter un article">`.
  - `role="search"` sur le conteneur de recherche.
  - `role="tablist"` / `role="tab"` / `aria-selected` sur les onglets de liste.
  - `aria-live="polite"` sur le conteneur d'articles (annonce les changements).
- **ARIA sur les 11 modales** : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointant vers le titre, `aria-hidden` synchronisé au open/close.
- **Focus trap automatique** dans `openModal` : capture Tab/Shift+Tab dans la modale, ferme sur Escape.
- **Restauration du focus** : `closeModal` rend le focus à l'élément qui avait le focus avant l'ouverture.
- **Focus initial** sur le premier champ utile (input/select) à l'ouverture d'une modale, pas sur la croix de fermeture.
- **Toggle switches** (mode sombre, masquer cochés) deviennent de vrais boutons avec `role="switch"` + `aria-checked` (synchronisé via `toggleTheme` / `toggleHideChecked` et l'init).
- **Labels associés** : tous les `<label class="form-label">` ont un `for=` qui pointe vers l'input correspondant. Les inputs de recherche / d'ajout ont un label `.visually-hidden`.
- **`aria-label` FR** complets sur les boutons icône restants : header (manuel, effacer cochés, favoris, paramètres, nouvelle liste), close des modales, +/- font size, partager/importer, edit/delete catégorie, options merge.
- **Style `:focus-visible`** : outline net (vert primary + halo) sur tous les boutons et tabs au focus clavier.
- **Classe `.visually-hidden`** pour cacher visuellement tout en restant lisible par les lecteurs d'écran.

### Changed
- Les `.merge-option` (boutons d'action import + actions liste) sont des `<button type="button">` (au lieu de `<div onclick>`) : focus clavier, Enter/Space natifs.
- `renderListTabs` génère maintenant `role="tab"` + `aria-selected` + `tabindex` (0 actif, -1 inactif) pour la navigation tab/flèches.

## [Released ccecd43, 957bbbe] — Phase 1 + Phase B

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
