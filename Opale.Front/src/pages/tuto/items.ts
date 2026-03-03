import type { TutorialItem, TutorialTab } from './types'

export const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Flux planning' },
    { key: 'pages', label: 'Par page' },
]

export const TUTORIAL_ITEMS: TutorialItem[] = [
    {
        id: 'macro',
        title: 'Générer un planning macro',
        summary: 'Flux global de génération et validation du planning macro.',
        tab: 'planning',
    },
    {
        id: 'micro',
        title: 'Générer un planning micro',
        summary: 'Étapes de construction du planning micro à partir du macro.',
        tab: 'planning',
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
