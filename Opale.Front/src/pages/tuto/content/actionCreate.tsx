import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionCreateTutorialContent: TutorialContent = {
    objective:
        "Créer un nouvel élément via le bouton + (hors page Promotions).",
    expectedResult:
        "Le formulaire de création est ouvert et prêt à être rempli.",
    steps: [
        <>
            Sur les pages <strong>Événements</strong>, <strong>Enseignants</strong>,{' '}
            <strong>Salles</strong> et <strong>Matières</strong>, cliquer sur le bouton <strong>+</strong>
            dans la barre d'outils.
        </>,
        <>
            Le formulaire de création s'ouvre en mode <strong>Création</strong>.
        </>,
        <>
            Si le bouton est désactivé, la création n'est pas disponible sur cette page.
        </>,
    ],
    tips: [
        "La page Promotions n'utilise pas ce flux.",
        "Le remplissage détaillé est décrit dans les tutos de page.",
    ],
}

