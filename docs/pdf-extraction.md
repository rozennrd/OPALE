# Extraction PDF de la documentation

Ce document décrit la fonctionnalité de documentation intégrée dans l'application web ainsi que son pipeline d'export PDF.

## Recommandation

Cette fonctionnalité doit etre documentée dans un document dédié à la racine du projet :

- `docs/pdf-extraction.md`

Pourquoi :

- la fonctionnalité est transverse entre le frontend et le backend
- elle a des prérequis d'installation et d'exécution
- elle est plus complexe qu'un simple détail d'implémentation local
- elle doit rester facile à retrouver pour toute personne travaillant sur la branche

Le `README.md` racine doit seulement contenir un lien court vers ce fichier.

## Vue d'ensemble de la fonctionnalité

La fonctionnalité ajoute :

- une page de documentation dans le frontend à l'URL `/documentation`
- un workflow de sélection et de visualisation des tutoriels dans l'interface web
- une boite de dialogue d'export PDF depuis la page de documentation
- un endpoint backend qui génère le PDF dynamiquement
- la prise en charge des captures d'écran, zones surlignées, texte riche, sections, sommaire, logo et thème

## Flux fonctionnel

1. L'utilisateur ouvre la page de documentation dans le frontend.
2. L'utilisateur sélectionne un ou plusieurs tutoriels.
3. L'utilisateur ouvre la boite de dialogue d'export.
4. Le frontend construit une payload d'export à partir du contenu des tutoriels.
5. Le frontend envoie la payload à `POST /documentation/export`.
6. Le backend génère un PDF avec `pdfkit`.
7. Le navigateur télécharge le fichier généré.

## Composants techniques principaux

### Frontend

Fichiers concernés :

- `Opale.Front/src/pages/Documentation.tsx`
- `Opale.Front/src/pages/tuto/content/*`
- `Opale.Front/src/pages/tuto/items/*`
- `Opale.Front/src/pages/tuto/types/*`
- `Opale.Front/src/pages/tuto/utils/*`
- `Opale.Front/src/assets/tuto/*`

Responsabilités du frontend :

- afficher la page de documentation intégrée
- structurer les tutoriels par onglets et sujets
- transformer le contenu React des tutoriels en texte riche exportable
- résoudre les URLs des images des tutoriels
- convertir si besoin les images et le logo en base64 avant l'envoi de la requête
- appeler l'endpoint backend d'export
- déclencher le téléchargement du fichier côté navigateur

### Backend

Fichiers concernés :

- `BobPlanning.back/src/api/controllers/documentationController.ts`
- `BobPlanning.back/src/api/routes/documentationRoutes.ts`
- `BobPlanning.back/src/pdf/tutorialExport.ts`
- `BobPlanning.back/src/pdf/fonts/*`

Responsabilités du backend :

- valider la payload d'export
- générer le PDF final
- construire la page de couverture et le sommaire
- rendre les sections, blocs de texte, listes, étapes et captures
- dessiner les zones surlignées sur les captures exportées
- renvoyer le PDF avec le type `application/pdf`

## Installation

### Dépendances backend

Le backend nécessite `pdfkit` et `axios` pour la génération PDF et le chargement des images.

Ces dépendances sont déjà déclarées dans :

- `BobPlanning.back/package.json`

Installer les dépendances backend :

```powershell
cd .\BobPlanning.back
npm i
```

### Dépendances frontend

L'interface de documentation et la construction de la payload d'export se trouvent dans le frontend.

Installer les dépendances frontend :

```powershell
cd .\Opale.Front
npm i
```

### Polices optionnelles

Arial est optionnelle mais recommandée pour un rendu PDF plus cohérent.

Placer les fichiers suivants dans :

- `BobPlanning.back/src/pdf/fonts/`

Fichiers attendus :

- `arial.ttf`
- `arialbd.ttf`

S'ils sont absents, le backend utilisera Helvetica à la place.

## Configuration

### URL de base de l'API côté frontend

Le frontend envoie les requêtes d'export vers :

- `VITE_RACINE_FETCHER_URL`

Exemple dans `Opale.Front/.env` :

```env
VITE_RACINE_FETCHER_URL=http://localhost:3000
```

### Résolution des images côté backend

Lors de la génération du PDF, le backend tente de résoudre les images des tutoriels via :

- les chemins locaux des assets frontend
- un accès HTTP direct
- des hôtes de repli pour le développement local et l'exécution conteneurisée

