# OPALE Front

Application web du projet OPALE, développée avec React et Vite.
Elle fournit l'interface de gestion du planning macro, des promotions, des enseignants, des salles, des matières, des événements, des paramètres utilisateur et de la documentation intégrée.

## Objectif

Le front a pour rôle de :

- authentifier l'utilisateur ;
- afficher les données métier provenant du backend ;
- permettre la consultation et l'édition des entités principales ;
- lancer certaines actions de génération et d'import ;
- proposer une interface unifiée avec theming et options d'accessibilité.

## Stack technique

- React 19
- Vite 7
- React Router DOM 7
- JavaScript + TypeScript
- ESLint 9
- CSS structuré par tokens, composants, pages et thèmes

## Prérequis

- Node.js 20 recommandé
- npm 10 recommandé

Vérification rapide :

```bash
node -v
npm -v
```

## Installation

Depuis le dossier `Opale.Front` :

```bash
npm install
```

## Lancement en local

```bash
npm run dev
```

Le serveur Vite démarre par défaut sur :

```text
http://localhost:5173
```

Le serveur est configuré pour écouter sur `0.0.0.0`, ce qui facilite l'utilisation en conteneur Docker ou sur le réseau local.

## Build de production

```bash
npm run build
```

Les fichiers générés sont produits dans le dossier `dist/`.

Pour prévisualiser la build :

```bash
npm run preview
```

## Scripts disponibles

- `npm run dev` : démarre le serveur de développement Vite.
- `npm run build` : génère la version de production.
- `npm run preview` : sert localement la build de production.
- `npm run lint` : lance ESLint sur l'ensemble du projet.

## Configuration

La principale variable d'environnement attendue est :

- `VITE_RACINE_FETCHER_URL` : URL de base du backend.

Si elle n'est pas définie, le client API utilise par défaut :

```text
http://localhost:3000
```

Exemple de fichier `.env` :

```env
VITE_RACINE_FETCHER_URL=http://localhost:3000
```

## Authentification

Le front propose une page de connexion sur `/login`.

Fonctionnement actuel :

- le mot de passe est haché en SHA-256 côté client avant l'appel au backend ;
- l'endpoint `/login` renvoie un JWT ;
- le token est stocké dans le `localStorage` sous la clé `authToken` ;
- les appels API ajoutent automatiquement l'en-tête `x-access-token` ;
- en cas de token absent, invalide ou expiré, l'utilisateur est redirigé vers `/login`.

## Pages et routes principales

- `/login` : connexion.
- `/planning` : pilotage du planning macro.
- `/promotions` : gestion des cycles, promotions, groupes et contraintes.
- `/evenements` : consultation et édition des événements.
- `/teachers` : gestion des enseignants.
- `/salles` : gestion des salles.
- `/matieres` : gestion des matières.
- `/parametres` : préférences utilisateur, theming et options d'interface.
- `/documentation` : documentation intégrée à l'application.
- `/` : redirection vers `/planning`.

<h2>Contenu fonctionnel des pages</h2>

Pour chaque page, les fonctionnalités sont regroupées par catégorie afin de faciliter la lecture :

- **Contenu** : ce que l'utilisateur voit sur la page.
- **Actions / Gestion** : ce qu'il peut faire.
- **Recherche et filtres** : les moyens de retrouver ou de restreindre les données.
- **Import / Persistance** : les actions d'import, de sauvegarde ou de synchronisation.
- **Lien backend** : la relation avec l'API et la base de données.
- **Point actuel** : limites connues ou fonctionnalités encore dépendantes du backend.

<h3>Login</h3>

<u><strong>Interface</strong></u>

- saisir son identifiant et son mot de passe ;
- utiliser le thème visuel disponible sur l'écran de connexion.

<u><strong>Actions</strong></u>

- se connecter à l'application ;
- voir un message d'erreur si l'authentification échoue.

<h3>Planning</h3>

La page `Planning` est organisée en deux colonnes : `Macro` et `Micro`.

<u><strong>Contenu</strong></u>

- des checklists de prérequis regroupées par section ;
- des points de contrôle sur les promotions, les dates, les événements, les enseignants, les salles et les matières ;
- un indicateur de cohérence sur certaines données de promotions.

<u><strong>Actions</strong></u>

- cocher les prérequis préparés ;
- générer le planning macro ;
- télécharger le fichier du planning macro généré ;
- consulter l'état de la zone micro.

<u><strong>Lien backend</strong></u>

