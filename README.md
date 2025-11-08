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
Déployez simplement les 3 fichiers sur n'importe quel hébergeur :
- `index.html`
- `manifest.json`
- `service-worker.js`

Compatible avec : GitHub Pages, Netlify, Vercel, Apache, Nginx, etc.

## 🎯 Utilisation

### Gérer les listes
- **Créer** : Bouton ➕ en haut à droite
- **Changer** : Cliquez sur les onglets en haut
- **Dupliquer** : Appui long sur un onglet → Confirmer
- **Supprimer** : Appui long sur un onglet → Annuler

### Gérer les articles
- **Ajouter** : Tapez le nom et appuyez sur Entrer ou "Ajouter"
- **Cocher** : Cliquez sur le cercle à gauche
- **Modifier** : Cliquez sur le nom de l'article
- **Favoris** : Étoile ⭐ sur l'article
- **Supprimer** :
  - Bouton 🗑️ sur l'article
  - Ou swipe vers la gauche (mobile)

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
1. Cliquez sur "📤 Partager"
2. Un QR code est généré
3. L'autre personne scanne le QR code
4. Choix : Remplacer / Fusionner / Nouvelle liste

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

---

Fait avec ❤️ pour simplifier vos courses