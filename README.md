# 🛒 Ma Liste de Courses

Application web de liste de courses optimisée pour mobile. PWA installable, **fonctionne 100% hors ligne**, **aucun compte requis**, données stockées localement uniquement.

---

## ✨ Fonctionnalités

### Gestion des listes & articles
- Plusieurs listes simultanées (courses, pharmacie, bricolage, ...)
- Renommer / dupliquer / supprimer une liste (clic droit ou bouton ⋮)
- Ajout / édition / cochage / suppression d'articles
- **Annuler la dernière suppression** via le toast (5 s)
- **Catégorisation automatique** d'environ 150 mots-clés répartis sur 23 catégories par défaut, avec gestion des variantes singulier/pluriel et résolution par priorité (v2.2)
- Catégories personnalisables (icône, ajout, suppression, réorganisation par drag & drop)
- Effacer en un clic tous les articles cochés (avec annulation possible)

### Recherche, suggestions & favoris
- Recherche en temps réel avec **surlignage des correspondances**
- Bouton ✕ pour vider la recherche d'un clic
- Suggestions automatiques basées sur l'historique d'achat
- Système de favoris : étoile ⭐ sur n'importe quel article ; panneau d'ajout rapide groupé par catégorie

### Prix & budget *(nouveau)*
- Prix optionnel (€) sur chaque article
- **Barre de totaux** flottante : "Reste à payer" et "Total" estimé, avec indication des articles sans prix

### Saisie vocale *(nouveau)*
- Bouton 🎤 à côté du champ d'ajout (si l'API Web Speech est dispo)
- Reconnaissance en français, ajout direct à la liste

### Mode supermarché *(nouveau)*
- Bouton 🛒 dans le header → vue plein-écran épurée pour faire les courses
- Articles plus grands, checkboxes plus larges, distractions masquées

### Partage
- Partage par **QR code** ou code texte (base64) — aucun serveur impliqué
- Import avec 3 stratégies au choix : **remplacer**, **fusionner sans doublons**, **nouvelle liste**
- Validation stricte du payload importé (Zod)

### Confort & personnalisation
- Mode sombre / clair
- Taille de police ajustable (80 % – 150 %)
- Option "masquer les articles cochés"
- Retour haptique (vibrations) sur mobile

### Accessibilité (WCAG)
- Zoom utilisateur autorisé (`maximum-scale=1.0` retiré)
- Skip-link "Aller au contenu" au focus clavier
- Tous les boutons icône ont des `aria-label` FR
- Modales : `role="dialog"`, `aria-modal`, focus trap, restauration du focus à la fermeture
- Onglets de listes : `role="tab"` / `aria-selected` / navigation clavier
- Toggles `role="switch"` avec `aria-checked` synchronisé
- Conteneur d'articles `aria-live="polite"` (annonce les changements)
- Outline `:focus-visible` net sur tous les éléments interactifs

### Raccourcis clavier *(nouveau)*
| Raccourci | Action |
|---|---|
| `Ctrl` / `Cmd` + `K` | Focus sur la recherche |
| `/` | Focus sur l'ajout d'article |
| `Esc` | Ferme la modale ouverte, ou vide la recherche |
| `?` | Affiche / masque l'aide raccourcis |
| `Enter` | Valide le champ courant |

### Robustesse & perf
- Sauvegarde localStorage **debouncée** (200 ms) + flush sur `beforeunload` / `pagehide` / `visibilitychange:hidden`
- Toast d'erreur explicite si le stockage est indisponible (mode privé Safari, quota dépassé)
- Service Worker en **stale-while-revalidate** : pas de blocage sur une vieille version après mise à jour
- Migrations de schéma localStorage unifiées et testées

---

## 🚀 Démarrage rapide (utilisateur)

### En ligne
Si l'application est déployée (par ex. GitHub Pages), il suffit d'ouvrir l'URL.