Les sources d'hôtes de repli prises en charge incluent :

- `PDF_ASSET_HOST`
- `opale-new-frontend:5173`
- `host.docker.internal:5173`

Utiliser `PDF_ASSET_HOST` si le backend ne peut pas accéder aux images servies par le frontend dans votre environnement.

Exemple :

```env
PDF_ASSET_HOST=localhost:5173
```

## Contrat API

### Endpoint

```http
POST /documentation/export
```

### Authentification

Cette route est protégée par `authJwt.verifyToken`.

Le frontend envoie le token dans :

- `x-access-token`

### Corps de la requête

Le backend attend une payload JSON contenant :

- les métadonnées du document
- le thème
- les tutoriels sélectionnés
- les étapes structurées
- éventuellement les images embarquées
- éventuellement les zones surlignées sur les captures

Au minimum, `tutorials` doit être un tableau non vide.

### Réponse

Succès :

- `200 OK`
- `Content-Type: application/pdf`
- binaire PDF téléchargeable

Erreurs :

- `400` si aucun tutoriel n'est sélectionné
- `500` si la génération du PDF échoue

## Source du contenu

Le PDF exporté est généré à partir du même contenu de tutoriel que celui affiché dans la page de documentation intégrée.

Cela signifie :

- la documentation du site web est la source de vérité unique
- toute modification du contenu des tutoriels dans le frontend modifie aussi le PDF exporté
- les captures dans `Opale.Front/src/assets/tuto/` font partie du pipeline d'export

## Caractéristiques de la sortie

Le PDF généré prend actuellement en charge :

- une page de couverture
- une date dynamique
- un thème clair ou sombre
- un logo sur la couverture
- un sommaire
- plusieurs tutoriels sélectionnés
- du texte riche
- des sections et sous-sections
- des blocs de conseils
- des captures intégrées
- des overlays d'atténuation et des labels de mise en évidence sur les captures

## Notes de développement

### Où modifier la fonctionnalité

Modifier le frontend si vous devez changer :

- le texte des tutoriels
- la structure des tutoriels
- les captures sélectionnées
- les coordonnées des zones surlignées
- le comportement de la boite de dialogue d'export
- la mise en page dans l'interface web

Modifier le backend si vous devez changer :

- la mise en page du PDF
- la typographie
- la pagination
- le rendu des images et des zones surlignées
- la page de couverture ou le sommaire
- la stratégie de chargement des images

## Dépannage

### La génération du PDF fonctionne mais les images sont absentes

Vérifier :

- que les images des tutoriels existent dans `Opale.Front/src/assets/tuto/`
- que le chemin des assets frontend est correct
- que le backend peut résoudre les chemins d'assets locaux
- que le backend peut accéder à l'hôte d'assets configuré
- que `PDF_ASSET_HOST` est correctement défini si nécessaire

### L'export échoue à cause de l'authentification

Vérifier :

- que l'utilisateur est connecté
- que le token est présent dans le local storage
- que `x-access-token` est bien envoyé
- que la route backend est joignable via `VITE_RACINE_FETCHER_URL`

### Le PDF utilise Helvetica au lieu d'Arial

Vérifier :

- que `arial.ttf` est présent dans `BobPlanning.back/src/pdf/fonts/`
- que `arialbd.ttf` est présent dans `BobPlanning.back/src/pdf/fonts/`

### L'export renvoie 400

Vérifier :

- qu'au moins un tutoriel est sélectionné avant l'export

### L'export renvoie 500

Vérifier :

- les logs backend autour de `[PDF]`
- les URLs d'images invalides
- les assets frontend inaccessibles
- une payload d'export mal formée

## Checklist de vérification

Après installation, vérifier :

1. Que l'application expose bien la page `/documentation`.
2. Que les tutoriels s'affichent correctement dans le site.
3. Que la boite de dialogue d'export s'ouvre.
4. Qu'une sélection de tutoriels peut être exportée.
5. Que le PDF téléchargé s'ouvre correctement.
6. Que les captures et zones surlignées sont bien rendues.
7. Que l'export fonctionne dans l'environnement d'exécution cible.

## Conseil de maintenance

Mettre ce document à jour à chaque changement sur l'un de ces points :

- la structure de la payload d'export
- le modèle de contenu de la documentation frontend
- le contrat de l'endpoint backend
- les variables d'environnement requises
- la stratégie d'hébergement des assets
- les exigences sur les polices
