import type { TutorialItem, TutorialTab } from './types'

export const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Étape planning' },
    { key: 'pages', label: 'Par page' },
    { key: 'actions', label: 'Action commune' },
]

export const TUTORIAL_ITEMS: TutorialItem[] = [
    {
        id: 'macro',
        title: 'Générer un planning macro',
        summary: 'Étapes globales de génération et validation du planning macro.',
        tab: 'planning',
    },
    {
        id: 'micro',
        title: 'Générer un planning micro',
        summary: 'Étapes de construction du planning micro à partir du macro.',
        tab: 'planning',
    },
    {
        id: 'planning',
        title: 'Tutoriel - Planning',
        summary: 'Utiliser la page Planning et lancer les générations disponibles.',
        tab: 'pages',
    },
    {
        id: 'action-create',
        title: 'Créer un élément',
        summary: 'Utiliser le bouton + pour créer (hors Promotions).',
        tab: 'actions',
    },
    {
        id: 'action-edit',
        title: 'Modifier un élément',
        summary: "Ouvrir une fiche existante pour l'édition.",
        tab: 'actions',
    },
    {
        id: 'action-cancel-save',
        title: 'Annuler ou enregistrer',
        summary: 'Gérer les actions Annuler / Enregistrer.',
        tab: 'actions',
    },
    {
        id: 'action-delete-selection',
        title: 'Supprimer',
        summary: 'Supprimer en mode sélection ou depuis une fiche.',
        tab: 'actions',
    },
    {
        id: 'action-search-filter',
        title: 'Rechercher et filtrer',
        summary: 'Utiliser la recherche, les filtres et la réinitialisation.',
        tab: 'actions',
    },
    {
        id: 'date-selector',
        title: 'Sélecteur de date',
        summary: 'Saisir une date avec ou sans heures/minutes.',
        tab: 'actions',
    },
    {
        id: 'promotions',
        title: 'Tutoriel - Promotions',
        summary: 'Créer, modifier et organiser les promotions et leurs groupes.',
        tab: 'pages',
    },
    {
        id: 'events',
        title: 'Tutoriel - Événements',
        summary: 'Ajouter, ajuster et suivre les événements planifiés.',
        tab: 'pages',
    },
    {
        id: 'teachers',
        title: 'Tutoriel - Enseignants',
        summary: "Gérer les profils enseignants et leur mode d'intervention.",
        tab: 'pages',
    },
    {
        id: 'rooms',
        title: 'Tutoriel - Salles',
        summary: 'Configurer les salles et leurs caractéristiques pédagogiques.',
        tab: 'pages',
    },
    {
        id: 'matieres',
        title: 'Tutoriel - Matières',
        summary: 'Administrer les matières et leurs paramètres associés.',
        tab: 'pages',
    },
]



