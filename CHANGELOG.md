# Changelog

## [3.1.0] — Fiabilisation & refonte UX

### Fixed
- **Partage cassé avec accents spéciaux/emoji** : `btoa` plantait sur « œ », « 🍫 »… → encodage base64 UTF-8 (`src/utils/base64.ts`), rétro-compatible avec les anciens codes Latin-1.
- **XSS** : les chips de suggestions injectaient le nom d'article sans échappement dans `innerHTML`.
- **Fuite mémoire** : les écouteurs `touchmove`/`touchend` du drag & drop étaient ré-ajoutés sur `document` à chaque rendu ; ils ne sont plus enregistrés qu'une fois.
- **Crash potentiel** : `getCurrentList()` pouvait renvoyer `undefined` (liste courante supprimée / état corrompu) ; la migration garantit désormais au moins une liste et une liste courante valide.
- **Catégories par défaut supprimées ou renommées qui réapparaissaient** au rechargement : suivi via `removedDefaultCategories`.
- La catégorie « autre » (repli) ne peut plus être supprimée ni renommée ; le renommage vers un nom déjà pris est bloqué.
- **Bouton « Ajouter » coupé sur mobile** (l'input ne rétrécissait pas, `min-width: 0` manquant).
- **Champ prix** : `type="number"` refusait la virgule française → champ texte `inputmode="decimal"`, « 2,50 » accepté.
- QRCode.js n'est plus chargé au démarrage (script bloquant) mais à la demande, avec timeout et message hors ligne.
- Les suggestions se rafraîchissent après suppression/annulation d'un article.

### Added
- **Partage par lien** : le QR code encode une URL `?import=…` — scanner avec l'appareil photo ouvre directement l'app avec la fenêtre d'import. Boutons « 📲 Partager… » (Web Share API, mobile) et « 🔗 Copier le lien ». L'import manuel accepte un lien complet ou un code.
- **Quantités comprises à la saisie** : « 3 bananes », « 2kg de pommes », « lait x2 » → nom et quantité séparés (`src/utils/quantity.ts`).
- **Autocomplétion en direct** : en tapant, les chips proposent les articles correspondants de l'historique et des favoris (insensible aux accents).
- **« Tout décocher »** dans le menu ⋮ d'une liste, avec annulation — pour réutiliser une liste d'une semaine sur l'autre.
- **Mode supermarché enrichi** : barre de progression (articles pris / total) et barre des totaux (« Reste à payer ») désormais visible.
- **Libellés accentués** des catégories (Épicerie, Hygiène, Légumes…) via `CATEGORY_LABELS`.
- **Thème sombre automatique** au premier lancement (`prefers-color-scheme`) + `meta theme-color` synchronisé.
- **Icônes PWA réelles** (PNG 192/512 + maskable + `apple-touch-icon`) : l'app installée a enfin une icône sur iOS et Android.

### Changed
- Plus aucun gestionnaire `onclick` inline ni global `window.*` : délégation d'événements partout (items, suggestions, favoris, catégories, onglets).
- Sélecteur de catégorie du modal d'édition trié selon l'ordre des catégories.
- 57 tests Vitest (vs 40) : +5 base64, +8 quantités, +4 migrations.

## [Unreleased] — Phase D (features utilisateur)

### Added — Prix & budget
- Champ `price` (optionnel, en €) sur chaque article. Édité dans le modal d'édition (input `type="number"` step 0.01, virgule ou point acceptés).
- Affichage du prix sur chaque ligne d'article (à côté de la quantité).
- **Barre de totaux** flottante en bas de l'écran (visible uniquement s'il y a au moins un prix) :
  - "Reste à payer" (somme des items non cochés avec prix)
  - "Total" estimé + indication des items sans prix
- Format `Intl.NumberFormat('fr-FR', currency: 'EUR')`.
- `src/utils/price.ts` (parsePrice, formatPrice, computeTotals) + 8 tests Vitest.
- Le QR code de partage embarque désormais `price` (version 3 du payload).
- `ImportItemSchema` (Zod) accepte `price` optionnel non-négatif (≤ 100 000).

### Added — Saisie vocale
- `src/voice.ts` — wrapper `SpeechRecognition` / `webkitSpeechRecognition` (langue `fr-FR`, `interimResults` off).
- Bouton micro 🎤 à côté du champ d'ajout : appui = écoute, appui à nouveau = stop. Animation pulse rouge en cours d'enregistrement.
- Le bouton n'apparaît pas du tout si l'API n'est pas supportée (Firefox desktop, Safari iOS jusqu'à v14, etc.).
- Erreurs de reconnaissance affichées via toast (sauf `no-speech` / `aborted` — silencieux).

### Added — Mode supermarché
- Bouton 🛒 dans le header (toggle, `aria-pressed` synchronisé).
- Vue plein-écran : header / search / form / barre de totaux masqués.
- Articles plus grands (1.15 rem), checkboxes 36×36 px avec border 3 px (cible tactile largement au-dessus des 44×44 recommandés WCAG via le padding du `.item`).
- Drag handle, toggle de catégorie, boutons d'item masqués (focus sur l'action principale : cocher).
- Items cochés à 45 % d'opacité (au lieu de 60 %).
- Bouton "✕ Quitter mode courses" flottant en haut à droite.
- Focus géré : entré → focus sur le bouton de sortie ; sortie → focus sur le bouton d'entrée.

### Tests
- 40 tests Vitest au total (vs 32) : +8 sur `price`.

## [Released aa736b6] — Phase E (perf & robustesse)

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
