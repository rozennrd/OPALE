# OPALE Front (v1.8.5.1)

Interface web du projet **OPALE**, développée en **React** avec **Vite**.  
Objectif : piloter la génération d’un planning **macro** annuel et des vues **micro** par promotion et par enseignant.

> ⚠️ Portée actuelle : **front uniquement** — toute action côté back est simulée via `console.log()`.

---

# 🚀 Installation

Prérequis recommandés : **Node 18+** et **npm 9+**.

Cloner le dépôt :

```bash
git clone https://github.com/AlexisMtksJunia/OPALE-Front.git
cd OPALE-Front
```

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de dev :

```bash
npm run dev
```

Application disponible sur : **http://localhost:5173**

---

# 🧭 Routing

Le projet utilise **react-router-dom** (routing minimal) :

- `/planning` — Génération du planning **macro**
- `/promotions` — Gestion des cycles et promotions (CRUD local + contraintes académiques)
- `/enseignants` — Liste des enseignants + détail + disponibilités
- `/evenements`, `/salles`, `/parametres` — placeholders
- `/` → redirection vers `/planning`
- Non trouvé → page 404 (placeholder)

---

# ✨ **Nouveautés des versions 1.8.5.1**

Cette version poursuit le travail engagé en 1.8.x : **extension fonctionnelle + consolidation du design system**, ainsi que l’arrivée de la page Matières.

---

## 🧩 **1. Nouvelle page Matières**

### ✔ Page Matières complète

*   Liste des matières **groupées par promotion**
*   Recherche par nom
*   Filtres :
    *   semestre
    *   cycle
    *   promotion
    *   enseignant (préparation à la vue micro)
*   Affichage du **volume horaire total par promotion**


### ✔ Card matière moderne (alignée Rooms / Teachers / Events)

*   Header unifié (badge + couleur)
*   Layout **2 colonnes**
*   Dark mode natif
*   Responsive

---

## 🏫 **2. Nouvelle MatiereDetailCard**

### Structure

*   **Colonne gauche**
    *   nom de la matière
    *   volume total
    *   volume TD / TP

*   **Colonne droite**
    *   affectation d’un ou plusieurs enseignants
    *   distinction TD / TP
    *   saisie du nombre d’heures par enseignant


### Comportements

*   gestion du dirty-state
*   confirmation avant fermeture
*   support ESC / overlay / bouton ✕
*   footer unifié (DetailCardFooter)

---

## 🎨 **3. Mutualisation RoomDetailCard / MatiereDetailCard*

### Nouveau layout générique

Introduction d’un **layout de card détail mutualisé** :
```css
.detail-layout
.detail-main-column
.detail-aside-column
```

### Bénéfices

*   même structure visuelle pour :
    *   Rooms
    *   Matières
*   override par page possible (largeur, gap, ratio)
*   suppression de la dépendance métier dans les layouts (room-\*)

---

## 📆 **4. Design system renforcé**

*   espacement configurable par card (ex: Matière > Room)
*   boutons et chips **compatibles dark mode**
*   clarification des responsabilités CSS :
    *   layout générique
    *   styles métiers
    *   overrides par page

---

### 🏗️ **4. Architecture stabilisée**

*   espacement configurable par card (ex: Matière > Room)
*   boutons et chips **compatibles dark mode**
*   clarification des responsabilités CSS :
    *   layout générique 
    *   styles métiers 
    *   overrides par page

---

## ⭐ **Résumé des apports de 1.8.4.2**

| Domaine      | Améliorations                                              |
| ------------ | ---------------------------------------------------------- |
| UI           | unification complète modales + cards                       |
| UX           | comportements cohérents (focus, ESC, overlay, dirty state) |
| Architecture | composants transverses, factorisation, structure modulable |
| CSS          | réduction, homogénéisation, dark mode propre               |
| Fonctionnel  | Refonte RoomDetailCard + perfectionnement EventDetailCard  |


# 📂 Structure du projet (mise à jour v1.8)