### En local sans build
1. Téléchargez le dossier
2. Ouvrez `dist/index.html` (s'il existe) ou utilisez le mode développement (voir ci-dessous)

### Installation comme app
- **iOS / Safari** : bouton Partager → "Sur l'écran d'accueil"
- **Android / Chrome** : menu ⋮ → "Ajouter à l'écran d'accueil"

L'app s'installe alors comme une application native, démarre offline, occupe ~150 KB en cache.

---

## 🛠️ Stack technique

| Aspect | Détail |
|---|---|
| Langage | **TypeScript** strict |
| Bundler | **Vite 5** + `vite-plugin-singlefile` (bundle inliné en un seul `dist/index.html`) |
| Tests | **Vitest** (40 tests sur catégorisation, migration, schémas, prix) |
| Lint | ESLint + `@typescript-eslint` |
| Format | Prettier |
| Validation runtime | **Zod** (payloads d'import) |
| PWA | Service Worker stale-while-revalidate + manifest |
| Dépendances runtime | QRCode.js (CDN, lazy) |
| Backend | Aucun |
| Stockage | localStorage (avec migration de schéma versionnée) |

---

## 📦 Développement

```bash
npm install        # installe les dépendances dev
npm run dev        # lance Vite en mode dev (hot reload)
npm run build      # bundle de prod → dist/index.html (auto-contenu)
npm run preview    # sert dist/ pour tester avant déploiement
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run test       # Vitest run (40 tests)
npm run test:watch # Vitest en watch
npm run format     # Prettier --write
```

### Scripts CI

GitHub Actions exécute `lint + typecheck + test + build` sur chaque push et PR (`.github/workflows/ci.yml`).

---

## 📁 Structure du projet

```
Liste-de-courses/
├── index.html                 # Squelette HTML (≈270 lignes), entrée Vite
├── src/
│   ├── main.ts                # Init + wire-up DOM + window globals
│   ├── types.ts               # Interfaces TS (Item, ShoppingList, AppState…)
│   ├── constants.ts           # DEFAULT_CATEGORIES, AVAILABLE_ICONS, STORAGE_KEY
│   ├── state.ts               # Store + saveToLocalStorage debounced + migrateState
│   ├── categorize.ts          # Algo v2.2 (pur, testé)
│   ├── items.ts               # CRUD articles + favoris + undo
│   ├── lists.ts               # CRUD listes
│   ├── modals.ts              # openModal/closeModal + focus trap + restore
│   ├── confirm.ts             # confirmDialog/alertDialog (remplace alert/confirm natifs)
│   ├── toast.ts               # Toasts success/error/info + action
│   ├── shortcuts.ts           # Raccourcis clavier
│   ├── share.ts               # Export QR + import (avec validation Zod)
│   ├── schemas.ts             # Schémas Zod
│   ├── settings.ts            # Mode sombre, font size, reset
│   ├── voice.ts               # Web Speech API wrapper
│   ├── dragdrop.ts            # Réordonnancement drag & drop des catégories
│   ├── interactions.ts        # Long-press, swipe, toggle item
│   ├── styles.css             # CSS unifié (variables, responsive, dark mode)
│   ├── utils/
│   │   ├── escape.ts          # escapeHtml / highlight (regex-safe)
│   │   ├── focus-trap.ts      # createFocusTrap réutilisable
│   │   └── price.ts           # parsePrice / formatPrice / computeTotals
│   └── render/
│       ├── items.ts           # Rendu de la liste + barre de totaux
│       ├── tabs.ts            # Onglets de listes (role=tab)
│       ├── suggestions.ts     # Chips de suggestions
│       ├── favorites.ts       # Grille des favoris
│       └── categories.ts      # Liste des catégories en paramètres
├── tests/                     # Vitest (40 tests)
├── scripts/post-build.mjs     # Copie manifest/SW/.nojekyll dans dist/
├── service-worker.js          # SW stale-while-revalidate
├── manifest.json              # PWA manifest
├── vite.config.ts
├── tsconfig.json
├── package.json
├── CHANGELOG.md
├── MANUEL_UTILISATEUR.md
├── DOCUMENTATION_TECHNIQUE.md
└── manuel.html
```

---

## 📦 Déploiement

```bash
npm run build
# Le dossier dist/ contient :
#   - index.html (auto-contenu, CSS + JS inlinés, ≈140 KB / 38 KB gzip)
#   - manifest.json
#   - service-worker.js
#   - .nojekyll
```

Déployer ce dossier sur n'importe quel hébergeur statique : **GitHub Pages**, Netlify, Vercel, Cloudflare Pages, S3, Apache, Nginx.

Pour GitHub Pages, le `.nojekyll` est requis (déjà présent dans `dist/` après build).

---

## 🧪 Tests

```bash
npm run test
```

40 tests Vitest répartis :

- `tests/categorize.test.ts` (21) — normalisation, tokenisation, variantes, multi-mots, priorités, accents
- `tests/migrate.test.ts` (6) — migrations localStorage (legacy nom → ID, fallback `autre`, extraction favoris, ajout des catégories par défaut, préservation custom)
- `tests/schemas.test.ts` (5) — validation Zod (payload valide, nom vide, taille excessive, types invalides)
- `tests/price.test.ts` (8) — parsing FR/EN, formatage EUR, totaux

---

## 🔐 Confidentialité

- Aucune donnée n'est envoyée sur Internet
- Aucun tracking, aucun cookie, aucun analytics
- Seule dépendance externe : **QRCode.js** chargé en CDN à la première utilisation du partage (puis mis en cache par le SW)
- Code source ouvert et auditable

---

## 📚 Documentation

- **[CHANGELOG.md](CHANGELOG.md)** — historique des versions
- **[MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md)** — guide pas-à-pas pour les utilisateurs
- **[DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)** — architecture, modules, types, API
- **[manuel.html](manuel.html)** — version interactive du manuel utilisateur
- **[dictionnaire.md](dictionnaire.md)** — liste exhaustive des mots-clés par catégorie

---

## 🌐 Compatibilité navigateurs

- Chrome / Edge 90+
- Firefox 88+ (saisie vocale non supportée)
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

---

## 📝 Licence

Projet libre d'utilisation.
