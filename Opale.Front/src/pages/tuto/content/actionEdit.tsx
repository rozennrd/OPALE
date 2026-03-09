import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import eventPageScreenshot from '../../../assets/tuto/event/page-event-junia.png'

export const actionEditTutorialContent: TutorialContent = {
    objective:
        'Modifier un élément existant depuis la liste.',
    expectedResult:
        "La fiche détail est ouverte en mode édition.",
    steps: [
        {
            text: (
                <>
                    Sur les pages <strong>Événements</strong>, <strong>Enseignants</strong>,{' '}
                    <strong>Salles</strong> et <strong>Matières</strong>, cliquer sur la carte ou la ligne de
                    l'élément à modifier.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Carte événement dans la liste',
            imageCaption: "Cliquer sur une carte ouvre la fiche de détail.",
            imageHighlight: {
                left: '24%',
                top: '40%',
                width: '58%',
                height: '10%',
                label: 'Événement',
            },
        },
        <>
            La fiche détail s'ouvre et permet de modifier les informations.
        </>,
    ],
    tips: [
        "Si le mode Sélectionner est actif, cliquer sur l'élément sélectionné au lieu d'ouvrir la fiche.",
        "Désactiver le mode Sélectionner pour éditer.",
    ],
}

