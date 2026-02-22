import type { TutorialItem, TutorialTab } from './types'

export const TAB_ITEMS: Array<{ key: TutorialTab; label: string }> = [
    { key: 'planning', label: 'Flux planning' },
    { key: 'pages', label: 'Par page' },
]

export const TUTORIAL_ITEMS: TutorialItem[] = [
    {
        id: 'macro',
        title: 'Generer un planning macro',
        summary: 'Flux global de generation et validation du planning macro.',
        tab: 'planning',
    },
    {
        id: 'micro',
        title: 'Generer un planning micro',
        summary: 'Etapes de construction du planning micro a partir du macro.',
        tab: 'planning',
    },
    {
        id: 'promotions',
        title: 'Tutoriel - Promotions',
        summary: 'Creer, modifier et organiser les promotions et leurs groupes.',
        tab: 'pages',
    },
    {
        id: 'events',
        title: 'Tutoriel - Evenements',
        summary: 'Ajouter, ajuster et suivre les evenements planifies.',
        tab: 'pages',
    },
    {
        id: 'teachers',
        title: 'Tutoriel - Enseignants',
        summary: 'Gerer les profils enseignants et leur mode d intervention.',
        tab: 'pages',
    },
    {
        id: 'rooms',
        title: 'Tutoriel - Salles',
        summary: 'Configurer les salles et leurs caracteristiques pedagogiques.',
        tab: 'pages',
    },
    {
        id: 'matieres',
        title: 'Tutoriel - Matieres',
        summary: 'Administrer les matieres et leurs parametres associes.',
        tab: 'pages',
    },
]