```
src/
├── App.tsx
├── assets
│   ├── events
│   │   ├── ic-event-conference.png
│   │   ├── ic-event-exam.png
│   │   ├── ic-event-forum.png
│   │   ├── ic-event-jpo.png
│   │   ├── ic-event-other.png
│   │   └── ic-event-salon.png
│   ├── ic-event-conference.png
│   ├── ic-event-exam.png
│   ├── ic-event-forum.png
│   ├── ic-event-jpo.png
│   ├── ic-event-other.png
│   ├── ic-event-salon.png
│   ├── ic-modif.png
│   ├── ic-moins.png
│   ├── ic-plus.png
│   ├── ic-search.png
│   ├── ic-tel.png
│   ├── ic-user.png
│   ├── ic-warning.png
│   ├── logo
│   │   ├── logo-compact.png
│   │   └── logo-full.png
│   ├── mode
│   │   ├── ic-mode-distanciel.png
│   │   ├── ic-mode-hybride.png
│   │   └── ic-mode-presentiel.png
│   ├── rooms
│   │   ├── ic-room-autre.png
│   │   ├── ic-room-projet.png
│   │   ├── ic-room-td.png
│   │   ├── ic-room-tp-electronique.png
│   │   └── ic-room-tp-numerique.png
│   └── sidebar
│       ├── ic-contact.png
│       ├── ic-events.png
│       ├── ic-logout.png
│       ├── ic-matieres.png
│       ├── ic-para.png
│       ├── ic-planning.png
│       ├── ic-profs.png
│       ├── ic-promos.png
│       └── ic-salles.png
├── components
│   ├── Checklist.tsx
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   ├── common
│   │   ├── ActionButtonsWithConfirm.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DateRangePill.tsx
│   │   ├── DetailCardBody.tsx
│   │   ├── DetailCardFooter.tsx
│   │   ├── DetailCardHeader.tsx
│   │   ├── EntityBadge.tsx
│   │   ├── EntityCard.tsx
│   │   ├── PageHeader.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── Toolbar.tsx
│   │   └── ToolbarSearch.tsx
│   ├── events
│   │   ├── EventCard.tsx
│   │   ├── EventDetailCard.tsx
│   │   ├── EventTypeBadge.tsx
│   │   ├── EventsSection.tsx
│   │   └── EventsToolbar.tsx
│   ├── matieres
│   │   ├── MatiereBadge.tsx
│   │   ├── MatiereCard.tsx
│   │   ├── MatiereDetailCard.tsx
│   │   ├── MatiereSection.tsx
│   │   └── MatieresToolbar.tsx
│   ├── promotions
│   │   ├── PromoAdjustDialog.tsx
│   │   ├── PromoEditDialog.tsx
│   │   ├── constraints
│   │   │   ├── ConstraintCard.tsx
│   │   │   ├── ConstraintPill.tsx
│   │   │   └── ConstraintsSection.tsx
│   │   ├── cycles
│   │   │   ├── CycleCard.tsx
│   │   │   └── CycleImportDropZone.tsx
│   │   └── sections
│   │       ├── PromoGroups.tsx
│   │       ├── PromoMainInfo.tsx
│   │       └── PromoSpecialties.tsx
│   ├── rooms
│   │   ├── RoomCard.tsx
│   │   ├── RoomDetailCard.tsx
│   │   ├── RoomTypeBadge.tsx
│   │   └── RoomsSection.tsx
│   └── teachers
│       ├── TeacherCard.tsx
│       ├── TeacherCardsGrid.tsx
│       ├── TeacherDetailCard.tsx
│       ├── TeacherModeBadge.tsx
│       ├── TeacherSection.tsx
│       ├── TeachersToolbar.tsx
│       └── section
│           ├── TeacherAvailabilityColumn.tsx
│           ├── TeacherInfoColumn.tsx
│           └── TeacherSubjectsColumn.tsx
├── constants
│   └── tokenStorage.ts
├── hooks
│   ├── common
│   │   ├── useDetailDirtyClose.ts
│   │   └── useDetailEscapeClose.ts
│   ├── events
│   │   └── useEventDetail.ts
│   ├── promotions
│   │   ├── index.ts
│   │   ├── usePromotionAdjustPopup.ts
│   │   ├── usePromotionConstraints.ts
│   │   ├── usePromotionCycles.ts
│   │   └── usePromotionEditing.ts
│   ├── teachers
│   │   └── useTeacherDetail.ts
│   └── useTheme.ts
├── main.tsx
├── mocks
│   ├── events.mock.ts
│   ├── matieres.mock.ts
│   ├── promotionCycles.mock.ts
│   └── rooms.mock.ts
├── models
│   ├── CampusEvent.ts
│   ├── Constraints.ts
│   ├── Cycle.ts
│   ├── DateRange.ts
│   ├── GroupSpecialtyItem.ts
│   ├── Matiere.ts
│   ├── Promotion.ts
│   ├── Room.ts
│   ├── Teachers.ts
│   ├── Theme.ts
│   └── index.ts
├── pages
│   ├── Events.tsx
│   ├── Login.tsx
│   ├── Matieres.tsx
│   ├── Placeholder.tsx
│   ├── Planning.tsx
│   ├── Promotions.tsx
│   ├── Rooms.tsx
│   └── Teachers.tsx
├── services
│   ├── api
│   │   ├── coursesApi.ts
│   │   ├── edtApi.ts
│   │   ├── maquetteApi.ts
│   │   ├── professorsApi.ts
│   │   ├── promotionsApi.ts
│   │   └── roomsApi.ts
│   └── base
│       ├── ApiClient.ts
│       ├── AuthService.ts
│       └── types.ts
├── styles
│   ├── base.css
│   ├── components
│   │   ├── _action-buttons.css
│   │   ├── _buttons.css
│   │   ├── _checklist.css
│   │   ├── _confirm-dialog.css
│   │   ├── _date-range-pill.css
│   │   ├── _detail-card-footer.css
│   │   ├── _detail-card-header.css
│   │   ├── _detail-card-layout.css
│   │   ├── _detail-card-shell.css
│   │   ├── _entity-badge.css
│   │   ├── _entity-card.css
│   │   ├── _nav-links.css
│   │   ├── _page-header.css
│   │   ├── _section-header.css
│   │   ├── _theme-toggle.css
│   │   └── _toolbar.css
│   ├── components.css
│   ├── layout.css
│   ├── pages
│   │   ├── events
│   │   │   ├── _cards.css
│   │   │   ├── _detail-modal.css
│   │   │   ├── _layout.css
│   │   │   ├── _sections.css
│   │   │   ├── _toolbar.css
│   │   │   └── index.css
│   │   ├── login
│   │   │   └── login-page.css
│   │   ├── matieres
│   │   │   ├── _cards.css
│   │   │   ├── _detail-modal.css
│   │   │   ├── _layout.css
│   │   │   ├── _toolbar.css
│   │   │   └── index.css
│   │   ├── promotions
│   │   │   ├── _adjust-popup.css
│   │   │   ├── _edit-modal.css
│   │   │   ├── _layout.css
│   │   │   ├── _lists.css
│   │   │   ├── _promo-row.css
│   │   │   └── index.css
│   │   ├── rooms
│   │   │   ├── _cards.css
│   │   │   ├── _detail-modal.css
│   │   │   ├── _layout.css
│   │   │   ├── _sections.css
│   │   │   └── index.css
│   │   └── teachers
│   │       ├── _availability.css
│   │       ├── _cards.css
│   │       ├── _detail-modal.css
│   │       ├── _layout.css
│   │       ├── _sections.css
│   │       ├── _toolbar.css
│   │       └── index.css
│   ├── themes
│   │   └── dark.css
│   ├── tokens.css
│   └── utilities.css
├── utils
│   └── promoUtils.ts
└── vite-env.d.ts
```

