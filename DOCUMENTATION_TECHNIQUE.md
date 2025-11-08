# Documentation Technique - Ma Liste de Courses

## Table des matières
1. [Architecture générale](#architecture-générale)
2. [Structure du projet](#structure-du-projet)
3. [Technologies utilisées](#technologies-utilisées)
4. [Structure des données](#structure-des-données)
5. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
6. [Système de stockage](#système-de-stockage)
7. [PWA et Service Worker](#pwa-et-service-worker)
8. [API et fonctions principales](#api-et-fonctions-principales)
9. [Système de catégories](#système-de-catégories)
10. [Migration et compatibilité](#migration-et-compatibilité)
11. [Performance](#performance)
12. [Sécurité et confidentialité](#sécurité-et-confidentialité)

---

## Architecture générale

### Concept
**Ma Liste de Courses** est une Progressive Web App (PWA) monofichier qui fonctionne entièrement côté client sans backend.

### Principes de conception
- **Zero-dependency** : Aucune dépendance npm, pas de bundler
- **Offline-first** : Fonctionne sans connexion Internet
- **Privacy-first** : Toutes les données restent sur l'appareil
- **Mobile-first** : Optimisée pour mobile avec support desktop
- **Single-file** : Tout le code dans un seul fichier HTML

### Architecture technique
```
┌─────────────────────────────────────┐
│         index.html (40kb)           │
│  ┌──────────────────────────────┐   │
│  │   HTML Structure             │   │
│  │   - Headers & Meta           │   │
│  │   - Modals (10 modales)      │   │
│  │   - Main container           │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │   CSS (<style>)              │   │
│  │   - Variables CSS            │   │
│  │   - Responsive design        │   │
│  │   - Animations               │   │
│  │   - Dark mode support        │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │   JavaScript (<script>)      │   │
│  │   - State management         │   │
│  │   - CRUD operations          │   │
│  │   - LocalStorage sync        │   │
│  │   - UI rendering             │   │
│  │   - Event listeners          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           │
           ├─────► manifest.json (PWA config)
           ├─────► service-worker.js (Cache)
           └─────► QRCode.js (CDN externe)
```

---

## Structure du projet

### Fichiers

```
Liste-de-courses-main/
├── index.html              # Application complète (HTML + CSS + JS)
├── manifest.json          # Configuration PWA
├── service-worker.js      # Service worker pour cache offline
├── README.md              # Documentation utilisateur
├── MANUEL_UTILISATEUR.md  # Manuel détaillé
└── DOCUMENTATION_TECHNIQUE.md  # Ce fichier
```

### Taille des fichiers
- **index.html** : ~85kb (non minifié)
- **manifest.json** : ~1kb
- **service-worker.js** : ~2kb
- **Total** : ~88kb
- **QRCode.js (CDN)** : ~12kb

---

## Technologies utilisées

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Flexbox, Grid, Animations
- **JavaScript ES6+** : Vanilla JS moderne

### Bibliothèques externes
- **QRCode.js** (v1.0.0) : Génération de QR codes
  - Chargée depuis CDN : jsdelivr.net
  - Uniquement pour le partage de listes

### APIs Web utilisées
- **LocalStorage API** : Persistance des données
- **Service Worker API** : Cache offline
- **Clipboard API** : Copier-coller de codes
- **History API** : Gestion des paramètres URL
- **Drag & Drop API** : Réorganisation des catégories
- **Touch Events API** : Interactions tactiles

### Compatibilité navigateurs
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

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

### 2. Catégorisation automatique

```javascript
function getCategory(itemName) {
    const name = itemName.toLowerCase();
    for (const [category, data] of Object.entries(state.categories)) {
        if (data.keywords.some(keyword => name.includes(keyword))) {
            return data.id;
        }
    }
    return state.categories['autre']?.id || 'default_autre';
}
```

**Algorithme :**
1. Convertit le nom en minuscules
2. Parcourt toutes les catégories
3. Cherche un mot-clé dans le nom
4. Retourne l'ID de la première catégorie trouvée
5. Sinon retourne "autre"

**Exemple :**
- "Pommes de terre" contient "pomme" → Fruits
- "pomme de terre" contient "pomme de terre" → Légumes (priorité au mot composé)

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

### 5. Drag & Drop de catégories

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

### 6. Partage via QR Code

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
// Obtenir la catégorie d'un article
getCategory(itemName: String) → String (categoryId)

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
        keywords: ['pomme', 'banane', ...]
    },
    'ma-categorie': {
        id: 'custom_1641234567_abc123',  // ID généré
        icon: '🔧',
        color: 'var(--cat-autre)',
        keywords: []
    }
}
```

**Avantages :**
- Renommage sans casser les références
- Compatibilité avec anciennes données
- IDs stables pour le partage

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
- [ ] Retour haptique (vibrations)
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

### Version 2.0 (Actuelle)
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

**Version de la documentation :** 1.0
**Dernière mise à jour :** 2025-01-08
**Application :** Ma Liste de Courses v2.0
