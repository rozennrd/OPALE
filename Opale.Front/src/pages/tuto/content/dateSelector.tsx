import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const dateSelectorTutorialContent: TutorialContent = {
    objective:
        'Saisir une date avec ou sans heures/minutes via le sÃ©lecteur de date.',
    expectedResult:
        'La date est correctement sÃ©lectionnÃ©e et affichÃ©e dans le champ.',
    steps: [],
    stepSections: [
        {
            title: 'SÃ©lecteur de date (sans heure)',
            steps: [
                <>
                    Cliquer sur le <strong>champ de date</strong> ou l'icÃ´ne calendrier pour ouvrir le
                    sÃ©lecteur.
                </>,
                <>
                    Naviguer entre les mois avec les flÃ¨ches <strong>prÃ©cÃ©dent</strong> et <strong>suivant</strong>.
                </>,
                <>
                    Cliquer sur un jour pour sÃ©lectionner la date (le sÃ©lecteur se ferme automatiquement).
                </>,
                <>
                    Les actions <strong>Aujourd'hui</strong>, <strong>Effacer</strong> et <strong>Valider</strong>
                    restent disponibles dans le pied de page.
                </>,
            ],
        },
        {
            title: 'SÃ©lecteur date + heure',
            steps: [
                <>
                    Cliquer sur le <strong>champ date/heure</strong> pour ouvrir le sÃ©lecteur.
                </>,
                <>
                    SÃ©lectionner la <strong>date</strong>, puis choisir l'<strong>heure</strong> et les
                    <strong> minutes</strong> dans la colonne dÃ©diÃ©e.
                </>,
                <>
                    Cliquer sur <strong>Valider</strong> pour fermer le sÃ©lecteur et enregistrer.
                </>,
            ],
        },
    ],
    tips: [
        'Le format affichÃ© est jj/mm/aaaa (ou jj/mm/aaaa hh:mm).',
        "Effacer supprime la valeur, Aujourd'hui positionne la date du jour.",
        'Certaines dates/heures peuvent Ãªtre dÃ©sactivÃ©es par des limites min/max.',
    ],
}