- la génération macro appelle le backend ;
- le fichier Excel généré est récupéré depuis le backend ;
- cette page s'appuie sur l'état des données déjà enregistrées dans la base de données.

> <u><strong>Point actuel</strong></u>
>
> - la génération du planning micro est affichée, mais n'est pas encore disponible.

<h3>Promotions</h3>

La page `Promotions` centralise la gestion de la structure pédagogique.

<u><strong>Contenu</strong></u>

- la liste des cycles ;
- les promotions rattachées à chaque cycle ;
- les groupes et spécialités d'une promotion ;
- les contraintes académiques associées ;
- une zone d'import de maquettes Excel par cycle ;
- une prévisualisation des fichiers avant import ;
- une étape de correspondance des spécialités détectées avant l'import final.

<u><strong>Gestion des cycles et promotions</strong></u>

- créer un cycle ;
- renommer ou supprimer un cycle ;
- ajouter ou supprimer une promotion dans un cycle ;
- ouvrir une fiche d'édition d'une promotion ;
- modifier les informations principales d'une promotion ;
- ajouter, modifier ou supprimer des groupes ;
- ajouter, modifier ou supprimer des spécialités ;
- ajuster les effectifs ;
- ajouter, modifier ou supprimer des contraintes.

<u><strong>Import de maquettes</strong></u>

- déposer un ou plusieurs fichiers Excel de maquette ;
- analyser une maquette avant import ;
- prévisualiser les promotions, les semestres, les matières, les volumes et les avertissements détectés ;
- naviguer dans la prévisualisation par promotion ;
- associer les spécialités détectées aux spécialités existantes ;
- lancer l'import des maquettes.

<u><strong>Persistance</strong></u>

- sauvegarder les changements vers le backend.

<u><strong>Lien backend</strong></u>

- la création, la modification et la suppression des cycles, promotions, groupes, spécialités et contraintes sont reliées au backend ;
- les imports de maquettes appellent le backend pour l'analyse, puis pour l'import ;
- les actions de cette page mettent à jour la base de données.

<h3>Enseignants</h3>

La page `Enseignants` propose une vue de gestion complète du corps enseignant.

<u><strong>Contenu</strong></u>

- des listes d'enseignants regroupées par catégorie ;
- une barre d'outils avec recherche et filtres ;
- des filtres par mode d'enseignement, promotion, matière et plage de dates ;
- une fiche détaillée d'un enseignant.

<u><strong>Recherche et filtres</strong></u>

- rechercher un enseignant par nom ;
- filtrer les listes.

<u><strong>Gestion</strong></u>

- créer un enseignant ;
- ouvrir une fiche enseignant ;
- modifier ses informations principales ;
- consulter et éditer ses matières ;
- consulter et éditer ses disponibilités ;
- supprimer un enseignant ;
- activer une sélection multiple pour une suppression en lot.

<u><strong>Lien backend</strong></u>

- les données enseignants, disponibilités, enseignements et matières sont chargées depuis le backend ;
- la création, la modification et la suppression des enseignants sont reliées au backend ;
- les actions de cette page mettent à jour la base de données.

<h3>Salles</h3>

La page `Salles` présente les salles par étage.

<u><strong>Contenu</strong></u>

- une barre d'outils avec recherche et filtres ;
- des regroupements par étage ;
- une fiche détaillée pour chaque salle.

<u><strong>Recherche et filtres</strong></u>

- rechercher une salle ;
- filtrer par type ;
- filtrer par capacité ;
- filtrer par disponibilité.

<u><strong>Gestion</strong></u>

- créer une salle ;
- modifier les informations d'une salle ;
- vérifier l'unicité de l'identité d'une salle ;
- supprimer une salle ;
- sélectionner plusieurs salles pour une suppression groupée.

<u><strong>Lien backend</strong></u>

- la liste des salles provient du backend ;
- la création, la modification et la suppression des salles sont reliées au backend ;
- les actions de cette page mettent à jour la base de données.

<h3>Matières</h3>

La page `Matières` est organisée par promotion.

<u><strong>Contenu</strong></u>

- une liste des matières groupées par promotion ;
- des filtres par recherche, semestre, cycle, promotion et enseignant ;
- une fiche détaillée par matière.

<u><strong>Recherche et filtres</strong></u>

- rechercher une matière par nom ;
- filtrer les matières.

<u><strong>Gestion</strong></u>

- ouvrir le détail d'une matière ;
- consulter ses informations principales ;
- gérer les affectations d'enseignants ;
- gérer les volumes horaires associés ;
- supprimer une matière ;
- sélectionner plusieurs matières pour une suppression multiple.

