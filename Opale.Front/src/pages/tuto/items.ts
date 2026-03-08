import type { TutorialItem, TutorialTab } from './types'

export const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Flux planning' },
    { key: 'pages', label: 'Par page' },
    { key: 'actions', label: 'Action commune' },
]

export const TUTORIAL_ITEMS: TutorialItem[] = [
    {
        id: 'macro',
        title: 'GÃ©nÃ©rer un planning macro',
        summary: 'Flux global de gÃ©nÃ©ration et validation du planning macro.',
        tab: 'planning',
    },
    {
        id: 'micro',
        title: 'GÃ©nÃ©rer un planning micro',
        summary: 'Ã‰tapes de construction du planning micro Ã  partir du macro.',
        tab: 'planning',
    },
    {
        id: 'planning',
        title: 'Tutoriel - Planning',
        summary: 'Utiliser la page Planning et lancer les gÃ©nÃ©rations disponibles.',
        tab: 'pages',
    },
    {
        id: 'action-create',
        title: 'CrÃ©er un Ã©lÃ©ment',
        summary: 'Utiliser le bouton + pour crÃ©er (hors Promotions).',
        tab: 'actions',
    },
    {
        id: 'action-edit',
        title: 'Modifier un Ã©lÃ©ment',
        summary: "Ouvrir une fiche existante pour l'Ã©dition.",
        tab: 'actions',
    },
    {
        id: 'action-cancel-save',
        title: 'Annuler ou enregistrer',
        summary: 'GÃ©rer les actions Annuler / Enregistrer.',
        tab: 'actions',
    },
    {
        id: 'action-delete-selection',
        title: 'Supprimer en mode sÃ©lection',
        summary: 'SÃ©lectionner plusieurs Ã©lÃ©ments puis supprimer.',
        tab: 'actions',
    },
    {
        id: 'action-search-filter',
        title: 'Rechercher et filtrer',
        summary: 'Utiliser la recherche, les filtres et la rÃ©initialisation.',
        tab: 'actions',
    },
    {
        id: 'date-selector',
        title: 'SÃ©lecteur de date',
        summary: 'Saisir une date avec ou sans heures/minutes.',
        tab: 'actions',
    },
    {
        id: 'promotions',
        title: 'Tutoriel - Promotions',
        summary: 'CrÃ©er, modifier et organiser les promotions et leurs groupes.',
        tab: 'pages',
    },
    {
        id: 'events',
        title: 'Tutoriel - Ã‰vÃ©nements',
        summary: 'Ajouter, ajuster et suivre les Ã©vÃ©nements planifiÃ©s.',
        tab: 'pages',
    },
    {
        id: 'teachers',
        title: 'Tutoriel - Enseignants',
        summary: "GÃ©rer les profils enseignants et leur mode d'intervention.",
        tab: 'pages',
    },
    {
        id: 'rooms',
        title: 'Tutoriel - Salles',
        summary: 'Configurer les salles et leurs caractÃ©ristiques pÃ©dagogiques.',
        tab: 'pages',
    },
    {
        id: 'matieres',
        title: 'Tutoriel - MatiÃ¨res',
        summary: 'Administrer les matiÃ¨res et leurs paramÃ¨tres associÃ©s.',
        tab: 'pages',
    },
]


