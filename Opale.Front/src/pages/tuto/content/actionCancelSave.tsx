import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionCancelSaveTutorialContent: TutorialContent = {
    objective:
        'Annuler ou enregistrer une fiche en crÃ©ation ou modification.',
    expectedResult:
        'Les changements sont soit enregistrÃ©s, soit abandonnÃ©s proprement.',
    steps: [
        <>
            Cliquer sur <strong>Annuler</strong> pour fermer la fiche sans sauvegarder.
        </>,
        <>
            Cliquer sur <strong>Enregistrer</strong> ou <strong>CrÃ©er</strong> pour valider les modifications.
        </>,
        <>
            Si une fenÃªtre de confirmation apparaÃ®t, choisir l'option adaptÃ©e (enregistrer ou fermer sans enregistrer).
        </>,
    ],
    tips: [
        "Une confirmation peut s'afficher si des modifications ne sont pas sauvegardÃ©es.",
        "Les libellÃ©s peuvent varier selon la page (CrÃ©er, Enregistrer).",
    ],
}
