import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionSearchFilterTutorialContent: TutorialContent = {
    objective:
        'Rechercher et filtrer rapidement une liste.',
    expectedResult:
        'La liste affichÃ©e correspond aux critÃ¨res choisis.',
    steps: [
        <>
            Utiliser la <strong>recherche</strong> pour filtrer par texte (nom, libellÃ©, etc.).
        </>,
        <>
            Appliquer les <strong>filtres</strong> disponibles sur la page (types, dates, disponibilitÃ©, etc.).
        </>,
        <>
            Cliquer sur <strong>RÃ©initialiser les filtres</strong> pour revenir Ã  la vue complÃ¨te.
        </>,
    ],
    tips: [
        'Les filtres peuvent Ãªtre combinÃ©s pour affiner les rÃ©sultats.',
        "La recherche et les filtres s'appliquent en temps rÃ©el.",
    ],
}
