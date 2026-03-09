import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionDeleteSelectionTutorialContent: TutorialContent = {
    objective:
        'Supprimer un ou plusieurs éléments.',
    expectedResult:
        'Les éléments ciblés sont supprimés.',
    steps: [
        <>
            <strong>Suppression en mode sélection</strong> : cliquer sur <strong>Sélectionner</strong> dans la barre d'outils.
        </>,
        <>
            Cocher un ou plusieurs éléments dans la liste, puis cliquer sur <strong>Supprimer (n)</strong>.
        </>,
        <>
            Confirmer la suppression si une fenêtre de confirmation s'affiche.
        </>,
        <>
            <strong>Suppression depuis une fiche</strong> : quand c'est disponible, cliquer sur
            <strong> Supprimer</strong> dans la fiche de détail.
        </>,
    ],
    tips: [
        'Disponible sur : Événements, Enseignants, Salles, Matières.',
        "Le compteur (n) indique le nombre d'éléments sélectionnés.",
        'Désactiver le mode sélection pour revenir à la consultation.',
    ],
}