---

# ✨ Fonctionnalités actuelles (**v1.8.5.1**)

## 🧭 **Structure générale**

* ✔ **Sidebar responsive**
* ✔ **Thème clair / sombre** (persistant)
* ✔ **Routing complet**
  Pages : Planning, Promotions, Enseignants, Événements, Salles

---

## 📅 **Planning Macro**

* Gestion des checklists et prérequis
* Interface unifiée avec tokens et dark mode

---

## 🎓 **Promotions**

* Gestion complète :

  * cycles
  * groupes
  * matières
  * contraintes académiques (5 catégories)
* Modales d’édition + ajustements automatiques
* Drag & Drop Excel (v1.8.2)
* Refactorisation des cartes et des hooks

---

## 👨‍🏫 **Enseignants**

* Liste des enseignants (carte moderne)
* **TeacherDetailCard** complète :

  * informations personnelles
  * matières
  * disponibilités avancées
  * gestion des périodes
* UI unifiée (inputs, pills, badges)
* Dark mode propre

---

## 🏫 **Salles**

* Page de gestion des salles
* **Refonte totale de la RoomDetailCard (v1.8.4.2)** :
  * layout 2 colonnes
  * type principal + types disponibles
  * description étirable
  * footer unifié (actions)

---

## 🏫 **Matières**

