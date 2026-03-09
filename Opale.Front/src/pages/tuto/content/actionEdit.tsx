import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionEditTutorialContent: TutorialContent = {
    objective:
        'Modifier un élément existant depuis la liste.',
    expectedResult:
        "La fiche détail est ouverte en mode édition.",
    steps: [
        <>
            Sur les pages <strong>Événements</strong>, <strong>Enseignants</strong>,{' '}
            <strong>Salles</strong> et <strong>Matières</strong>, cliquer sur la carte ou la ligne de
            l'élément à modifier.
        </>,
        <>
            La fiche détail s'ouvre et permet de modifier les informations.
        </>,
    ],
    tips: [
        "Si le mode Sélectionner est actif, cliquer sur l'élément sélectionné au lieu d'ouvrir la fiche.",
        "Désactiver le mode Sélectionner pour éditer.",
    ],
}

