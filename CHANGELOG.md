# Changelog

## [Unreleased] — Phase 1 (fondations)

### Added
- **Vite + TypeScript** : `package.json`, `tsconfig.json`, `vite.config.ts` avec `vite-plugin-singlefile` pour produire un `dist/index.html` auto-contenu.
- **TypeScript strict** : `tsconfig.json` avec `strict`, `noUnusedLocals`, `noUnusedParameters`.
- **Modules extraits** :
  - `src/types.ts` — interfaces `Item`, `ShoppingList`, `Category`, `AppState`, `Favorite`, `AppSettings`.
  - `src/constants.ts` — `STORAGE_KEY`, `SCHEMA_VERSION`, `DEFAULT_CATEGORIES`, `DEFAULT_CATEGORY_ORDER`.
  - `src/categorize.ts` — `normalizeText`, `tokenize`, `getWordVariants`, `matchesWord`, `getCategory`, `getCategoryKeyById` (purs, sans dépendance au DOM).
- **Tests Vitest** : `tests/categorize.test.ts` couvrant la normalisation, tokenisation, variantes singulier/pluriel, matching multi-mots, résolution par priorité, accents.
- **Outillage** : ESLint + Prettier + scripts npm (`lint`, `typecheck`, `test`, `build`, `dev`, `format`).
- **CI GitHub Actions** : `.github/workflows/ci.yml` (lint + typecheck + test + build sur push / PR).
- **Build script** : `scripts/post-build.mjs` copie `manifest.json`, `service-worker.js`, `.nojekyll` dans `dist/`.

### Notes
- L'ancien `index.html` (2907 lignes) reste inchangé et reste l'artefact déployable actuel pour assurer la rétro-compatibilité.
- Les modules extraits constituent une **fondation testable** et seront réutilisés par les phases suivantes.
- Le bundle Vite sera intégré progressivement dans les prochaines phases (extraction de `state.ts`, `items.ts`, `lists.ts`, `render/*`, `share.ts`, etc.).

### À venir (selon roadmap)
- Phase 1 (suite) : extraction complète de l'état, du rendu et des interactions DOM en modules TS, slim-down de `index.html`.
- Phase 2 (a11y) : retrait du `maximum-scale=1.0`, ARIA labels, focus trap, skip-link.
- Phase 3 (UX) : toast system, custom confirm, undo suppression, raccourcis clavier.
- Phase 4 (perf) : debounce localStorage, rendu incrémental, SW stale-while-revalidate, validation Zod.
- Phase 5 (features) : prix/budget, voix, mode supermarché, templates, import recettes.
