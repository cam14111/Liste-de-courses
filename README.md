# 🛒 Ma Liste de Courses

Application web standalone de liste de courses optimisée pour mobile avec stockage local.

## 🚀 Fonctionnalités

### ✅ Gestion de base
- ✅ Ajouter/supprimer/modifier des articles
- ✅ Cocher/décocher les articles achetés
- ✅ Édition rapide (nom, quantité, catégorie)
- ✅ Effacer tous les articles cochés d'un coup
- ✅ Sauvegarde automatique en localStorage

### 📋 Listes multiples
- 📑 Créer plusieurs listes (courses, pharmacie, bricolage...)
- 🔄 Dupliquer une liste existante
- 🗑️ Supprimer des listes (appui long sur l'onglet)

### 🏷️ Organisation intelligente
- 🏷️ Catégorisation automatique des articles (12 catégories)
- 🔀 Tri automatique par catégorie
- 🌈 Code couleur par catégorie
- 🖼️ Icônes pour chaque catégorie
- 📊 Compteur de progression (x/y articles cochés) par catégorie

### ⭐ Favoris et suggestions
- 📌 Marquer des articles comme favoris
- 🎯 Suggestions basées sur l'historique d'achat
- 🤖 Ajout rapide depuis les suggestions
- ⚡ Panneau de favoris pour ajout ultra-rapide

### 📱 Expérience mobile optimale
- 👆 Swipe vers la gauche pour supprimer
- 📳 Retour haptique (vibrations)
- 🔍 Recherche rapide en temps réel
- ⌨️ Ajout ultra-rapide (Enter pour valider)
- 📱 Interface tactile avec gros boutons

### 🎨 Personnalisation
- 🌗 Mode sombre/clair
- 📐 Taille de police ajustable (80% à 150%)
- 🎨 Design moderne et épuré

### 📤 Partage
- 📲 Partage via QR code
- 🔀 Import avec fusion intelligente :
  - Remplacer la liste actuelle
  - Fusionner sans doublons
  - Créer une nouvelle liste

### 🔧 Technique
- 📴 Fonctionne 100% offline (PWA)
- 🏠 Installable sur l'écran d'accueil
- ⚡ Ultra-rapide (fichier unique < 50kb sans la lib QR)
- 🔒 Données 100% privées (stockage local uniquement)
- 💾 Pas de serveur requis

## 📦 Installation

### Utilisation directe
1. Ouvrez simplement `index.html` dans votre navigateur
2. L'application fonctionne immédiatement !

### Installation sur mobile
1. Ouvrez l'application dans votre navigateur mobile
2. **iOS** : Appuyez sur le bouton Partager → "Sur l'écran d'accueil"
3. **Android** : Menu → "Ajouter à l'écran d'accueil"
4. L'application s'ouvre maintenant comme une app native !

### Hébergement

#### GitHub Pages (recommandé)
Déployez gratuitement sur GitHub Pages en suivant le **[Guide de déploiement](DEPLOIEMENT_GITHUB_PAGES.md)** :
1. Créez un repository GitHub
2. Uploadez les fichiers du projet
3. Activez GitHub Pages dans les paramètres
4. Votre app est en ligne ! 🎉

Fichiers nécessaires :
- `index.html`, `manifest.json`, `service-worker.js`
- `_config.yml` (configuration GitHub Pages)
- `.nojekyll` (important pour le bon fonctionnement)

#### Autres hébergeurs
L'application est compatible avec :
- **Netlify** : Glissez-déposez le dossier
- **Vercel** : Déploiement automatique via Git
- **Apache/Nginx** : Uploadez les fichiers sur votre serveur
- **GitHub Pages, GitLab Pages** : Intégration native

## 📚 Documentation

Pour une utilisation optimale de l'application, consultez :
- **[📖 Manuel Utilisateur (HTML)](manuel.html)** - Guide interactif détaillé pour les utilisateurs
- **[Manuel Utilisateur (MD)](MANUEL_UTILISATEUR.md)** - Version Markdown du guide
- **[🔧 Documentation Technique](DOCUMENTATION_TECHNIQUE.md)** - Architecture et détails techniques pour développeurs
- **[🚀 Guide de déploiement](DEPLOIEMENT_GITHUB_PAGES.md)** - Déployer sur GitHub Pages (et autres)

## 🎯 Utilisation

### Gérer les listes
- **Créer** : Bouton ➕ dans l'entête en haut à droite
- **Changer** : Cliquez sur les onglets en haut
- **Dupliquer/Renommer** : Appui long sur un onglet (mobile) ou clic droit (desktop)
- **Supprimer** : Appui long sur un onglet → Supprimer

### Accès rapide (entête)
- **📖 Manuel** : Accès au manuel utilisateur interactif
- **🗑️ Effacer cochés** : Supprime tous les articles cochés de la liste active
- **⭐ Favoris** : Ouvre le panneau des favoris pour ajout rapide
- **⚙️ Paramètres** : Ouvre les paramètres de l'application
- **➕ Nouvelle liste** : Crée une nouvelle liste

### Gérer les articles
- **Ajouter** : Tapez le nom et appuyez sur Entrer ou "Ajouter"
- **Cocher** : Cliquez sur le cercle à gauche
- **Modifier** : Cliquez sur le nom de l'article
- **Favoris** : Étoile ⭐ sur l'article
- **Supprimer** :
  - Bouton 🗑️ sur l'article
  - Ou icône 🗑️ dans l'entête pour effacer tous les cochés

### Catégories disponibles
- 🍎 Fruits
- 🥬 Légumes
- 🥩 Viandes
- 🐟 Poissons
- 🥛 Produits laitiers
- 🛍️ Épicerie
- ❄️ Surgelés
- 🥤 Boissons
- 🥖 Boulangerie
- 🧴 Hygiène
- 🧽 Entretien
- 📦 Autre

### Partager une liste
1. Ouvrez Paramètres ⚙️
2. Cliquez sur "📤 Partager la liste"
3. Un QR code et un code texte sont générés
4. Partagez le QR code ou copiez le code texte
5. L'autre personne importe via Paramètres > 📥 Importer
6. Choix : Remplacer / Fusionner / Nouvelle liste

### Utiliser les favoris
1. Cliquez sur l'icône ⭐ dans l'entête en haut à droite
2. Parcourez vos articles favoris groupés par catégorie
3. Cliquez sur un article pour l'ajouter instantanément à votre liste
4. Ajoutez plusieurs favoris sans fermer la fenêtre

### Réorganiser les catégories
- **Desktop** : Cliquez-glissez la poignée ☰ à gauche du nom de catégorie
- **Mobile** : Touchez et maintenez la poignée ☰, puis déplacez
- L'ordre est sauvegardé automatiquement

## 🛠️ Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec variables CSS
- **JavaScript Vanilla** : Aucune dépendance (sauf QRCode.js)
- **PWA** : Service Worker pour fonctionnement offline
- **LocalStorage** : Persistance des données
- **QRCode.js** : Génération de QR codes

## 📊 Performance

- ⚡ Chargement initial : < 100ms
- 💾 Taille totale : ~40kb (HTML+CSS+JS inline)
- 🚀 Temps de réponse : < 10ms
- 📱 Optimisé pour mobile et tablette
- 🔋 Économie de batterie (pas de requêtes réseau)

## 🔐 Confidentialité

- ✅ Aucune donnée envoyée sur Internet
- ✅ Stockage 100% local dans votre navigateur
- ✅ Aucun tracking, aucun cookie
- ✅ Pas de compte requis
- ✅ Open source et auditable

## 🌐 Compatibilité

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## 📝 Licence

Ce projet est libre d'utilisation.

## 🤝 Contribution

N'hésitez pas à suggérer des améliorations ou signaler des bugs !

### Pour les développeurs

Consultez la [Documentation Technique](DOCUMENTATION_TECHNIQUE.md) pour :
- Architecture détaillée de l'application
- Structure des données et API
- Guide de contribution
- Roadmap des fonctionnalités

## 🔍 Détails techniques

### Architecture
- **Fichier unique** : Tout le code HTML, CSS et JavaScript dans [index.html](index.html)
- **Taille** : ~85KB non compressé, ~20KB gzippé
- **Service Worker** : Cache pour fonctionnement offline
- **LocalStorage** : Stockage persistant local

### Catégories intelligentes
L'application reconnaît automatiquement ~150 mots-clés répartis dans 12 catégories et place chaque article dans la bonne catégorie.

### Système de favoris
Les favoris sont partagés entre toutes vos listes. Marquez un article favori une fois, retrouvez-le partout.

### Confidentialité
- ✅ Zéro tracking, zéro analytics
- ✅ Données stockées uniquement sur votre appareil
- ✅ Aucune connexion serveur (hors CDN QRCode.js)
- ✅ Code source ouvert et auditable

---

Fait avec ❤️ pour simplifier vos courses

**Liens utiles :**
- [📖 Manuel Utilisateur (HTML)](manuel.html) - Guide complet interactif
- [📄 Manuel Utilisateur (MD)](MANUEL_UTILISATEUR.md) - Version Markdown
- [🔧 Documentation Technique](DOCUMENTATION_TECHNIQUE.md) - Pour les développeurs
- [🚀 Guide de déploiement](DEPLOIEMENT_GITHUB_PAGES.md) - Déployer sur GitHub Pages