* Page de gestion des matières :
    * layout 2 colonnes
    * Volume horaires
    * Affectations des enseignants
    * footer unifié (actions)

---

## 📆 **Événements** *(nouveauté 1.8.4.1 / 1.8.4.2)*

* Page Événements complète :

  * recherche
  * filtres (type, cible, dates)
  * regroupement automatique par mois et année
* **EventDetailCard** :

  * édition complète
  * header unifié
  * description
  * création d’événement (flow “+”)

---

## 🧩 **Composants communs & factorisation (v1.8.2 → v1.8.4.2)**

### Composants transverses

* ✔ **DateRangePill**
* ✔ **ConfirmDialog**
* ✔ **ActionButtonsWithConfirm**
* ✔ **Header Pills (badges unifiés)**
* ✔ **SectionHeader** (collapsable dans Événements)

### Unification globale

* Inputs cohérents
* Pills cohérentes (radio/checkbox)
* Comportements modaux identiques (ESC, overlay, closable)
* Footer standard pour toutes les cards détail
* CSS factorisé (cards, badges, modales, toolbars)

---

## 🧱 **Architecture & Code**

* Séparation logique via hooks (`useEventDetail`, `useRoomDetail`, `useTeacherDetail`, …)
* Réduction massive du CSS dupliqué
* Réorganisation des assets (1.8.4.0)
* Structure des pages alignée Teachers / Rooms / Events
* Base solide pour la future **vue micro** et les futures entités

---

# ⭐ Résumé

La version **1.8.5.1** marque une **extension fonctionnelle majeure** du front OPALE avec l’arrivée de la **page Matières**, tout en consolidant le travail d’unification engagé en 1.8.x.

Elle renforce le projet en le rendant :

* plus **complet** (gestion des matières et des volumes horaires)
* plus **structuré** (mutualisation du layout des fiches détail)
* plus **cohérent** (Rooms et Matières reposent sur une base commune)
* plus **scalable** (préparation des futures vues micro et croisements métiers)

Cette version confirme la maturité du **design system** et pose des fondations solides pour l’évolution fonctionnelle du projet.

---

## 🛠️ Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm run preview` — prévisualiser la build
- `npm run lint` — ESLint

---

## 📌 Technologies

- React
- Vite
- react-router-dom
- JavaScript (ES2022)
- CSS moderne (layers, tokens)

---

## 🧑‍💻 Conventions Git & Versioning

Fidèle aux priorités du projet :

- **Commit lint : Conventional Commits**
- **Branches :**
  - `master` = stable
  - `feat/*`, `fix/*`, `refactor/*`, …
- **Versioning : SemVer**
  - v1.7 = refacto majeure Promotions + système complet des contraintes

---

## 🗺️ Roadmap (extraits)

- Vue micro par promotion
- Événements campus
- Amélioration accessibilité
- Intégration backend future

---

💡 Projet développé dans le cadre d’AP5 à Junia.