import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import eventPageScreenshot from '../../../assets/tuto/event/page-event-junia.png'

export const actionSearchFilterTutorialContent: TutorialContent = {
    objective:
        'Rechercher et filtrer rapidement une liste.',
    expectedResult:
        'La liste affichée correspond aux critères choisis.',
    steps: [
        {
            text: (
                <>
                    Sur la première ligne de la toolbar (plein écran), on trouve toujours la{' '}
                    <strong>barre de recherche</strong>, le <strong>mode sélection</strong>,{' '}
                    <strong>réinitialiser les filtres</strong> et <strong>ajouter un élément</strong>.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Première ligne de la toolbar',
            imageCaption: 'Recherche, sélection, réinitialisation et ajout.',
            imageHighlight: {
                left: '24.8%',
                top: '21.2%',
                width: '70.0%',
                height: '6.1%',
                label: 'Toolbar',
            },
        },
        {
            text: (
                <>
                    Sur la seconde ligne (plein écran), on retrouve des <strong>filtres adaptés</strong> à la
                    page (droplist, chips, date, champ...).
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Seconde ligne de la toolbar',
            imageCaption: 'Filtres adaptés à la page.',
            imageHighlight: {
                left: '24.8%',
                top: '27.2%',
                width: '70.0%',
                height: '7.6%',
                label: 'Filtres',
            },
        },
    ],
    tips: [
        'Les filtres peuvent être combinés pour affiner les résultats.',
        "La recherche et les filtres s'appliquent en temps réel.",
    ],
}

