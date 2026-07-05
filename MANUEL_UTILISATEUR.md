# Manuel Utilisateur - Ma Liste de Courses

## Table des matières
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Démarrage rapide](#démarrage-rapide)
4. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
5. [Nouveautés v3](#nouveautés-v3) — *prix, voix, mode supermarché, undo, raccourcis*
6. [Accessibilité](#accessibilité)
7. [Astuces et bonnes pratiques](#astuces-et-bonnes-pratiques)
8. [Résolution de problèmes](#résolution-de-problèmes)

---

## Introduction

**Ma Liste de Courses** est une application web progressive (PWA) qui vous permet de gérer vos listes de courses de manière simple et efficace. L'application fonctionne 100% hors ligne, sans nécessiter de compte ou de connexion Internet après l'installation.

### Caractéristiques principales
- Gestion de listes multiples (courses, pharmacie, bricolage...)
- Catégorisation automatique des articles
- Système de favoris pour ajout rapide
- Suggestions intelligentes basées sur votre historique
- Partage de listes par lien, QR code ou menu de partage du téléphone
- Mode sombre et personnalisation de l'affichage
- Retour haptique (vibrations) sur les interactions principales
- Fonctionne entièrement hors ligne
- Vos données restent privées sur votre appareil
- **Prix par article + estimation de budget** (nouveau)
- **Saisie vocale** en français (nouveau, navigateurs compatibles)
- **Mode supermarché** plein-écran pour faire les courses (nouveau)
- **Annulation des suppressions** (toast undo, nouveau)
- **Raccourcis clavier** (nouveau)
- **Accessibilité améliorée** : ARIA, focus trap, navigation clavier (nouveau)

---

## Installation

### Sur ordinateur (navigateur web)
1. Ouvrez le fichier [index.html](index.html) dans votre navigateur web
2. L'application est prête à l'emploi immédiatement

### Sur mobile (installation comme application)

#### Sur iPhone/iPad (iOS)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton **Partager** (icône carrée avec flèche vers le haut)
3. Faites défiler et sélectionnez **Sur l'écran d'accueil**
4. Appuyez sur **Ajouter**
5. L'application apparaît maintenant sur votre écran d'accueil comme une app native

#### Sur Android
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu (3 points verticaux)
3. Sélectionnez **Ajouter à l'écran d'accueil**
4. Confirmez en appuyant sur **Ajouter**
5. L'application apparaît sur votre écran d'accueil

### Hébergement en ligne
Si vous souhaitez héberger l'application en ligne :
1. Téléchargez les 3 fichiers : `index.html`, `manifest.json`, `service-worker.js`
2. Hébergez-les sur n'importe quel serveur web (GitHub Pages, Netlify, etc.)
3. Accédez à l'URL dans votre navigateur

---

## Démarrage rapide

### Première utilisation

Au premier lancement, vous verrez une liste vide nommée "Courses".

**Pour ajouter votre premier article :**
1. Tapez le nom de l'article dans le champ "Ajouter un article..."
2. Appuyez sur **Entrée** ou cliquez sur **Ajouter**
3. L'article apparaît automatiquement dans la bonne catégorie

**Pour cocher un article acheté :**
- Cliquez sur le cercle à gauche de l'article

**Pour supprimer un article :**
- Cliquez sur l'icône **🗑️** à droite de l'article

---

## Fonctionnalités détaillées

### 1. Gestion des listes

#### Créer une nouvelle liste
1. Cliquez sur le bouton **➕** dans l'entête en haut à droite
2. Entrez le nom de la liste (ex: "Pharmacie", "Bricolage")
3. Cliquez sur **Créer**

#### Naviguer entre les listes
- Cliquez sur les onglets en haut de l'écran pour changer de liste active
- Le nombre d'articles cochés/total est affiché sur chaque onglet

#### Actions sur les listes (appui long)

**Sur mobile :**
1. Maintenez votre doigt appuyé sur un onglet de liste pendant 500ms
2. Une légère vibration confirme la détection de l'appui long
3. Un menu d'actions apparaît avec 3 options

**Sur ordinateur :**
1. Faites un clic droit sur un onglet de liste
2. Le menu d'actions apparaît

**Options disponibles :**

**✏️ Renommer**
- Modifie le nom de la liste
- Entrez le nouveau nom et validez

**📋 Dupliquer**
- Crée une copie complète de la liste avec tous ses articles
- Vous pouvez personnaliser le nom de la copie
- Par défaut : "Nom de la liste (copie)"

**🗑️ Supprimer**
- Supprime définitivement la liste et tous ses articles
- Une confirmation est demandée
- Impossible de supprimer la dernière liste (minimum 1 liste requise)

#### Compteurs sur les onglets
Chaque onglet affiche : `Nom de la liste (cochés/total)`
- Exemple : `Courses (5/12)` = 5 articles cochés sur 12 au total

---

### 2. Gestion des articles

#### Ajouter un article

**Méthode 1 : Saisie manuelle**
1. Tapez le nom de l'article dans le champ principal
2. Appuyez sur **Entrée** ou cliquez sur **Ajouter**
3. L'article est automatiquement catégorisé

**Méthode 2 : Depuis les suggestions**
- Cliquez sur une des suggestions affichées sous le champ de saisie
- Les suggestions sont basées sur votre historique d'utilisation

**Méthode 3 : Depuis les favoris**
1. Cliquez sur l'icône **⭐** dans l'entête en haut à droite
2. Parcourez vos favoris groupés par catégorie
3. Cliquez sur un article pour l'ajouter instantanément
4. Un effet visuel confirme l'ajout
5. La modale reste ouverte pour ajouter plusieurs articles d'affilée

#### Modifier un article

1. Cliquez sur le **nom de l'article** dans la liste
2. Une fenêtre de modification s'ouvre
3. Vous pouvez modifier :
   - **Nom** : le nom de l'article
   - **Quantité** : ex: "2kg", "3 unités", "1 bouteille"
   - **Catégorie** : choisissez dans la liste déroulante
4. Cliquez sur **Enregistrer**

#### Cocher/décocher un article

- Cliquez sur le **cercle** à gauche de l'article
- Une légère vibration confirme l'action (sur appareils compatibles)
- L'article coché apparaît grisé et barré
- Les articles cochés descendent en bas de leur catégorie

#### Marquer comme favori

1. Cliquez sur l'étoile **★** à droite de l'article
2. L'étoile devient dorée **⭐**
3. L'article est ajouté à votre panneau de favoris
4. Le statut favori est synchronisé dans toutes les listes

#### Supprimer un article

**Méthode 1 : Bouton supprimer**
1. Cliquez sur l'icône **🗑️** à droite de l'article
2. Confirmez la suppression

**Méthode 2 : Effacer tous les articles cochés**
1. Cliquez sur l'icône **🗑️** dans l'entête en haut à droite
2. Confirmez pour supprimer tous les articles cochés de la liste active

---

### 3. Catégories

#### Catégories par défaut

L'application reconnaît automatiquement 12 catégories :

| Catégorie | Icône | Exemples d'articles |
|-----------|-------|---------------------|
| **Fruits** | 🍎 | pomme, banane, orange, fraise |
| **Légumes** | 🥬 | tomate, salade, carotte, courgette |
| **Viandes** | 🥩 | poulet, boeuf, porc, steak |
| **Poissons** | 🐟 | saumon, thon, crevette, moules |
| **Produits laitiers** | 🥛 | lait, yaourt, fromage, beurre, œufs |
| **Boulangerie** | 🥖 | pain, baguette, croissant, brioche |
| **Épicerie** | 🛍️ | riz, pâtes, farine, sucre, huile |
| **Surgelés** | ❄️ | pizza, glace, frites, légumes surgelés |
| **Boissons** | 🥤 | eau, jus, soda, vin |
| **Hygiène** | 🧴 | savon, shampoing, dentifrice |
| **Entretien** | 🧽 | lessive, liquide vaisselle, nettoyant |
| **Autre** | 📦 | tout ce qui ne correspond pas aux catégories ci-dessus |

#### Catégorisation automatique

L'application analyse le nom de chaque article et le place automatiquement dans la bonne catégorie en fonction de mots-clés :

- "Pommes" → Fruits 🍎
- "Pain" → Boulangerie 🥖
- "Lait" → Produits laitiers 🥛
- "Poulet" → Viandes 🥩

#### Replier/déplier une catégorie

1. Cliquez sur l'en-tête de la catégorie
2. La catégorie se replie pour économiser de l'espace
3. Cliquez à nouveau pour la déplier
4. Un compteur de progression est affiché : `2/4` (2 articles cochés sur 4 au total)

#### Réorganiser les catégories

**Sur ordinateur :**
1. Cliquez et maintenez sur l'icône **☰** (poignée) à gauche du nom de catégorie
2. Glissez la catégorie vers le haut ou le bas
3. Relâchez pour valider le nouvel ordre

**Sur mobile :**
1. Touchez et maintenez l'icône **☰**
2. Une légère vibration confirme la prise de la catégorie
3. Déplacez votre doigt vers le haut ou le bas
4. La catégorie se déplace en temps réel
5. Relâchez pour valider

L'ordre est sauvegardé automatiquement.

#### Gérer les catégories personnalisées

**Créer une nouvelle catégorie**
1. Ouvrez **⚙️ Paramètres**
2. Descendez jusqu'à la section **Catégories**
3. Cliquez sur **➕ Ajouter**
4. Entrez le nom de la catégorie (ex: "Bricolage", "Pharmacie")
5. Sélectionnez une icône dans la grille
6. Cliquez sur **Enregistrer**

**Modifier une catégorie**
1. Dans Paramètres > Catégories
2. Cliquez sur l'icône **✏️** à côté de la catégorie
3. Modifiez le nom et/ou l'icône
4. Cliquez sur **Enregistrer**

**Supprimer une catégorie**
1. Dans Paramètres > Catégories
2. Cliquez sur l'icône **🗑️** à côté de la catégorie
3. Confirmez la suppression
4. Les articles de cette catégorie sont déplacés vers "Autre"

**Note :** Les catégories par défaut ne peuvent pas être supprimées, mais leur icône peut être modifiée.

---

### 4. Système de favoris

#### Ajouter un article aux favoris

1. Dans votre liste, cliquez sur l'étoile **★** d'un article
2. L'étoile devient dorée **⭐**
3. L'article est ajouté au panneau de favoris
4. Le statut favori est partagé entre toutes vos listes

#### Utiliser le panneau de favoris

1. Cliquez sur l'icône **⭐** dans l'entête en haut à droite
2. Vos favoris sont groupés par catégorie
3. Cliquez sur une catégorie pour la déployer (accordion)
4. Cliquez sur un article pour l'ajouter à la liste active
5. Un effet visuel confirme l'ajout
6. Vous pouvez ajouter plusieurs favoris sans fermer la modale

#### Organisation des favoris

- Les favoris sont groupés par catégorie
- Une seule catégorie peut être déployée à la fois (comportement accordion)
- Le nombre total d'articles favoris est affiché : `Fruits (5)`
- L'ordre suit celui défini dans vos catégories

#### Retirer un article des favoris

1. Trouvez l'article dans n'importe quelle liste
2. Cliquez sur son étoile dorée **⭐**
3. L'étoile redevient grise **★**
4. L'article est retiré du panneau de favoris

---

### 5. Suggestions intelligentes

#### Comment fonctionnent les suggestions ?

L'application analyse votre historique d'utilisation et vous suggère les articles que vous achetez régulièrement.

**Caractéristiques :**
- Affichées sous le champ de saisie
- Maximum 5 suggestions
- Basées sur la fréquence d'utilisation
- N'affiche pas les articles déjà dans la liste active
- Mise à jour automatique à chaque ajout

#### Utiliser les suggestions

1. Les suggestions apparaissent sous le champ "Ajouter un article..."
2. Cliquez sur une suggestion pour l'ajouter instantanément
3. Le champ de saisie se vide automatiquement

---

### 6. Recherche

#### Rechercher un article

1. Utilisez le champ **🔍 Rechercher un article...** en haut
2. Tapez n'importe quel mot
3. La liste filtre automatiquement les résultats en temps réel
4. La recherche porte sur :
   - Le nom de l'article
   - La quantité

#### Effacer la recherche

- Supprimez le texte du champ de recherche
- Tous les articles réapparaissent

---

### 7. Partage et import de listes

#### Partager une liste

**Méthode 1 : Via les paramètres**
1. Ouvrez **⚙️ Paramètres**
2. Cliquez sur **📤** dans "Partager la liste"

**Étapes du partage :**
1. Un QR code est généré automatiquement : il contient un **lien direct**
2. L'autre personne le scanne avec l'appareil photo de son téléphone → l'application s'ouvre avec la fenêtre d'import
3. Vous pouvez aussi :
   - **📲 Partager…** : ouvre le menu de partage du téléphone (WhatsApp, SMS, email…)
   - **🔗 Copier le lien** : colle le lien où vous voulez
   - Copier le **code texte** (option avancée)

#### Importer une liste

**Méthode 1 : Depuis un QR code ou un lien**
1. Scannez le QR code avec l'appareil photo (ou ouvrez le lien reçu)
2. L'application s'ouvre directement avec la fenêtre d'import

**Méthode 2 : Depuis un lien ou un code collé**
1. Ouvrez **⚙️ Paramètres**
2. Cliquez sur **📥** dans "Importer une liste"
3. Collez le lien complet ou le code de partage dans le champ
4. Cliquez sur **Importer**

**Choisir le mode d'import :**

Trois options vous sont proposées :

**🔄 Remplacer**
- Supprime tous les articles de la liste actuelle
- Les remplace par les articles importés
- Le nom de la liste reste inchangé

**🔀 Fusionner**
- Ajoute les articles importés à la liste actuelle
- Les doublons sont évités (comparaison par nom)
- Le nom de la liste reste inchangé
- Idéal pour combiner deux listes

**➕ Nouvelle liste**
- Crée une nouvelle liste avec le nom et les articles importés
- Vos listes existantes restent intactes
- Vous basculez automatiquement sur la nouvelle liste

#### Gestion des catégories lors de l'import

L'application normalise intelligemment les catégories :
- Les catégories identiques sont fusionnées
- Les catégories inconnues sont placées dans "Autre"
- Les catégories personnalisées de l'expéditeur ne sont pas créées chez vous

---

### 8. Paramètres et personnalisation

#### Accéder aux paramètres

1. Cliquez sur l'icône **⚙️** dans l'entête en haut à droite
2. La fenêtre des paramètres s'ouvre

#### Accéder au manuel

1. Cliquez sur l'icône **📖** dans l'entête en haut à droite
2. Le manuel utilisateur interactif s'ouvre dans un nouvel onglet

#### Mode sombre

**Activer/désactiver :**
1. Paramètres > **Mode sombre**
2. Cliquez sur l'interrupteur
3. Le thème change instantanément

**Caractéristiques :**
- Fond noir pour réduire la fatigue oculaire
- Économie de batterie sur écrans OLED
- Préférence sauvegardée automatiquement

#### Masquer les articles cochés

**Activer/désactiver :**
1. Paramètres > **Masquer articles cochés**
2. Cliquez sur l'interrupteur
3. Les articles cochés disparaissent de la vue

**Utilité :**
- Concentrez-vous uniquement sur ce qu'il reste à acheter
- Gagnez de la place à l'écran
- Les articles restent dans la liste, juste cachés

#### Taille de police

**Ajuster la taille :**
1. Paramètres > **Taille de police**
2. Cliquez sur **A-** pour réduire
3. Cliquez sur **A+** pour augmenter
4. La taille varie de 80% à 150%
5. La taille actuelle est affichée au centre

**Cas d'usage :**
- Vision réduite : augmentez à 130-150%
- Petits écrans : réduisez à 80-90%
- Par défaut : 100%

---

### 9. Réinitialisation de l'application

**ATTENTION : Cette action est irréversible !**

#### Quand réinitialiser ?

- Pour repartir à zéro
- En cas de problème technique
- Pour donner l'appareil à quelqu'un d'autre

#### Procédure de réinitialisation

1. Ouvrez **⚙️ Paramètres**
2. Descendez jusqu'à **Zone de danger** (en rouge)
3. Cliquez sur **🔄 Réinitialiser l'application**
4. Lisez attentivement l'avertissement
5. Confirmez une première fois
6. Confirmez une seconde fois
7. L'application redémarre avec les données par défaut

#### Données supprimées

La réinitialisation supprime :
- Toutes vos listes de courses
- Tous vos articles
- Tous vos favoris
- Toutes vos catégories personnalisées
- Tous vos paramètres
- Votre historique pour les suggestions

---

## Nouveautés v3

### 💶 Prix et budget

Vous pouvez maintenant attribuer un **prix optionnel** à chaque article et suivre votre budget en temps réel.

**Ajouter un prix à un article :**
1. Cliquez sur l'article (ou faites un appui long sur mobile) pour ouvrir le mode édition
2. Renseignez le champ **Prix (€)** — la virgule et le point décimal sont acceptés (ex: `2,50` ou `2.50`)
3. Validez avec **Enregistrer**

**Affichage :**
- Le prix s'affiche à côté de la quantité, en vert
- Une **barre de totaux** apparaît en bas de l'écran dès qu'au moins un article a un prix :
  - **Reste à payer** : somme des articles non cochés
  - **Total** : somme totale, avec une indication du nombre d'articles sans prix

**Bon à savoir :**
- Le prix est **optionnel** : laissez vide si vous ne souhaitez pas budgéter
- Les prix sont inclus dans le partage QR code (si l'autre appareil a une version récente)
- Aucun calcul fiscal, juste une estimation

### 🎤 Saisie vocale

Si votre navigateur supporte l'API Web Speech (Chrome, Edge, Safari récent), un bouton **🎤** apparaît à côté du champ d'ajout.

**Utilisation :**
1. Appuyez sur le bouton micro
2. Le bouton devient rouge et pulse
3. Dictez le nom de l'article (en français)
4. L'article est automatiquement ajouté à la liste active

**Astuce :** Utile en cuisine, en voiture, ou les mains pleines. La reconnaissance fonctionne mieux dans un environnement calme.

**Erreurs possibles :**
- Si la reconnaissance échoue, un toast d'erreur apparaît
- Sur Firefox desktop ou Safari iOS ancien, le bouton n'apparaît pas du tout (API non supportée)

### 🛒 Mode supermarché

Un mode plein-écran épuré, conçu pour faire les courses au magasin.

**Activation :** bouton **🛒** dans le header.

**Caractéristiques :**
- Header, recherche et formulaire d'ajout masqués
- Articles plus grands, **checkboxes plus larges** (plus faciles à toucher)
- Articles cochés à 45 % d'opacité (pour suivre où vous en êtes)
- Boutons d'édition / suppression / favoris masqués (focus sur l'action de cocher)
- Drag handles et boutons de repli des catégories masqués

**Sortie :** bouton **✕ Quitter mode courses** flottant en haut à droite.

### ↩️ Annuler une suppression

Quand vous supprimez un article (icône 🗑️), il n'y a plus de confirmation : la suppression est immédiate, mais un **toast** apparaît pendant 5 secondes en bas de l'écran avec un bouton **Annuler** :

> "Pommes" supprimé — **[Annuler]**

Cliquer sur **Annuler** restaure l'article à sa position d'origine. C'est aussi le cas pour la suppression en masse via 🗑️ "Effacer cochés" du header.

### ⌨️ Raccourcis clavier

| Raccourci | Action |
|---|---|
| `Ctrl` + `K` (ou `Cmd` + `K` sur Mac) | Place le curseur sur le champ de recherche |
| `/` | Place le curseur sur le champ d'ajout d'article |
| `Esc` | Ferme la modale ouverte, ou vide la recherche si remplie |
| `?` | Affiche / masque la fenêtre d'aide raccourcis |
| `Enter` | Valide le champ courant (ajout, recherche, modale, etc.) |

L'aide raccourcis est aussi accessible à tout moment via la touche `?`.

### 🔍 Recherche améliorée

- Les correspondances sont **surlignées en jaune** dans les noms et quantités d'articles
- Un bouton **✕** apparaît dans la barre de recherche dès qu'un terme est saisi pour vider d'un clic
- `Esc` vide aussi la recherche si elle n'est pas vide

### ⋮ Menu visible sur les onglets

Plus besoin de découvrir le clic droit ou l'appui long : un bouton **⋮** est désormais visible directement sur chaque onglet de liste pour accéder aux actions Renommer / Dupliquer / Supprimer. (L'appui long et le clic droit restent disponibles.)

---

## Accessibilité

L'application a été retravaillée pour être utilisable au clavier et avec un lecteur d'écran (NVDA, VoiceOver, JAWS, TalkBack).

### Navigation clavier
- **Tab** parcourt les éléments interactifs dans un ordre logique
- **Enter** / **Espace** activent les boutons et toggles
- Dans une modale, le focus est **piégé** : Tab et Shift+Tab restent dans la modale
- Escape ferme la modale et **rend le focus à l'élément qui l'avait avant l'ouverture**
- Outline visible (vert + halo) sur tout élément focusé au clavier
- Skip-link "Aller au contenu" en début de page (visible uniquement au focus clavier)

### Lecteur d'écran
- Tous les boutons icône ont un `aria-label` en français
- Les modales ont `role="dialog"`, `aria-modal="true"` et un titre annoncé
- Les onglets de listes utilisent `role="tab"` / `aria-selected`
- Les toggles (mode sombre, masquer cochés) utilisent `role="switch"` / `aria-checked`
- La liste d'articles est un conteneur `aria-live="polite"` : les changements sont annoncés
- Les toasts sont annoncés via un conteneur `aria-live="polite"`

### Zoom
- Le **pinch-zoom utilisateur est autorisé** (la balise `maximum-scale=1.0` qui le bloquait a été retirée pour respecter WCAG 1.4.4)
- La taille de police est ajustable de 80 % à 150 % via les paramètres

### Contrastes
- Les couleurs respectent WCAG AA en mode clair et en mode sombre

---

## Astuces et bonnes pratiques

### Organisation optimale

**1. Créez des listes thématiques**
- Courses hebdomadaires
- Pharmacie
- Bricolage
- Liste de Noël
- Fournitures scolaires

**2. Utilisez les favoris intelligemment**
- Ajoutez vos articles de base (pain, lait, œufs...)
- Gardez 15-20 favoris maximum pour un accès rapide
- Organisez-les en utilisant les bonnes catégories

**3. Profitez de la catégorisation**
- L'ordre des catégories peut correspondre au parcours dans votre magasin
- Réorganisez les catégories par glisser-déposer
- Repliez les catégories vides pour gagner de la place

### Productivité

**1. Raccourcis clavier (ordinateur)**
- **Entrée** : Ajouter un article
- **Tab** : Naviguer entre les champs

**2. Workflow efficace**
1. Ouvrez l'app au début de la semaine
2. Ajoutez vos articles depuis les favoris
3. Complétez avec des articles ponctuels
4. Cochez au fur et à mesure de vos achats
5. Effacez les articles cochés en fin de courses

**3. Partage familial**
- Une personne crée la liste
- Partage via QR code
- Les autres membres importent et fusionnent
- Chacun peut ajouter ses besoins

### Retour haptique (vibrations)

**Fonctionnement :**
L'application utilise de légères vibrations (50ms) pour confirmer certaines actions importantes :

**Interactions concernées :**
1. **Appui long sur une liste** : Vibration après 500ms pour confirmer l'ouverture du menu
2. **Appui long sur un article** : Vibration après 500ms pour confirmer l'ouverture de l'édition
3. **Validation d'un article** : Vibration à chaque fois que vous cochez/décochez un article
4. **Glisser-déposer de catégories** : Vibration quand vous saisissez la poignée ☰

**Compatibilité :**
- iOS Safari 13+ (iPhone, iPad)
- Chrome Android 32+
- Firefox Android 16+
- Non supporté sur ordinateurs (sauf certains PC tactiles)

**Note :** Si votre appareil ne supporte pas les vibrations, l'application fonctionne normalement sans vibrations.

### Utilisation hors ligne

**L'application fonctionne 100% offline après installation :**
- Aucune connexion Internet requise
- Toutes les fonctionnalités disponibles
- Données sauvegardées localement
- Idéal en magasin sans réseau

**Limites du mode offline :**
- Le partage via QR code nécessite Internet pour scanner (selon l'app de scan)
- Le code peut être copié-collé sans Internet

### Sauvegarde de vos données

**Important :** Vos données sont stockées uniquement sur votre appareil.

**Pour sauvegarder manuellement :**
1. Partagez chaque liste importante
2. Copiez le code de partage
3. Sauvegardez-le dans un fichier texte ou email

**Pour restaurer :**
1. Réinstallez l'application si nécessaire
2. Importez chaque code sauvegardé
3. Utilisez l'option "Nouvelle liste"

---

## Résolution de problèmes

### L'application ne se charge pas

**Solutions :**
1. Vérifiez que JavaScript est activé dans votre navigateur
2. Essayez un autre navigateur (Chrome, Firefox, Safari)
3. Videz le cache de votre navigateur
4. Réinstallez l'application

### Mes données ont disparu

**Causes possibles :**
- Navigation privée : les données sont effacées à la fermeture
- Nettoyage du cache/cookies
- Désinstallation de l'app

**Solutions :**
- Utilisez toujours le mode normal (pas privé)
- Sauvegardez régulièrement via les codes de partage
- Ne nettoyez pas les données du site

### La catégorisation automatique ne fonctionne pas bien

**Solutions :**
1. Ajoutez l'article à la liste
2. Cliquez sur le nom pour éditer
3. Changez manuellement la catégorie
4. La prochaine fois, utilisez le même nom exact pour conserver la catégorie

**Alternative :**
- Créez une catégorie personnalisée avec vos propres mots-clés (fonctionnalité avancée)

### Le QR code ne se génère pas

**Causes :**
- La bibliothèque QRCode.js n'est pas chargée
- Connexion Internet requise au premier chargement

**Solutions :**
1. Vérifiez votre connexion Internet
2. Rechargez la page
3. Utilisez le code texte à la place (fonctionne toujours)

### L'application est lente

**Solutions :**
1. Réduisez le nombre d'articles dans vos listes
2. Supprimez les listes inutilisées
3. Effacez régulièrement les articles cochés
4. Réinitialisez l'application si nécessaire

### Je ne peux pas installer l'app sur mon téléphone

**iOS :**
- Utilisez obligatoirement Safari (pas Chrome)
- Assurez-vous d'être sur iOS 14 ou supérieur

**Android :**
- Utilisez Chrome ou un navigateur basé sur Chromium
- Certains navigateurs ne supportent pas les PWA

### Les favoris ne se synchronisent pas entre les listes

**C'est normal :**
- Le statut favori (⭐) est global et synchronisé
- Mais chaque liste a ses propres articles
- Marquer un article favori dans une liste le rend favori partout

### L'import échoue

**Vérifications :**
1. Le code est-il complet ? (pas de coupure)
2. Avez-vous copié tout le code ?
3. Le code provient-il bien de cette application ?
4. Essayez de copier-coller à nouveau

### Je veux récupérer une liste supprimée

**Malheureusement :**
- La suppression est définitive
- Aucune corbeille ou historique
- Solution : sauvegardez régulièrement vos listes importantes via le partage

### Les vibrations ne fonctionnent pas

**Causes possibles :**

1. **Appareil non compatible**
   - Les vibrations ne sont pas supportées sur tous les appareils
   - Les ordinateurs de bureau ne vibrent généralement pas
   - Vérifiez la liste de compatibilité dans la section [Retour haptique](#retour-haptique-vibrations)

2. **Mode silencieux activé (iOS)**
   - Sur iPhone/iPad, le mode silencieux peut désactiver les vibrations dans certaines apps
   - Essayez de désactiver le mode silencieux

3. **Vibrations désactivées dans les paramètres système**
   - Android : Paramètres > Sons et vibrations > Intensité des vibrations
   - iOS : Réglages > Sons et vibrations

4. **Navigateur non compatible**
   - iOS : utilisez Safari (Chrome iOS ne supporte pas l'API Vibration)
   - Android : utilisez Chrome ou Firefox
   - Desktop : non supporté sur la plupart des navigateurs

**Note :** L'absence de vibrations n'affecte pas le fonctionnement de l'application. Toutes les fonctionnalités restent disponibles.

---

## Besoin d'aide ?

### Support
- Consultez le fichier [README.md](README.md) pour les informations techniques
- Vérifiez la section [Résolution de problèmes](#résolution-de-problèmes)

### Contribuer
Cette application est open source. N'hésitez pas à :
- Signaler des bugs
- Suggérer des améliorations
- Partager vos retours d'expérience

---

**Version du manuel :** 1.1
**Dernière mise à jour :** 2025-01-09
**Application :** Ma Liste de Courses v2.1
