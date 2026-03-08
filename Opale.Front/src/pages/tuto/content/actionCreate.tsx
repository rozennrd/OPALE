import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionCreateTutorialContent: TutorialContent = {
    objective:
        "CrÃ©er un nouvel Ã©lÃ©ment via le bouton + (hors page Promotions).",
    expectedResult:
        "Le formulaire de crÃ©ation est ouvert et prÃªt Ã  Ãªtre rempli.",
    steps: [
        <>
            Sur les pages <strong>Ã‰vÃ©nements</strong>, <strong>Enseignants</strong>,{' '}
            <strong>Salles</strong> et <strong>MatiÃ¨res</strong>, cliquer sur le bouton <strong>+</strong>
            dans la barre d'outils.
        </>,
        <>
            Le formulaire de crÃ©ation s'ouvre en mode <strong>CrÃ©ation</strong>.
        </>,
        <>
            Si le bouton est dÃ©sactivÃ©, la crÃ©ation n'est pas disponible sur cette page.
        </>,
    ],
    tips: [
        "La page Promotions n'utilise pas ce flux.",
        "Le remplissage dÃ©taillÃ© est dÃ©crit dans les tutos de page.",
    ],
}