<u><strong>Lien backend</strong></u>

- les matières, promotions, cycles, enseignants et enseignements affichés sur cette page sont chargés depuis le backend ;
- la mise à jour et la suppression des matières sont reliées au backend ;
- les actions de cette page mettent à jour la base de données.

> <u><strong>Point actuel</strong></u>
>
> - l'action de création est exposée dans la barre d'outils, mais la fonctionnalité backend correspondante n'est pas encore développée.

<h3>Événements</h3>

La page `Événements` consolide les événements Junia et externes affichés dans la vue macro.

<u><strong>Contenu</strong></u>

- une barre d'outils avec recherche et filtres ;
- une liste regroupée par mois ;
- des cartes événement ;
- une fiche de détail en mode création ou édition.

<u><strong>Recherche et filtres</strong></u>

- rechercher un événement ;
- filtrer par dates ;
- filtrer par cible (`JUNIA` ou `EXTERNE`) ;
- filtrer par type d'événement.

<u><strong>Gestion</strong></u>

- créer un événement ;
- modifier un événement ;
- associer des salles ;
- définir les promotions concernées ;
- supprimer un événement ;
- sélectionner plusieurs événements pour une suppression multiple.

<u><strong>Lien backend</strong></u>

- les événements, localisations et salles sont chargés depuis le backend ;
- la création, la modification et la suppression des événements sont reliées au backend ;
- les actions de cette page mettent à jour la base de données.

<h3>Paramètres</h3>

La page `Paramètres` regroupe les préférences utilisateur et d'affichage.

<u><strong>Contenu</strong></u>

- une section `Compte` avec les informations utilisateur disponibles ;
- une section `Sécurité` pour le futur changement de mot de passe ;
- une section `Apparence` pour les variantes de thème et les options d'accessibilité ;
- une section `Icônes` pour régler l'affichage des icônes dans l'interface.

<u><strong>Compte et sécurité</strong></u>

- consulter le nom utilisateur et l'adresse e-mail actuellement récupérés ;
- visualiser les zones prévues pour l'édition du profil ;
- visualiser la zone prévue pour le changement de mot de passe.

<u><strong>Apparence et accessibilité</strong></u>

- choisir un thème alternatif `Spock`, `Papillon` ou `Médiéval` ;
- conserver la base claire ou sombre pour les variantes compatibles ;
- activer ou couper les sons du thème Spock ;
- régler les options d'accessibilité liées au daltonisme ;
- régler les options de vision ;
- régler les options de lecture.

<u><strong>Affichage</strong></u>

- afficher ou masquer les icônes dans la sidebar ;
- afficher ou masquer les icônes dans les cartes ;
- afficher ou masquer les icônes dans les pages.

<u><strong>Persistance et backend</strong></u>

- les réglages d'apparence, d'accessibilité et de visibilité des icônes sont gérés côté front et persistés localement ;
- les sections `Compte` et `Sécurité` dépendent de fonctionnalités backend non encore développées ;
- tout élément désactivé dans cette page correspond à une fonctionnalité back non encore développée.

> <u><strong>Point actuel</strong></u>
>
> - les sections `Compte` et `Sécurité` sont visibles, mais verrouillées ;
> - l'édition du profil et le changement de mot de passe seront activés lorsque les fonctionnalités backend correspondantes seront disponibles.

<h3>Documentation</h3>

La page `Documentation` embarque des tutoriels utilisateur dans l'application.

<u><strong>Contenu</strong></u>

- des onglets de parcours de documentation ;
- une liste de tutoriels ;
- un viewer de contenu avec objectif, résultat attendu, points d'attention et étapes ;
- des captures d'écran commentées selon les tutoriels.

<u><strong>Navigation</strong></u>

- choisir un parcours de tutoriel ;
- ouvrir un tutoriel ciblé ;
- lire les étapes de prise en main ;
- déplier ou replier certaines sections de contenu.

<u><strong>Lien backend</strong></u>

- cette page est une documentation embarquée dans le front ;
- elle n'écrit pas en base de données.

## Organisation du projet

