import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionSearchFilterTutorialContent: TutorialContent = {
    objective:
        'Rechercher et filtrer rapidement une liste.',
    expectedResult:
        'La liste affichée correspond aux critères choisis.',
    steps: [
        <>
            Utiliser la <strong>recherche</strong> pour filtrer par texte (nom, libellé, etc.).
        </>,
        <>
            Appliquer les <strong>filtres</strong> disponibles sur la page (types, dates, disponibilité, etc.).
        </>,
        <>
            Cliquer sur <strong>Réinitialiser les filtres</strong> pour revenir à la vue complète.
        </>,
    ],
    tips: [
        'Les filtres peuvent être combinés pour affiner les résultats.',
        "La recherche et les filtres s'appliquent en temps réel.",
    ],
}

