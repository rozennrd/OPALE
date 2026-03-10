import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import eventPageScreenshot from '../../../assets/tuto/event/page-event-junia.png'

export const actionCreateTutorialContent: TutorialContent = {
    objective:
        "Créer un nouvel élément via le bouton + (hors page Promotions).",
    expectedResult:
        "Le formulaire de création est ouvert et prêt à être rempli.",
    steps: [
        {
            text: (
                <>
                    Sur les pages <strong>Événements</strong>, <strong>Enseignants</strong>,{' '}
                    <strong>Salles</strong> et <strong>Matières</strong>, cliquer sur le bouton{' '}
                    <strong>+</strong> dans la barre d'outils.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: "Bouton d'ajout dans la barre d'outils",
            imageCaption: "Le bouton + ouvre le formulaire de création.",
            imageHighlight: {
                left: '81.3%',
                top: '21.1%',
                width: '13.6%',
                height: '5.85%',
                label: 'Ajouter',
            },
        },
        <>
            Le formulaire de création s'ouvre en mode <strong>Création</strong>.
        </>,
        <>
            Si le bouton est désactivé, la création n'est pas disponible sur cette page.
        </>,
    ],
    tips: [
        "La page Promotions n'utilise pas ces étapes.",
        "Le remplissage détaillé est décrit dans les tutos de page.",
    ],
}
