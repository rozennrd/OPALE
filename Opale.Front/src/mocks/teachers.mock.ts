// src/mocks/teachers.mock.ts
import { Teacher } from '../models/Teacher'

export const INTERNAL_TEACHERS_MOCK: Teacher[] = [
    {
        id: 't-int-1',
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '06 12 34 56 78',
        mode: 'PRESENTIEL',
    },
    {
        id: 't-int-2',
        firstName: 'Lucas',
        lastName: 'Martin',
        phone: '06 98 76 54 32',
        mode: 'HYBRIDE',
    },
    {
        id: 't-int-3',
        firstName: 'Sarah',
        lastName: 'Leroy',
        phone: '06 11 22 33 44',
        mode: 'DISTANCIEL',
    },
    {
        id: 't-int-4',
        firstName: 'Nicolas',
        lastName: 'Roche',
        phone: '06 34 22 19 88',
        mode: 'PRESENTIEL',
    },
    {
        id: 't-int-5',
        firstName: 'Camille',
        lastName: 'Petit',
        phone: '06 21 45 87 90',
        mode: 'HYBRIDE',
    },
    {
        id: 't-int-6',
        firstName: 'Adrien',
        lastName: 'Baron',
        phone: '06 65 14 97 03',
        mode: 'DISTANCIEL',
    },
    {
        id: 't-int-7',
        firstName: 'Claire',
        lastName: 'Fournier',
        phone: '06 87 56 23 41',
        mode: 'PRESENTIEL',
    },
    {
        id: 't-int-8',
        firstName: 'Hugo',
        lastName: 'Lopez',
        phone: '06 44 21 09 98',
        mode: 'HYBRIDE',
    },
]

export const VACATAIRE_TEACHERS_MOCK: Teacher[] = [
    {
        id: 't-vac-1',
        firstName: 'Thomas',
        lastName: 'Bernard',
        phone: '07 12 34 56 78',
        mode: 'HYBRIDE',
    },
    {
        id: 't-vac-2',
        firstName: 'Julie',
        lastName: 'Moreau',
        phone: '07 98 76 54 32',
        mode: 'PRESENTIEL',
    },
    {
        id: 't-vac-3',
        firstName: 'Emilie',
        lastName: 'Chevalier',
        phone: '07 44 22 11 55',
        mode: 'DISTANCIEL',
    },
    {
        id: 't-vac-4',
        firstName: 'Baptiste',
        lastName: 'Renard',
        phone: '07 88 19 43 22',
        mode: 'PRESENTIEL',
    },
    {
        id: 't-vac-5',
        firstName: 'Laura',
        lastName: 'Gauthier',
        phone: '07 33 55 91 84',
        mode: 'HYBRIDE',
    },
    {
        id: 't-vac-6',
        firstName: 'Antoine',
        lastName: 'Perrin',
        phone: '07 66 22 87 09',
        mode: 'PRESENTIEL',
    },
]