import type { TutorialItem, TutorialTab } from './types'

export const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Flux planning' },
    { key: 'pages', label: 'Par page' },
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

