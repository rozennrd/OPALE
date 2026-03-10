# Backlog pour le futur groupe OPALE

*Document de passation — points à prioriser après handover.*

## Notes de contexte

- **Client** : Damien. les questions passeront principalement par Damien.
- **Portée géographique** :
    - **Bordeaux uniquement** : certains points ne sont **pas nécessaires**.
    - **Lille/Châteauroux** : ces points deviennent **prioritaires**.

## Import / export / interopérabilité

<u>Objectif</u> : fiabiliser les imports et faciliter l’échange de données.

- **Centraliser l’import des maquettes** (pas par cycle/carte), à valider avec Damien.
- **Maquettes en attente** : si on quitte la page promo, les imports en attente disparaissent.
    - Conserver la **liste des maquettes importées** et les **imports en attente**.
- **Prévisualisation Excel** : si aucun contenu valide n’est détecté, afficher un **message clair** (pas de pop‑up avec tableaux vides).
- **Warning fichier non Excel** : afficher un message lors d’un drag & drop d’un format invalide dans une carte cycle.
- **Export individuel profs** : **Excel + CSV** (Google Agenda / Outlook).
- **Export micro** :
    - Faire l'export micro au format Excel pour Damien.
    - CSV pour import de masse dans **Orion**. Valider **format attendu** et **autorisations** auprès de Lille (probablement JSON).

## Génération / contraintes micro

<u>Objectif</u> : produire une micro complète et cohérente.

- **Génération complète de la micro** avec toutes les contraintes listées par Anthony dans la doc.
    - Prévoir des **points réguliers avec Damien** (contraintes susceptibles d’évoluer).
    - Il s'agit de contraintes aussi bien pour le back que pour le front (Excel)
- **Ajout manuel de cours en micro-planning** : permettre d’ajouter des cours à la main, en complément de la génération/import.

## Gestion des profs et comptes

<u>Objectif</u> : réduire les tâches manuelles et sécuriser les accès.

- **Page profs externe** : permettre la saisie directe des informations :
    - Identité, mails, type de cours, rattachement, campus (si interne), périodes de dispo.
    - Option : déclaration des matières par les enseignants + volumes horaires par les enseignants (gain de temps pour Louise) ?
    - <u>Décision</u> : **obligatoire ou optionnel** ?
- **Rôles et permissions** : admin / prof / coordinateur pour cloisonner l’accès et l’affichage.
- **Dépôt de factures** pour les externes (réduction des échanges mails) ?
- **Mot de passe** : bouton **voir/masquer** lors de la saisie.
- **Paramètres** : permettre la **modification d’un compte**.
- **Session utilisateur** : après un refresh navigateur, **rester connecté** si la session est encore valide.

## Enseignants / disponibilité

<u>Objectif</u> : rendre la disponibilité lisible et fiable.

- **Affichage des disponibilités** :
    - Remplacer l’affichage “par semaine” par **“Période dd/mm/yyyy–dd/mm/yyyy”**,
    - Et/Ou ajouter un **switch** semaine/période.
- **Édition des dates en mode semaine** :
    - Actuellement modifiable même si les périodes sont “semaine”.
    - **À vérifier** : effets et risques.

## Événements / filtres

<u>Objectif</u> : améliorer la recherche et le ciblage.

- **Événement** : ajouter filtres **salle** et **promo**.
- **Salles** :
    - Ajouter **Atrium** et **Autre** dans le **script d’initialisation**.
    - Ajouter aussi **Atrium** et **Autre** dans les **sélections / filtres de salles**.
- Vérifier si d’autres pages nécessitent des filtres supplémentaires.

## Matières / volumes horaires

<u>Objectif</u> : éviter les incohérences d’attribution.

- **Attribution d’heures** :
    - Si l’on attribue des heures depuis la page matière sans avoir attribué la matière au prof,
      **attribuer la matière automatiquement**.
    - Problème actuel : l’enregistrement **ne se fait pas** dans ce cas.
- **Types de cours sans volume prévu** :
    - Le champ est cliquable mais non éditable.
    - **Bloquer le champ** clairement.
- **Alerte “trop d’heures”** :
    - Le warning est coupé dans la carte détail.
    - **Augmenter la hauteur** ou activer le scroll correctement.
- **Badge couleur** :
    - Indiquer visuellement si le **volume horaire est complet** ou non ? Idée pour ajouter de la couleur à la page matières.

## Accessibilité / conformité

<u>Objectif</u> : conformité et qualité perçue.

- **RGAA** : vérifier la conformité sur les points OPALE concernés, identifier, planifier et exécuter les actions de mise en conformité.

## UI / UX / cohérence

<u>Objectif</u> : cohérence et clarté des parcours.

- **Création cycle** : bouton “Enregistrer” → **“Créer”**.
- **Ajout promo dans un cycle existant** : question à trancher sur le bouton “Annuler”.
- **PNG → SVG** : migration des icônes/images pour un rendu plus propre et scalable.
- **Tutoriels** : permettre de **cliquer sur les images** pour les afficher en grand.
- **Multi-sélection / suppression** : en mode sélection multiple, la touche **Échap** doit quitter le mode sélection.
- **Responsive** : le comportement n’est pas encore entièrement géré, en particulier **sous 800 px**.

## Dette technique / configuration

<u>Objectif</u> : simplifier la maintenance et éviter les modifications en double.

- **Scripts SQL** : fusionner les **deux scripts SQL** actuels si leur coexistence n’apporte rien.
- **Fichiers `.env`** : fusionner les configurations dupliquées pour éviter de modifier plusieurs fois les mêmes variables.

## Données / validation

<u>Objectif</u> : éviter les doublons et erreurs de saisie.

- **Doublons promo** : empêcher l’enregistrement si une promo possède déjà le même nom, avec erreur explicite.
- **Reset BDD** : besoin d’un mécanisme de reset en masse ? (à cadrer).

## Déploiement multi‑site

<u>Objectif</u> : préparer une mutualisation Junia.

- **Adapter OPALE à Lille et Châteauroux** :
    - Salles, cycles/promos, types de profs.
    - Calcul des heures lors de l’import de maquettes.
- **Template de maquette Junia** :
    - Si déploiement multi‑site, définir un template commun pour limiter les imports cassés.

## Propositions (idées)

<u>Objectif</u> : pistes d’amélioration proposées (à valider).

- **Audit/traçabilité** : journal des actions (création, modification, export, suppression).
- **Sauvegardes & restauration** : documenter RPO/RTO, fréquence, procédures.
- **Documentation** : guides rapides admin + prof (onboarding).
- **Gestion des droits fine** : par établissement / campus / cycle.
- **RGPD** : base légale, consentement, durée de conservation, droit d’accès/suppression.
- **Export planning** : ajouter un format **iCal (.ics)** en plus de CSV/Excel.
- **Import/validation maquettes** : rapport d’erreurs clair (lignes invalides, champs manquants).
- **Tests d’accessibilité** : checklist + outil pour automatiser les contrôles.
- **Tableau de bord** : suivi de la complétude des infos profs.
- **Mode “brouillon / publié”** : pour les maquettes et exports.
