import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionCancelSaveTutorialContent: TutorialContent = {
    objective:
        'Annuler ou enregistrer/créer une fiche en création ou modification.',
    expectedResult:
        'Les changements sont soit enregistrés, soit abandonnés proprement.',
    steps: [
        <>
            Utiliser la <strong>croix</strong> en haut à droite pour annuler la fiche sans sauvegarder.
        </>,
        <>
            La touche <strong>Escape</strong> du clavier fait la même action.
        </>,
        <>
            Quand il est présent, le bouton <strong>Annuler</strong> ferme aussi la fiche sans sauvegarder.
        </>,
        <>
            Cliquer sur <strong>Enregistrer</strong> ou <strong>Créer</strong> pour valider les modifications.
        </>,
        <>
            Si une fenêtre de confirmation apparaît, choisir l'option adaptée (enregistrer ou fermer sans enregistrer).
        </>,
    ],
    tips: [
        "Une confirmation peut s'afficher si des modifications ne sont pas sauvegardées.",
        "Les libellés peuvent varier selon la page (Créer, Enregistrer).",
        "Le bouton Annuler n'est pas toujours présent selon la page.",
    ],
}


