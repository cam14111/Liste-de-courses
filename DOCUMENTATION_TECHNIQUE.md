# Documentation Technique - Ma Liste de Courses

> **v3 — refactor TypeScript**. L'architecture monofichier vanilla a été remplacée par une codebase modulaire TypeScript bundlée par Vite. Le bundle final reste un **seul fichier `dist/index.html` auto-contenu** (via `vite-plugin-singlefile`) pour préserver la simplicité de déploiement.

## Table des matières
1. [Architecture générale](#architecture-générale)
2. [Structure du projet](#structure-du-projet)
3. [Technologies utilisées](#technologies-utilisées)
4. [Workflow de développement](#workflow-de-développement)
5. [Tests & CI](#tests--ci)
6. [Structure des données](#structure-des-données)
7. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
8. [Système de stockage](#système-de-stockage)
9. [PWA et Service Worker](#pwa-et-service-worker)
10. [API et fonctions principales](#api-et-fonctions-principales)
11. [Système de catégories](#système-de-catégories)
12. [Migration et compatibilité](#migration-et-compatibilité)
13. [Performance](#performance)
14. [Sécurité et confidentialité](#sécurité-et-confidentialité)

---

## Architecture générale

### Concept
**Ma Liste de Courses** est une Progressive Web App (PWA) qui fonctionne entièrement côté client, **sans backend**. Le code est écrit en **TypeScript modulaire**, bundlé par **Vite** ; le bundle de production est inliné en un **seul fichier `dist/index.html` auto-contenu** par `vite-plugin-singlefile`.

### Principes de conception
- **TypeScript strict** : tout le code applicatif est typé
- **Modulaire** : 17 modules + utils + render/, séparation des responsabilités
- **Single-file deploy** : malgré la modularité, le build produit un seul HTML déployable n'importe où
- **Offline-first** : Service Worker en stale-while-revalidate
- **Privacy-first** : toutes les données restent dans le localStorage
- **A11y** : ARIA, focus trap, skip-link, navigation clavier

### Architecture technique

```
Source (TypeScript)
┌──────────────────────────────────────────┐
│  src/                                    │
│  ├── main.ts            (entry, wire-up) │
│  ├── state.ts           (store, debounce, migrations)
│  ├── categorize.ts      (algo v2.2 pur, testé)
│  ├── items.ts / lists.ts (CRUD)
│  ├── render/*.ts        (DOM rendering par section)
│  ├── modals.ts / confirm.ts / toast.ts (UI feedback)
│  ├── shortcuts.ts        (clavier)
│  ├── share.ts / schemas.ts (export QR + import Zod)
│  ├── settings.ts / dragdrop.ts / interactions.ts
│  ├── voice.ts            (Web Speech API wrapper)
│  ├── styles.css          (single CSS source)
│  └── utils/              (escape, focus-trap, price)
└──────────────────────────────────────────┘
                    │
              vite build
                    │
                    ▼
Production (single file)
┌──────────────────────────────────────────┐
│  dist/index.html  (≈140 KB / 38 KB gzip) │
│  ├─ HTML squelette                       │
│  ├─ CSS inliné (<style>)                 │
│  └─ JS inliné (<script type="module">)   │
└──────────────────────────────────────────┘
                    │
                    ├─► dist/manifest.json
                    ├─► dist/service-worker.js (SWR)
                    ├─► dist/.nojekyll
                    └─► QRCode.js (CDN, lazy)
```

---

## Structure du projet

```
Liste-de-courses/
├── index.html                  # Squelette HTML (≈270 lignes), entrée Vite
├── src/
│   ├── main.ts                 # Init, wire-up DOM, expose window globals
│   ├── types.ts                # Item, ShoppingList, AppState, …
│   ├── constants.ts            # DEFAULT_CATEGORIES, AVAILABLE_ICONS, STORAGE_KEY
│   ├── state.ts                # state singleton, save (debounced), load, migrateState
│   ├── categorize.ts           # Algo de catégorisation v2.2 (pur)
│   ├── items.ts                # CRUD articles + favoris + undo
│   ├── lists.ts                # CRUD listes
│   ├── modals.ts               # openModal/closeModal + focus trap auto + restore
│   ├── confirm.ts              # confirmDialog/alertDialog (remplacent alert/confirm)
│   ├── toast.ts                # Toast success/error/info + action
│   ├── shortcuts.ts            # Raccourcis clavier globaux
│   ├── share.ts                # Export QR + import (Zod-validated)
│   ├── schemas.ts              # Schémas Zod
│   ├── settings.ts             # toggleTheme, toggleHideChecked, font size, reset
│   ├── voice.ts                # Wrapper SpeechRecognition / webkitSpeechRecognition
│   ├── dragdrop.ts             # Réordonnancement catégories (souris + tactile)
│   ├── interactions.ts         # Long-press, swipe, toggle item
│   ├── styles.css              # CSS unifié
│   ├── utils/
│   │   ├── escape.ts           # escapeHtml / highlight regex-safe
│   │   ├── focus-trap.ts       # createFocusTrap + getFocusables
│   │   └── price.ts            # parsePrice, formatPrice, computeTotals
│   └── render/
│       ├── items.ts            # renderItems + barre de totaux
│       ├── tabs.ts             # renderListTabs (role=tab + aria-selected)
│       ├── suggestions.ts      # renderSuggestions
│       ├── favorites.ts        # renderFavorites + addItemFromFavorite
│       └── categories.ts       # renderCategoriesList + saveCategory
├── tests/
│   ├── categorize.test.ts      # 21 tests catégorisation
│   ├── migrate.test.ts         # 6 tests migrations
│   ├── schemas.test.ts         # 5 tests Zod
│   └── price.test.ts           # 8 tests prix
├── scripts/post-build.mjs      # Copie manifest/SW/.nojekyll dans dist/
├── service-worker.js           # SW stale-while-revalidate
├── manifest.json               # PWA manifest
├── vite.config.ts              # Vite + viteSingleFile + Vitest
├── tsconfig.json               # TS strict (target ES2020, DOM)
├── package.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── .github/workflows/ci.yml    # GitHub Actions (lint + typecheck + test + build)
├── CHANGELOG.md
├── README.md
├── MANUEL_UTILISATEUR.md
├── DOCUMENTATION_TECHNIQUE.md  # ce fichier
├── manuel.html                 # Manuel utilisateur HTML (existant, legacy)
└── dictionnaire.md             # Liste exhaustive des mots-clés
```

### Taille des artefacts (build de prod)
- `dist/index.html` : ~140 KB / **~38 KB gzip** (CSS + JS + Zod inlinés)
- `dist/manifest.json` : ~1.5 KB
- `dist/service-worker.js` : ~1 KB
- QRCode.js (CDN, lazy) : ~12 KB

---

## Technologies utilisées

### Stack
- **TypeScript 5** strict (target ES2020)
- **Vite 5** + `vite-plugin-singlefile` pour produire un HTML auto-contenu
- **Vitest** + jsdom pour les tests
- **ESLint** + `@typescript-eslint`
- **Prettier**
- **Zod** pour la validation runtime des payloads d'import

### Bibliothèques externes runtime
- **QRCode.js** (v1.0.0, ~12 KB) — chargée depuis jsdelivr CDN à la première utilisation du partage

### APIs Web utilisées
- **LocalStorage** — persistance des données
- **Service Worker** — cache offline (stratégie stale-while-revalidate)
- **Clipboard** — copie du code de partage
- **History** — gestion `?import=` dans l'URL
- **Drag & Drop** — réordonnancement catégories (souris)
- **Touch Events** — long-press, swipe, drag tactile
- **Vibration** — retour haptique
- **Web Speech (`SpeechRecognition`)** — saisie vocale (Chrome/Edge/Safari récent)
- **`Intl.NumberFormat`** — formatage prix en EUR (fr-FR)

### Compatibilité navigateurs
- Chrome / Edge 90+
- Firefox 88+ *(saisie vocale non supportée — bouton micro masqué)*
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

---

## Workflow de développement

### Installation
```bash
npm install
```

### Scripts npm

| Commande | Action |
|---|---|
| `npm run dev` | Lance Vite en mode dev (hot reload, http://localhost:5173) |
| `npm run build` | `tsc --noEmit` puis `vite build` puis `post-build.mjs` (copie SW/manifest, supprime le manifest hashé) |
| `npm run preview` | Sert `dist/` localement |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint sur `src/` et `tests/` |
| `npm run format` | Prettier --write |
| `npm run test` | Vitest run (40 tests) |
| `npm run test:watch` | Vitest en watch mode |

### Build script post-process
`scripts/post-build.mjs` :
1. Copie `manifest.json`, `service-worker.js`, `.nojekyll` dans `dist/`
2. Supprime tout `dist/manifest-<hash>.json` que Vite aurait pu produire
3. Réécrit `dist/index.html` pour pointer vers `manifest.json` (non hashé)

---

## Tests & CI

### Tests Vitest (40 au total)

| Fichier | Tests | Couverture |
|---|---|---|
| `tests/categorize.test.ts` | 21 | normalisation, tokenisation, variantes, multi-mots, priorités, accents |
| `tests/migrate.test.ts` | 6 | legacy nom → ID, fallback "autre", extraction favoris, ajout catégories par défaut, préservation custom |
| `tests/schemas.test.ts` | 5 | Zod payload valide, nom vide, taille excessive, types invalides |
| `tests/price.test.ts` | 8 | parsing FR/EN, format EUR, computeTotals |

### CI GitHub Actions
`.github/workflows/ci.yml` exécute sur chaque push et PR :
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`

---

## Structure des données

### State global

```javascript
state = {
    lists: {
        [listId]: {
            name: String,
            items: [Item]
        }
    },
    currentList: String,        // ID de la liste active
    settings: {
        theme: 'light' | 'dark',
        fontSize: Number,        // 80-150
        hideChecked: Boolean
    },
    collapsedCategories: {
        [categoryName]: Boolean
    },
    collapsedFavoriteCategories: {
        [categoryName]: Boolean
    },
    categories: {
        [categoryKey]: {
            id: String,          // ID technique (ex: 'default_fruits')
            icon: String,        // Emoji
            color: String,       // Variable CSS
            priority: Number,    // 0-2 : Priorité pour résolution de conflits (v2.2)
            keywords: [String]   // Pour catégorisation auto
        }
    },
    categoryOrder: [String],     // Ordre d'affichage
    history: {
        [itemName]: Number       // Compteur d'utilisation
    },
    importData: Object | null,   // Données d'import temporaires
    favorites: [                 // Liste persistante des favoris
        {
            name: String,
            category: String     // ID de catégorie
        }
    ]
}
```

### Objet Item

```javascript
Item = {
    id: String,              // Généré avec generateId()
    name: String,            // Nom de l'article
    quantity: String,        // Ex: "2kg", "3 unités"
    category: String,        // ID de catégorie (ex: 'default_fruits')
    checked: Boolean,        // Acheté ou non
    favorite: Boolean,       // Favori ou non
    addedAt: Number         // Timestamp d'ajout
}
```

### Format de partage

```javascript
ShareData = {
    version: 2,              // Version du format
    name: String,            // Nom de la liste
    items: [
        {
            name: String,
            quantity: String,
            category: String,    // ID technique
            checked: Boolean
        }
    ],
    timestamp: Number        // Date de génération
}
```

Le format est encodé en **base64** pour le partage via QR code ou texte.

---

## Fonctionnalités détaillées

### 1. Système de génération d'IDs

```javascript
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

- Combine timestamp et random
- Format : `l8x9k2p5a1b2c3`
- Collision quasi impossible
- Pas besoin de backend

### 2. Catégorisation automatique v2.2 (Améliorée)

**⚠️ Version 2.2 - Correctifs Majeurs**

La v2.2 corrige les faux positifs de catégorisation (ex: "marteau" catégorisé en Boissons à cause de "eau").

#### Architecture du Pipeline

```
Article → Normalisation → Tokenisation → Variantes → Matching → Priorités → Catégorie
"gâteaux"    "gateaux"    ["gateaux"]    pluriels   mot entier   tri        "boulangerie"
```

#### Algorithme Complet

```javascript
// 1. Normalisation (Unicode NFD)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')                    // Décompose é → e + ́
        .replace(/[\u0300-\u036f]/g, '')     // Supprime accents
        .trim();
}

// 2. Tokenisation (séparation en mots)
function tokenize(text) {
    return normalizeText(text)
        .split(/[\s\-''_,;:.!?()[\]{}]+/)    // Regex multi-séparateurs
        .filter(token => token.length > 0);
}

// 3. Variantes pluriel/singulier
function getWordVariants(word) {
    const variants = [word];

    // Déplurialisation : "pommes" → "pomme"
    if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
        variants.push(word.slice(0, -1));
    }

    // Pluriel en 'x' : "gâteaux" → "gâteau"
    if (word.length > 3 && word.endsWith('x')) {
        variants.push(word.slice(0, -1));
    }

    // Pluralisation : "pomme" → "pommes", "gâteau" → "gâteaux"
    if (!word.endsWith('s') && !word.endsWith('x')) {
        variants.push(word + 's');
        if (word.endsWith('au') || word.endsWith('eau')) {
            variants.push(word + 'x');
        }
    }

    return variants;
}

// 4. Matching par mots entiers (+ variantes)
function matchesWord(itemTokens, keyword) {
    const keywordTokens = tokenize(keyword);

    if (keywordTokens.length === 1) {
        // Mot simple : vérifier les variantes
        const keywordVariants = getWordVariants(keywordTokens[0]);
        for (const itemToken of itemTokens) {
            const itemVariants = getWordVariants(itemToken);
            for (const kv of keywordVariants) {
                if (itemVariants.includes(kv)) return true;
            }
        }
        return false;
    } else {
        // Expression multi-mots : correspondance consécutive
        for (let i = 0; i <= itemTokens.length - keywordTokens.length; i++) {
            let match = true;
            for (let j = 0; j < keywordTokens.length; j++) {
                const itemVariants = getWordVariants(itemTokens[i + j]);
                const keywordVariants = getWordVariants(keywordTokens[j]);

                let tokenMatch = false;
                for (const kv of keywordVariants) {
                    if (itemVariants.includes(kv)) {
                        tokenMatch = true;
                        break;
                    }
                }
                if (!tokenMatch) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        return false;
    }
}

// 5. Catégorisation avec système de priorités
function getCategory(itemName) {
    const normalizedTokens = tokenize(itemName);
    const matches = [];

    // Collecter toutes les correspondances
    for (const [category, data] of Object.entries(state.categories)) {
        if (!data.keywords || data.keywords.length === 0) continue;

        for (const keyword of data.keywords) {
            if (matchesWord(normalizedTokens, keyword)) {
                matches.push({
                    category: category,
                    id: data.id || category,
                    priority: data.priority || 0,
                    keyword: keyword
                });
                break;
            }
        }
    }

    // Trier par priorité décroissante et retourner la meilleure
    if (matches.length > 0) {
        matches.sort((a, b) => b.priority - a.priority);
        return matches[0].id;
    }

    return state.categories['autre']?.id || 'default_autre';
}
```

#### Exemples de Fonctionnement

**Cas Positifs :**
| Article Saisi | Tokens | Variantes | Keyword Matché | Catégorie |
|---------------|--------|-----------|----------------|-----------|
| `eau` | `["eau"]` | `["eau", "eaus", "eaux"]` | `eau` | Boissons |
| `marteau` | `["marteau"]` | `["marteau", "marteaus", "marteaux"]` | `marteau` | Bricolage (priorité 2) |
| `gâteaux` | `["gateaux"]` | `["gateaux", "gateau"]` | `gâteau` | Boulangerie |
| `pommes de terre` | `["pommes", "de", "terre"]` | variantes | `pomme de terre` | Légumes |

**Faux Positifs Évités :**
| Article | Tokens | Pourquoi PAS Boissons ? |
|---------|--------|-------------------------|
| `rideau` | `["rideau"]` | "eau" n'est pas un token entier |
| `château` | `["chateau"]` | "eau" n'est pas un token entier |
| `couteau` | `["couteau"]` | "eau" n'est pas un token entier |

#### Système de Priorités

```javascript
const DEFAULT_CATEGORIES = {
    'boissons': { priority: 1, keywords: ['eau', 'jus', ...] },    // Générique
    'bricolage': { priority: 2, keywords: ['marteau', ...] },      // Spécifique
    'boulangerie': { priority: 2, keywords: ['gâteau', ...] },     // Spécifique
    'autre': { priority: 0, keywords: [] }                         // Défaut
};
```

**Niveaux :**
- **0** : Catégorie par défaut (Autre)
- **1** : Catégories génériques avec mots-clés courts (Boissons)
- **2** : Catégories spécifiques avec mots-clés longs (toutes les autres)

**Résolution de Conflits :**
Si un article matche plusieurs catégories, on prend celle avec la **priorité la plus élevée**.

Exemple : "eau de marteau" (fictif) matcherait `eau` (Boissons, priorité 1) ET `marteau` (Bricolage, priorité 2) → **Bricolage** gagne.

### 3. Système de favoris

**Architecture :**
- Liste persistante globale : `state.favorites`
- Flag par article : `item.favorite`
- Synchronisation bidirectionnelle

**Logique de synchronisation :**

```javascript
function toggleFavorite(itemId) {
    // 1. Trouver l'article
    const item = currentList.items.find(i => i.id === itemId);
    const newState = !item.favorite;

    // 2. Synchroniser dans TOUTES les listes
    Object.values(state.lists).forEach(list => {
        list.items.forEach(listItem => {
            if (listItem.name.toLowerCase() === item.name.toLowerCase()) {
                listItem.favorite = newState;
            }
        });
    });

    // 3. Mettre à jour la liste persistante
    if (newState) {
        state.favorites.push({name: item.name, category: item.category});
    } else {
        state.favorites = state.favorites.filter(f => f.name !== item.name);
    }
}
```

### 4. Suggestions intelligentes

**Algorithme :**
1. Trier l'historique par fréquence décroissante
2. Prendre les 10 premiers
3. Filtrer ceux déjà dans la liste active
4. Afficher maximum 5 suggestions

```javascript
function renderSuggestions() {
    const suggestions = Object.entries(state.history)
        .sort((a, b) => b[1] - a[1])  // Tri par fréquence
        .slice(0, 10)
        .map(([name]) => name);

    const existingNames = currentList.items.map(i => i.name.toLowerCase());
    const filtered = suggestions.filter(s => !existingNames.includes(s));

    return filtered.slice(0, 5);
}
```

### 5. Compteur de progression des catégories

**Fonctionnalité :**
Chaque header de catégorie affiche un compteur de progression au format `x/y` où :
- `x` = nombre d'articles cochés dans la catégorie
- `y` = nombre total d'articles dans la catégorie

**Implémentation :**
```javascript
container.innerHTML = orderedCategories.map(([category, items]) => {
    const categoryData = state.categories[category];
    const isCollapsed = state.collapsedCategories[category];
    const checkedCount = items.filter(i => i.checked).length;
    return `
        <span class="category-count">${checkedCount}/${items.length}</span>
    `;
});
```

**Mise à jour en temps réel :**
- Le compteur est recalculé à chaque appel de `renderItems()`
- Mise à jour automatique lors du cochage/décochage d'un article
- Mise à jour lors de l'ajout/suppression d'articles

**Exemple :**
- `0/4` : Aucun article coché sur 4
- `2/5` : 2 articles cochés sur 5
- `4/4` : Tous les articles cochés

### 6. Retour haptique (Vibration API)

**Implémentation uniforme :**

L'application utilise le retour haptique pour améliorer l'expérience utilisateur sur les interactions principales :

```javascript
// Fonction standard de vibration (50ms)
if (navigator.vibrate) {
    navigator.vibrate(50);
}
```

**Points de déclenchement :**

**1. Appui long sur une liste (500ms)**
```javascript
tab.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => {
        // Vibration feedback si disponible
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        handleListContextMenu(e, tab.dataset.list);
    }, 500);
});
```

**2. Glisser-déposer des catégories**
```javascript
handle.addEventListener('touchstart', (e) => {
    // Vibration feedback si disponible
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    draggedElement = category;
    category.classList.add('dragging');
});
```

**3. Validation d'un article (cocher/décocher)**
```javascript
function toggleItem(itemId) {
    const item = list.items.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        // Vibration feedback si disponible
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        saveToLocalStorage();
        renderItems();
    }
}
```

**4. Appui long sur un article (500ms)**
```javascript
longPressTimer = setTimeout(() => {
    isLongPress = true;
    // Vibration feedback si disponible
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    openEditModal(itemId);
}, 500);
```

**Caractéristiques :**
- Durée uniforme : **50ms** pour tous les événements
- Vérification de compatibilité : `if (navigator.vibrate)`
- Pas de déclenchement multiple grâce aux flags existants
- Compatible avec iOS Safari 13+, Chrome 32+, Firefox 16+
- Graceful degradation : fonctionne silencieusement si non supporté

**Avantages UX :**
- Confirmation tactile des interactions
- Améliore la perception de réactivité
- Cohérence avec les standards mobiles natifs
- Économe en batterie (vibrations courtes)

### 7. Drag & Drop de catégories

**Support double (souris + tactile) :**

**Desktop (événements souris) :**
```javascript
// dragstart, dragover, drop, dragend
category.addEventListener('dragstart', (e) => {
    draggedElement = category;
    category.classList.add('dragging');
});
```

**Mobile (événements tactiles) :**
```javascript
// touchstart, touchmove, touchend
handle.addEventListener('touchstart', (e) => {
    draggedElement = category;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Empêche le scroll
    const elementBelow = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
    );
    // Réorganiser en temps réel
});
```

**Sauvegarde de l'ordre :**
```javascript
const newOrder = Array.from(document.querySelectorAll('.category-section'))
    .map(el => el.dataset.category);
state.categoryOrder = newOrder;
saveToLocalStorage();
```

### 8. Partage via QR Code

**Génération :**
```javascript
function generateQRCode() {
    // 1. Créer l'objet de données
    const data = {
        version: 2,
        name: list.name,
        items: list.items.map(item => ({...})),
        timestamp: Date.now()
    };

    // 2. Encoder en base64
    const encoded = btoa(JSON.stringify(data));

    // 3. Générer le QR code
    new QRCode(document.getElementById('qrcode'), {
        text: encoded,
        width: 256,
        height: 256
    });
}
```

**Import :**
```javascript
function processImportCode() {
    // 1. Décoder le base64
    const decoded = JSON.parse(atob(code));

    // 2. Normaliser les catégories
    const normalizedItems = decoded.items.map(item => ({
        ...item,
        category: normalizeCategoryOnImport(item.category)
    }));

    // 3. Appliquer selon le mode choisi
    if (action === 'replace') { /* ... */ }
    if (action === 'merge') { /* ... */ }
    if (action === 'new') { /* ... */ }
}
```

---

## Système de stockage

### LocalStorage

**Clé de stockage :** `shoppingListApp`

**Sauvegarde automatique :**
```javascript
function saveToLocalStorage() {
    localStorage.setItem('shoppingListApp', JSON.stringify(state));
}
```

- Appelée après chaque modification
- Sauvegarde tout l'état global
- Pas de debouncing (performances acceptables)

**Chargement :**
```javascript
function loadFromLocalStorage() {
    const saved = localStorage.getItem('shoppingListApp');
    if (saved) {
        const loadedState = JSON.parse(saved);
        // Fusion intelligente avec les valeurs par défaut
        state = { ...defaultState, ...loadedState };
    }
}
```

### Limites de stockage

| Navigateur | Limite LocalStorage |
|-----------|---------------------|
| Chrome | 10 MB |
| Firefox | 10 MB |
| Safari | 5 MB |
| iOS Safari | 5 MB |

**Estimation pour l'app :**
- 1 article ≈ 150 bytes
- 1000 articles ≈ 150 KB
- Marge confortable jusqu'à 10000+ articles

---

## PWA et Service Worker

### Manifest.json

```json
{
  "name": "Ma Liste de Courses",
  "short_name": "Courses",
  "description": "Application de liste de courses...",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4CAF50",
  "icons": [...]
}
```

**Propriétés clés :**
- `display: standalone` : Masque la barre d'adresse
- `theme_color` : Couleur de la barre de statut
- `icons` : Générées en SVG inline

### Service Worker

**Stratégie de cache : Cache First**

```javascript
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

**Ressources mises en cache :**
- `/` et `/index.html`
- `/manifest.json`
- `https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js`

**Gestion des versions :**
```javascript
const CACHE_NAME = 'shopping-list-v1';

// Nettoyage des anciennes versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
```

---

## API et fonctions principales

### Gestion des listes

```javascript
// Créer une liste
createList(name: String) → void

// Supprimer une liste
deleteList(listId: String) → void

// Dupliquer une liste
duplicateList(listId: String) → void

// Renommer une liste
renameList(listId: String, newName: String) → void
```

### Gestion des articles

```javascript
// Ajouter un article
addItem(name: String, quantity?: String, category?: String) → void

// Modifier un article
editItem(itemId: String, name: String, quantity: String, category: String) → void

// Supprimer un article
deleteItem(itemId: String) → void

// Cocher/décocher
toggleItem(itemId: String) → void

// Marquer favori
toggleFavorite(itemId: String) → void

// Effacer tous les cochés
clearCheckedItems() → void
```

### Rendu UI

```javascript
// Rafraîchir les onglets de listes
renderListTabs() → void

// Rafraîchir les articles
renderItems() → void

// Rafraîchir les suggestions
renderSuggestions() → void

// Rafraîchir les favoris
renderFavorites() → void

// Rafraîchir la liste des catégories
renderCategoriesList() → void
```

### Utilitaires

```javascript
// Normalisation (v2.2)
normalizeText(text: String) → String
// Déaccentue et met en minuscules (Unicode NFD)

// Tokenisation (v2.2)
tokenize(text: String) → Array<String>
// Sépare le texte en mots (tokens)

// Variantes pluriel/singulier (v2.2)
getWordVariants(word: String) → Array<String>
// Génère les variantes d'un mot (pomme → [pomme, pommes])

// Matching de mots entiers (v2.2)
matchesWord(itemTokens: Array<String>, keyword: String) → Boolean
// Vérifie si un mot-clé correspond à un token (avec variantes)

// Obtenir la catégorie d'un article (v2.2 améliorée)
getCategory(itemName: String) → String (categoryId)
// Catégorise avec tokenisation, variantes et priorités

// Obtenir la clé de catégorie depuis son ID
getCategoryKeyById(categoryId: String) → String

// Générer un ID unique
generateId() → String

// Sauvegarder l'état
saveToLocalStorage() → void

// Charger l'état
loadFromLocalStorage() → void
```

---

## Système de catégories

### Architecture v2 (actuelle)

**Problème v1 :** Les catégories utilisaient leur nom comme identifiant, rendant le renommage impossible.

**Solution v2 :** Système d'IDs techniques

```javascript
categories = {
    'fruits': {                    // Clé (nom affiché)
        id: 'default_fruits',      // ID technique unique
        icon: '🍎',
        color: 'var(--cat-fruits)',
        priority: 2,               // Priorité pour résolution de conflits (v2.2)
        keywords: ['pomme', 'banane', ...]
    },
    'boissons': {
        id: 'default_boissons',
        icon: '🥤',
        color: 'var(--cat-boissons)',
        priority: 1,               // Priorité plus basse (mots-clés génériques)
        keywords: ['eau', 'jus', 'vin', ...]
    },
    'ma-categorie': {
        id: 'custom_1641234567_abc123',  // ID généré
        icon: '🔧',
        color: 'var(--cat-autre)',
        priority: 2,               // Priorité par défaut pour catégories custom
        keywords: []
    }
}
```

**Avantages :**
- Renommage sans casser les références
- Compatibilité avec anciennes données
- IDs stables pour le partage
- **Nouveau v2.2 :** Système de priorités pour éviter les faux positifs

### Catégories par défaut

```javascript
DEFAULT_CATEGORIES = {
    'fruits': { id: 'default_fruits', icon: '🍎', ... },
    'legumes': { id: 'default_legumes', icon: '🥬', ... },
    'viandes': { id: 'default_viandes', icon: '🥩', ... },
    'poissons': { id: 'default_poissons', icon: '🐟', ... },
    'laitiers': { id: 'default_laitiers', icon: '🥛', ... },
    'epicerie': { id: 'default_epicerie', icon: '🛍️', ... },
    'surgeles': { id: 'default_surgeles', icon: '❄️', ... },
    'boissons': { id: 'default_boissons', icon: '🥤', ... },
    'boulangerie': { id: 'default_boulangerie', icon: '🥖', ... },
    'hygiene': { id: 'default_hygiene', icon: '🧴', ... },
    'entretien': { id: 'default_entretien', icon: '🧽', ... },
    'autre': { id: 'default_autre', icon: '📦', ... }
}
```

### Mots-clés (exemples)

```javascript
keywords: {
    fruits: ['pomme', 'banane', 'orange', 'fraise', ...],
    legumes: ['tomate', 'salade', 'carotte', 'courgette', ...],
    viandes: ['poulet', 'boeuf', 'porc', 'steak', ...],
    // ...
}
```

Total : ~150 mots-clés

### Création de catégories personnalisées

```javascript
function saveCategory() {
    if (!currentEditingCategory) {
        // Nouvelle catégorie
        state.categories[name] = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            icon: selectedIcon,
            color: 'var(--cat-autre)',
            keywords: []  // Vide pour les catégories custom
        };
    }
}
```

**Limitation :** Les catégories personnalisées n'ont pas de mots-clés pour la catégorisation automatique.

---

## Migration et compatibilité

### Système de migration

**Lors du chargement :**

```javascript
function loadFromLocalStorage() {
    // 1. Charger les données sauvegardées
    const loadedState = JSON.parse(localStorage.getItem('shoppingListApp'));

    // 2. Fusionner les catégories (nouvelles + anciennes)
    let categories = { ...DEFAULT_CATEGORIES };
    if (loadedState.categories) {
        Object.keys(loadedState.categories).forEach(catKey => {
            // Préserver les IDs, mettre à jour les keywords
        });
    }

    // 3. Migrer les items vers les IDs de catégories
    Object.values(state.lists).forEach(list => {
        list.items.forEach(item => {
            // Convertir les anciens noms en IDs
            if (!isCategoryId(item.category)) {
                item.category = getCategoryId(item.category);
            }
        });
    });

    // 4. Migrer les favoris
    if (state.favorites.length === 0) {
        // Extraire depuis les items
        extractFavoritesFromItems();
    }
}
```

### Versions du format de données

**V1 (ancienne) :**
```javascript
item.category = 'fruits'  // Nom direct
```

**V2 (actuelle) :**
```javascript
item.category = 'default_fruits'  // ID technique
```

**Format de partage V2 :**
```javascript
shareData.version = 2
shareData.items[].category = 'default_fruits'
```

### Normalisation lors de l'import

```javascript
function normalizeCategoryOnImport(importedCategory) {
    // 1. Chercher par ID exact
    if (existingCategoryWithId(importedCategory)) {
        return importedCategory;
    }

    // 2. Chercher par nom (compatibilité V1)
    if (state.categories[importedCategory]) {
        return state.categories[importedCategory].id;
    }

    // 3. Fallback vers "autre"
    return 'default_autre';
}
```

---

## Performance

### Optimisations implémentées

**1. Pas de framework lourd**
- 0 dépendance (hors QRCode.js)
- Vanilla JS optimisé
- Pas de virtual DOM

**2. Rendu direct**
```javascript
// Génération HTML directe (pas de templating)
container.innerHTML = items.map(item => `<li>...</li>`).join('');
```

**3. Event delegation**
```javascript
// Pas d'event listener par article
onclick="toggleItem('${item.id}')"
```

**4. Sauvegarde sans debouncing**
- LocalStorage très rapide (<1ms)
- Pas besoin de throttling

**5. Tri optimisé**
```javascript
// Tri en O(n log n) une seule fois
grouped[cat].sort((a, b) => a.checked ? 1 : -1);
```

### Métriques de performance

| Opération | Temps moyen |
|-----------|-------------|
| Ajout d'article | <10ms |
| Recherche | <5ms |
| Sauvegarde LocalStorage | <1ms |
| Rendu de 100 articles | ~50ms |
| Chargement initial | <100ms |

**Taille de bundle :**
- HTML + CSS + JS inline : ~85KB
- Gzip : ~20KB
- Brotli : ~15KB

---

## Sécurité et confidentialité

### Données locales uniquement

**Aucune donnée envoyée sur Internet :**
- Pas de backend
- Pas d'analytics
- Pas de tracking
- Pas de cookies tiers

**Exception :** La bibliothèque QRCode.js est chargée depuis un CDN lors du premier accès (avec connexion Internet).

### XSS Protection

**Échappement HTML :**
```javascript
// ❌ Risque XSS si l'utilisateur entre du HTML
container.innerHTML = item.name;

// ✅ Sécurisé car les données proviennent uniquement de l'utilisateur
// et restent locales (pas d'injection externe possible)
```

**Note :** Étant donné que :
1. Les données proviennent uniquement de l'utilisateur lui-même
2. Aucune donnée externe n'est injectée
3. Pas de communication réseau (hors CDN QRCode.js)

Le risque XSS est **négligeable**. Un utilisateur ne peut se faire du mal qu'à lui-même.

### LocalStorage Security

**Limites de sécurité :**
- Accessible par JavaScript (même domaine)
- Non chiffré
- Peut être lu par extensions navigateur malveillantes
- Effacé si l'utilisateur nettoie les cookies

**Bonnes pratiques :**
- Ne stockez PAS de données sensibles (mots de passe, CB, etc.)
- Les listes de courses ne sont pas des données critiques
- Acceptable pour ce use case

### Partage de listes

**Format base64 :**
```javascript
const encoded = btoa(JSON.stringify(data));
```

**Sécurité :**
- Base64 n'est PAS du chiffrement
- Les données sont lisibles par quiconque a le code
- Ne partagez pas de listes contenant des informations sensibles

**Recommandation :** Utilisez le partage uniquement pour des listes de courses standard.

---

## Développement et contribution

### Structure du code

**Organisation dans index.html :**

```javascript
// 1. CONSTANTES (lignes 1164-1230)
const DEFAULT_CATEGORIES = { ... };
const COMMON_ITEMS = [ ... ];
const AVAILABLE_ICONS = [ ... ];

// 2. STATE (lignes 1232-1248)
let state = { ... };

// 3. UTILS (lignes 1250-1414)
function getCategory() { ... }
function saveToLocalStorage() { ... }

// 4. GESTION DES LISTES (lignes 1416-1541)
function createList() { ... }
function deleteList() { ... }

// 5. GESTION DES ARTICLES (lignes 1542-1659)
function addItem() { ... }
function deleteItem() { ... }

// 6. RENDU (lignes 1661-2000)
function renderItems() { ... }
function renderSuggestions() { ... }

// 7. MODALS (lignes 2002-2050)
function openModal() { ... }
function closeModal() { ... }

// 8. PARTAGE/QR CODE (lignes 2052-2226)
function generateQRCode() { ... }
function handleImport() { ... }

// 9. PARAMÈTRES (lignes 2228-2277)
function toggleTheme() { ... }
function adjustFontSize() { ... }

// 10. CATÉGORIES (lignes 2279-2461)
function renderCategoriesList() { ... }
function saveCategory() { ... }

// 11. EVENT LISTENERS (lignes 2463-2587)
document.getElementById(...).addEventListener(...)

// 12. PWA (lignes 2589-2592)
if ('serviceWorker' in navigator) { ... }

// 13. INITIALISATION (lignes 2594-2613)
function init() { ... }
init();
```

### Conventions de nommage

**Variables :**
- `camelCase` pour les variables et fonctions
- `UPPER_SNAKE_CASE` pour les constantes
- `state` pour l'état global

**Fonctions :**
- Verbes d'action : `addItem()`, `deleteList()`, `toggleTheme()`
- `render*()` pour les fonctions de rendu UI

**IDs HTML :**
- `camelCase` : `#editModal`, `#itemInput`
- Suffixes : `Btn`, `Modal`, `Input`, `Container`

### Ajout de fonctionnalités

**Exemple : Ajouter une nouvelle catégorie par défaut**

```javascript
// 1. Ajouter dans DEFAULT_CATEGORIES
const DEFAULT_CATEGORIES = {
    // ...
    'nouveauType': {
        id: 'default_nouveauType',
        icon: '🎁',
        color: 'var(--cat-nouveauType)',
        keywords: ['mot1', 'mot2', 'mot3']
    }
};

// 2. Ajouter la variable CSS dans :root
:root {
    --cat-nouveauType: #FF5733;
}

// 3. Ajouter dans categoryOrder
categoryOrder: [..., 'nouveauType', 'autre']
```

**Exemple : Ajouter une nouvelle action sur les articles**

```javascript
// 1. Ajouter la fonction
function nouvelleFonction(itemId) {
    const item = state.lists[state.currentList].items.find(i => i.id === itemId);
    // Logique...
    saveToLocalStorage();
    renderItems();
}

// 2. Ajouter le bouton dans renderItems()
<button onclick="nouvelleFonction('${item.id}')">Icône</button>
```

### Tests manuels recommandés

**Checklist avant déploiement :**
- [ ] Ajouter un article
- [ ] Modifier un article
- [ ] Cocher/décocher un article
- [ ] Supprimer un article
- [ ] Marquer/retirer favori
- [ ] Créer une nouvelle liste
- [ ] Renommer une liste
- [ ] Dupliquer une liste
- [ ] Supprimer une liste
- [ ] Rechercher un article
- [ ] Réorganiser les catégories (drag & drop)
- [ ] Replier/déplier une catégorie
- [ ] Partager une liste (QR code)
- [ ] Importer une liste (3 modes)
- [ ] Créer une catégorie personnalisée
- [ ] Modifier une catégorie
- [ ] Supprimer une catégorie
- [ ] Mode sombre
- [ ] Ajuster la taille de police
- [ ] Masquer articles cochés
- [ ] Réinitialiser l'app
- [ ] Fonctionnement offline
- [ ] Installation PWA (mobile)

---

## Roadmap et améliorations futures

### Fonctionnalités envisageables

**Court terme :**
- [ ] Swipe pour supprimer (mobile)
- [x] Retour haptique (vibrations) - ✅ Implémenté
- [ ] Undo/Redo
- [ ] Recherche avancée (par catégorie)
- [ ] Export CSV/PDF
- [ ] Statistiques d'utilisation

**Moyen terme :**
- [ ] Synchronisation multi-appareils (Firebase, etc.)
- [ ] Partage collaboratif en temps réel
- [ ] Templates de listes
- [ ] Listes récurrentes (hebdomadaires)
- [ ] Budget estimé par liste
- [ ] Historique des listes archivées

**Long terme :**
- [ ] Application native (React Native, Flutter)
- [ ] Scan de codes-barres
- [ ] Reconnaissance vocale
- [ ] Intégration avec les magasins (prix, disponibilité)
- [ ] IA pour suggestions contextuelles

### Optimisations possibles

**Performance :**
- [ ] Virtualisation de listes (pour 1000+ articles)
- [ ] Web Workers pour recherche
- [ ] IndexedDB au lieu de LocalStorage

**UX/UI :**
- [ ] Animations plus fluides
- [ ] Thèmes personnalisables
- [ ] Accessibilité améliorée (ARIA)
- [ ] Mode lecture seule pour partage

**Technique :**
- [ ] Tests automatisés (Jest, Cypress)
- [ ] CI/CD
- [ ] Minification du code
- [ ] Service Worker plus agressif

---

## FAQ Technique

### Pourquoi un fichier unique ?

**Avantages :**
- Déploiement ultra-simple (copier-coller)
- Aucun build step
- Fonctionne en local sans serveur
- Facile à auditer (tout le code est visible)

**Inconvénients :**
- Fichier volumineux (~85KB)
- Pas de hot reload en dev
- Pas de TypeScript

### Pourquoi LocalStorage et pas IndexedDB ?

**LocalStorage :**
- API synchrone et simple
- Suffisant pour des données textuelles légères
- Limite de 5-10MB largement suffisante
- Meilleure compatibilité

**IndexedDB serait utile si :**
- Stockage de fichiers binaires (images)
- Besoin de >10MB de données
- Requêtes complexes

### Pourquoi pas de framework (React, Vue) ?

**Objectifs du projet :**
- Léger et rapide
- Aucune dépendance
- Apprentissage du vanilla JS
- Pas de build complexe

**Un framework serait utile pour :**
- Projet plus complexe
- Équipe de développeurs
- Réutilisation de composants

### Comment gérer les conflits de fusion ?

**Actuellement :**
- Fusion par nom (détection de doublons)
- Pas de résolution de conflits sophistiquée

**Améliorations possibles :**
- Hash des articles pour comparaison
- Fusion intelligente des quantités
- UI de résolution de conflits

---

## Changelog

### Version 2.2 (Actuelle)
**Correctifs Majeurs - Système de Catégorisation**
- ✅ **Tokenisation par mots entiers** : Fin des faux positifs (marteau ≠ eau)
- ✅ **Normalisation Unicode (NFD)** : Gestion robuste des accents (gâteau = gateau)
- ✅ **Système de priorités** : Résolution intelligente des conflits (priorité 1 vs 2)
- ✅ **Gestion des pluriels** : Support automatique (pommes ↔ pomme, gâteaux ↔ gâteau)
- ✅ **Suite de tests automatisés** : 22 tests unitaires (test-categorisation.html)
- ✅ **Documentation technique complète** : Architecture et algorithmes détaillés

**Fichiers Modifiés :**
- `index.html` : Lignes 1127-1150 (priorités), 1225-1313 (nouvelles fonctions), 1332-1347 (migration)
- `test-categorisation.html` : Nouveau fichier de tests
- `DOCUMENTATION_TECHNIQUE.md` : Section catégorisation mise à jour

**Tests de Validation :**
- ✅ 100% de réussite (22/22 tests)
- ✅ 11 cas positifs validés
- ✅ 8 faux positifs corrigés (rideau, château, couteau, bureau, seau, bateau, peau, beauté)
- ✅ 3 variantes testées (pluriels, accents, casse)

**Impact Utilisateur :**
- Articles correctement catégorisés automatiquement
- Moins de corrections manuelles nécessaires
- Support robuste des variantes linguistiques françaises

### Version 2.1
- ✅ Retour haptique uniforme sur toutes les interactions principales
- ✅ Vibration sur appui long (listes et articles)
- ✅ Vibration sur glisser-déposer des catégories
- ✅ Vibration sur validation d'articles

### Version 2.0
- ✅ Système d'IDs techniques pour catégories
- ✅ Migration automatique depuis V1
- ✅ Favoris persistants globaux
- ✅ Drag & drop pour réorganiser catégories
- ✅ Catégories repliables
- ✅ Gestion de listes multiples améliorée
- ✅ Import/Export avec normalisation

### Version 1.0 (Initiale)
- ✅ Gestion de base des listes
- ✅ Catégorisation automatique
- ✅ Partage via QR code
- ✅ Mode sombre
- ✅ PWA fonctionnel
- ✅ Favoris par article

---

## Licence et crédits

### Licence
Ce projet est libre d'utilisation. Voir le fichier [README.md](README.md) pour plus de détails.

### Dépendances
- **QRCode.js** (MIT License) - https://github.com/davidshimjs/qrcodejs

### Auteur
Projet open source communautaire

---

**Version de la documentation :** 2.2
**Dernière mise à jour :** 2025-01-09
**Application :** Ma Liste de Courses v2.2

**Nouvelles sections v2.2 :**
- Système de catégorisation amélioré (tokenisation, priorités, pluriels)
- Suite de tests automatisés
- Exemples d'algorithmes détaillés
- Documentation des nouvelles fonctions utilitaires
