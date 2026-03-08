import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionDeleteSelectionTutorialContent: TutorialContent = {
    objective:
        'Supprimer un ou plusieurs Ã©lÃ©ments via le mode sÃ©lection.',
    expectedResult:
        'Les Ã©lÃ©ments sÃ©lectionnÃ©s sont supprimÃ©s.',
    steps: [
        <>
            Cliquer sur <strong>SÃ©lectionner</strong> dans la barre d'outils pour activer le mode sÃ©lection.
        </>,
        <>
            Cocher un ou plusieurs Ã©lÃ©ments dans la liste.
        </>,
        <>
            Cliquer sur <strong>Supprimer (n)</strong>.
        </>,
        <>
            Confirmer la suppression si une fenÃªtre de confirmation s'affiche.
        </>,
    ],
    tips: [
        "Le compteur (n) indique le nombre d'Ã©lÃ©ments sÃ©lectionnÃ©s.",
        "DÃ©sactive le mode sÃ©lection pour revenir Ã  la consultation.",
    ],
}
