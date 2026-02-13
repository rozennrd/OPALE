// src/mocks/events.mock.ts
import { CampusEvent } from '../models/CampusEvent'

export const JUNIA_EVENTS_MOCK: CampusEvent[] = [
    {
        id: 'evt-junia-1',
        name: 'Journée Portes Ouvertes',
        date: '2025-02-08',
        location: 'Campus Lille',
        source: 'JUNIA',
        type: 'JOURNEE_PO',
    },
    {
        id: 'evt-junia-2',
        name: 'Forum Entreprises',
        date: '2025-03-20',
        location: 'Campus Lille / Hall principal',
        source: 'JUNIA',
        type: 'FORUM',
    },
    {
        id: 'evt-junia-3',
        name: 'Conférence IA & Éthique',
        date: '2025-04-10',
        location: 'Amphi A',
        source: 'JUNIA',
        type: 'CONFERENCE',
    },
]

export const EXTERNAL_EVENTS_MOCK: CampusEvent[] = [
    {
        id: 'evt-ext-1',
        name: "Salon de l'Étudiant",
        date: '2025-01-25',
        location: 'Lille Grand Palais',
        source: 'EXTERNE',
        type: 'SALON',
    },
    {
        id: 'evt-ext-2',
        name: 'Hackathon Tech4Good',
        date: '2025-03-01',
        location: 'EuraTechnologies',
        source: 'EXTERNE',
        type: 'AUTRE',
    },
    {
        id: 'evt-ext-3',
        name: 'Examen TOEIC',
        date: '2025-05-15',
        location: 'Campus Lille',
        source: 'EXTERNE',
        type: 'EXAMEN',
    },
]