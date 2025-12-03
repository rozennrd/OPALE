// src/mocks/rooms.mock.ts
import { Room, RoomType } from '../models/Room'

export const ROOM_TYPES: RoomType[] = [
    'TD',
    'TP_ELECTRONIQUE',
    'TP_NUMERIQUE',
    'PROJET',
    'AUTRE',
]

export const ROOMS_MOCK: Room[] = [
    // Étage 0
    {
        id: 'room-j001',
        name: 'J001',
        fullName: 'J001_Projet',
        floor: 0,
        mainType: 'PROJET',
        types: ['PROJET', 'AUTRE'],
        description: 'Espace projet polyvalent au rez-de-chaussée.',
    },
    {
        id: 'room-j005',
        name: 'J005',
        floor: 0,
        mainType: 'TD',
        types: ['TD'],
        description: 'Salle de TD classique (tableaux + vidéoprojecteur).',
    },

    // Étage 1
    {
        id: 'room-j101',
        name: 'J101',
        fullName: 'J101_TP Numérique',
        floor: 1,
        mainType: 'TP_NUMERIQUE',
        types: ['TP_NUMERIQUE', 'TD'],
        description: 'Salle orientée TP numérique (PC fixes).',
    },
    {
        id: 'room-j109',
        name: 'J109',
        fullName: 'J109_ClassLab',
        floor: 1,
        mainType: 'TP_NUMERIQUE',
        types: ['TP_NUMERIQUE'],
        description: 'ClassLab numérique (machines récentes, dual-screen).',
    },
    {
        id: 'room-j120',
        name: 'J120',
        floor: 1,
        mainType: 'TD',
        types: ['TD', 'AUTRE'],
        description: 'Salle de TD modulable.',
    },

    // Étage 2
    {
        id: 'room-j201',
        name: 'J201',
        floor: 2,
        mainType: 'TP_ELECTRONIQUE',
        types: ['TP_ELECTRONIQUE'],
        description: 'TP électronique (paillasses, alims, oscilloscopes).',
    },
    {
        id: 'room-j210',
        name: 'J210',
        floor: 2,
        mainType: 'TP_ELECTRONIQUE',
        types: ['TP_ELECTRONIQUE', 'PROJET'],
        description: 'Salle mixte TP électronique / mini-projets.',
    },
    {
        id: 'room-j220',
        name: 'J220',
        fullName: 'J220_Salle Polyvalente',
        floor: 2,
        mainType: 'AUTRE',
        types: ['AUTRE', 'TD'],
        description: 'Polyvalente (réu, soutenances, ateliers).',
    },
]