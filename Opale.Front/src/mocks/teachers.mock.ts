// src/mocks/teachers.mock.ts
import { Teacher } from '../models/Teacher'

export const INTERNAL_TEACHERS_MOCK: Teacher[] = [
    {
        id: 't-int-1',
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '06 12 34 56 78',
        email: 'marie.dupont@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'Maths', promo: 'AP 3' },
            { name: 'Maths', promo: 'AP 4' },
            { name: 'Analyse', promo: 'CIR 1' },
        ],
        availability: '1111011110', // très dispo, sauf quelques créneaux
    },
    {
        id: 't-int-2',
        firstName: 'Lucas',
        lastName: 'Martin',
        phone: '06 98 76 54 32',
        email: 'lucas.martin@exemple.com',
        mode: 'HYBRIDE',
        subjects: [
            { name: 'Algo', promo: 'CIR 1' },
            { name: 'Algo', promo: 'CIR 2' },
            { name: 'Structures de données', promo: 'ISEN 3' },
        ],
        availability: '1100110011', // dispo lun/mar matin + jeu/ven
    },
    {
        id: 't-int-3',
        firstName: 'Sarah',
        lastName: 'Leroy',
        phone: '06 11 22 33 44',
        email: 'sarah.leroy@exemple.com',
        mode: 'DISTANCIEL',
        subjects: [
            { name: 'Programmation Web', promo: 'ISEN 4' },
            { name: 'Programmation Web', promo: 'ISEN 5' },
            { name: 'Frontend', promo: 'ADI 2' },
        ],
        availability: '0011111100', // surtout milieu de semaine
    },
    {
        id: 't-int-4',
        firstName: 'Nicolas',
        lastName: 'Roche',
        phone: '06 34 22 19 88',
        email: 'nicolas.roche@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'Architecture des SI', promo: 'ADI 1' },
            { name: 'Dev. Java', promo: 'ISEN 3' },
        ],
        availability: '1111000000', // dispo lundi/mardi seulement
    },
    {
        id: 't-int-5',
        firstName: 'Camille',
        lastName: 'Petit',
        phone: '06 21 45 87 90',
        email: 'camille.petit@exemple.com',
        mode: 'HYBRIDE',
        subjects: [
            { name: 'Projet tutoré', promo: 'AP 5' },
            { name: 'Gestion de projet', promo: 'ISEN 5' },
        ],
        availability: '0000111111', // dispo mercredi → vendredi
    },
    {
        id: 't-int-6',
        firstName: 'Adrien',
        lastName: 'Baron',
        phone: '06 65 14 97 03',
        email: 'adrien.baron@exemple.com',
        mode: 'DISTANCIEL',
        subjects: [
            { name: 'Réseaux', promo: 'CIR 2' },
            { name: 'Réseaux', promo: 'ISEN 4' },
        ],
        availability: '1010101010', // un demi-jour sur deux
    },
    {
        id: 't-int-7',
        firstName: 'Claire',
        lastName: 'Fournier',
        phone: '06 87 56 23 41',
        email: 'claire.fournier@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'Physique', promo: 'AP 3' },
            { name: 'Électronique', promo: 'CIR 1' },
        ],
        availability: '1111110000', // début de semaine très dispo
    },
    {
        id: 't-int-8',
        firstName: 'Hugo',
        lastName: 'Lopez',
        phone: '06 44 21 09 98',
        email: 'hugo.lopez@exemple.com',
        mode: 'HYBRIDE',
        subjects: [
            { name: 'IA', promo: 'ISEN 5' },
            { name: 'Machine Learning', promo: 'ISEN 4' },
            { name: 'Python', promo: 'ADI 2' },
        ],
        availability: '0101110101',
    },
]

export const VACATAIRE_TEACHERS_MOCK: Teacher[] = [
    {
        id: 't-vac-1',
        firstName: 'Thomas',
        lastName: 'Bernard',
        phone: '07 12 34 56 78',
        email: 'thomas.bernard@exemple.com',
        mode: 'HYBRIDE',
        subjects: [
            { name: 'Économie', promo: 'AP 4' },
            { name: 'Management', promo: 'ADI 1' },
        ],
        availability: '0011001100',
    },
    {
        id: 't-vac-2',
        firstName: 'Julie',
        lastName: 'Moreau',
        phone: '07 98 76 54 32',
        email: 'julie.moreau@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'Anglais', promo: 'AP 3' },
            { name: 'Anglais', promo: 'ISEN 3' },
            { name: 'TOEIC', promo: 'ISEN 5' },
        ],
        availability: '1110001110',
    },
    {
        id: 't-vac-3',
        firstName: 'Emilie',
        lastName: 'Chevalier',
        phone: '07 44 22 11 55',
        email: 'emilie.chevalier@exemple.com',
        mode: 'DISTANCIEL',
        subjects: [
            { name: 'UX Design', promo: 'ADI 2' },
            { name: 'Design Web', promo: 'ISEN 4' },
        ],
        availability: '0001110001',
    },
    {
        id: 't-vac-4',
        firstName: 'Baptiste',
        lastName: 'Renard',
        phone: '07 88 19 43 22',
        email: 'baptiste.renard@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'Bases de données', promo: 'CIR 1' },
            { name: 'SQL avancé', promo: 'ISEN 3' },
        ],
        availability: '1001100110',
    },
    {
        id: 't-vac-5',
        firstName: 'Laura',
        lastName: 'Gauthier',
        phone: '07 33 55 91 84',
        email: 'laura.gauthier@exemple.com',
        mode: 'HYBRIDE',
        subjects: [
            { name: 'Maths appliquées', promo: 'ISEN 4' },
            { name: 'Statistiques', promo: 'ISEN 5' },
        ],
        availability: '0110011001',
    },
    {
        id: 't-vac-6',
        firstName: 'Antoine',
        lastName: 'Perrin',
        phone: '07 66 22 87 09',
        email: 'antoine.perrin@exemple.com',
        mode: 'PRESENTIEL',
        subjects: [
            { name: 'C', promo: 'CIR 2' },
            { name: 'C++', promo: 'ISEN 3' },
            { name: 'Systèmes embarqués', promo: 'ISEN 4' },
        ],
        availability: '1011010110',
    },
]