```text
Opale.Front/
|-- src/
|   |-- assets/        # images, logos, icônes
|   |-- components/    # composants UI et composants métier
|   |-- constants/     # constantes globales, stockage du token
|   |-- hooks/         # hooks personnalisés
|   |-- mocks/         # jeux de données de travail / développement
|   |-- models/        # modèles et types métier
|   |-- pages/         # pages routées de l'application
|   |-- services/      # client API, auth, services métier
|   |-- styles/        # tokens, layout, thèmes, styles par page
|   |-- utils/         # fonctions utilitaires
|   |-- App.tsx        # déclaration des routes
|   `-- main.tsx       # point d'entrée React
|-- dockerization/     # configuration nginx pour l'image de production
|-- Dockerfile.dev
|-- Dockerfile.prod
|-- eslint.config.js
|-- package.json
`-- vite.config.js
```

## Architecture front

Le projet est organisé autour de quelques principes simples :

- les pages déclarent les écrans et la composition globale ;
- les composants `common` portent les briques réutilisables ;
- les composants métier sont regroupés par domaine fonctionnel ;
- les hooks encapsulent la logique d'état et certains comportements d'édition ;
- les services `api/` centralisent les appels vers le backend ;
- `ApiClient` gère l'URL de base, les en-têtes, les requêtes multipart, les erreurs et la gestion des `401`.

## Backend et API

Le front consomme un backend HTTP via les services situés dans `src/services/api`.
Les domaines actuellement couverts incluent notamment :

- promotions ;
- cycles ;
- groupes ;
- spécialités ;
- matières ;
- enseignants ;
- disponibilités ;
- salles ;
- événements ;
- maquettes ;
- localisations.

Certaines pages s'appuient aussi sur des données locales présentes dans `src/mocks` selon l'état d'avancement de la fonctionnalité.

## Theming et accessibilité

L'interface intègre :

- un thème clair / sombre ;
- plusieurs variantes de thèmes ;
- des adaptations visuelles pour certains besoins d'accessibilité ;
- des préférences persistantes dans le `localStorage`.

Les styles sont structurés autour de tokens globaux, de feuilles par composant, puis de feuilles par page.

## Docker

Deux Dockerfiles sont présents :

- `Dockerfile.dev` : environnement de développement avec `npm run dev` et exposition du port `5173`.
- `Dockerfile.prod` : build statique, puis service via Nginx sur le port `80`.

## Qualité

Le projet utilise ESLint pour la vérification statique :

```bash
npm run lint
```

Il n'existe pas, à ce jour, de script de test automatisé déclaré dans `package.json`.

## Points d'attention

- vérifier que `VITE_RACINE_FETCHER_URL` cible bien le bon backend ;
- s'assurer que le backend accepte l'en-tête `x-access-token` ;
- en cas d'erreur d'authentification, commencer par vérifier le token stocké dans le navigateur ;
- si le port `5173` est déjà utilisé, Vite peut proposer un autre port au démarrage.

## Maintenance

Ce README doit être mis à jour lorsque l'un des points suivants change :

- les scripts `package.json` ;
- les variables d'environnement ;
- les routes principales ;
- la stratégie d'authentification ;
- la structure des dossiers ;
- la procédure de build ou de déploiement.

## Pistes futures

Le projet dispose déjà d'un backlog de passation pour le futur groupe. Pour le détail complet, consulter :

- [`../BACKLOG_FUTUR_GROUPE.md`](../BACKLOG_FUTUR_GROUPE.md)

Pour le front web, les principaux sujets à reprendre sont :

**Parcours métier**

- finaliser les parcours UI de la micro-planification et l'ajout manuel de cours ;
- compléter les écrans `Paramètres`, `Compte` et `Sécurité` lorsque les fonctionnalités backend seront disponibles ;
- renforcer la page `Enseignants`, notamment sur l'affichage et l'édition des disponibilités ;
- enrichir les filtres et parcours de recherche sur `Événements`, `Salles` et les autres pages métier ;
- fiabiliser l'UX de la page `Matières`, en particulier autour des volumes horaires, des avertissements et de la lisibilité des états.

**Import / export et feedback utilisateur**

- améliorer l'expérience d'import de maquettes : centralisation, conservation des imports en attente, messages d'erreur plus clairs et meilleure prévisualisation ;
- poursuivre la cohérence UI/UX globale : libellés, multisélection, tutoriels, feedbacks utilisateur.

**Qualité d'interface**

- améliorer le responsive, surtout sous `800px` ;
- poursuivre les travaux d'accessibilité et de conformité RGAA ;
- moderniser certains éléments visuels, notamment la migration `PNG` vers `SVG` lorsqu'elle est pertinente.

Cette section ne remplace pas le backlog : elle sert uniquement de point d'entrée rapide pour la reprise du projet.
