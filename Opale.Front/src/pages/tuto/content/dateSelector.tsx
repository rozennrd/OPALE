import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import calendarScreenshot from '../../../assets/tuto/action-common/action-common-calendar.png'
import calendarWithHoursScreenshot from '../../../assets/tuto/action-common/action-common-calendar_with_hours.png'

export const dateSelectorTutorialContent: TutorialContent = {
    objective:
        'Saisir une date avec ou sans heures/minutes via le sélecteur de date.',
    expectedResult:
        'La date est correctement sélectionnée et affichée dans le champ.',
    steps: [],
    stepSections: [
        {
            title: 'Sélecteur de date (sans heure)',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur le <strong>champ de date</strong> ou l'icône calendrier pour ouvrir le
                            sélecteur.
                        </>
                    ),
                    imageSrc: calendarScreenshot,
                    imageAlt: 'Champ de date avec icône calendrier',
                    imageCaption: "Ouverture du sélecteur de date.",
                    imageHighlight: {
                        left: '24.8%',
                        top: '29.1%',
                        width: '14%',
                        height: '5.3%',
                        label: 'Calendrier',
                    },
                },
                {
                    text: (
                        <>
                            Naviguer entre les mois avec les flèches <strong>précédent</strong> et{' '}
                            <strong>suivant</strong>.
                        </>
                    ),
                    imageSrc: calendarScreenshot,
                    imageAlt: 'En-tête du sélecteur avec navigation',
                    imageCaption: 'Navigation entre les mois.',
                    imageHighlight: {
                        left: '25.5%',
                        top: '34.5%',
                        width: '15.2%',
                        height: '4.7%',
                        label: 'Mois',
                    },
                },
                {
                    text: (
                        <>
                            Cliquer sur un jour pour sélectionner la date (le sélecteur se ferme
                            automatiquement).
                        </>
                    ),
                    imageSrc: calendarScreenshot,
                    imageAlt: 'Grille des jours du mois',
                    imageCaption: "Sélection d'une date.",
                    imageHighlight: {
                        left: '25.5%',
                        top: '38.4%',
                        width: '15.2%',
                        height: '26.5%',
                        label: 'Jours',
                    },
                },
                {
                    text: (
                        <>
                            Les actions <strong>Aujourd'hui</strong>, <strong>Effacer</strong> et{' '}
                            <strong>Valider</strong> restent disponibles dans le pied de page.
                        </>
                    ),
                    imageSrc: calendarScreenshot,
                    imageAlt: 'Actions du sélecteur de date',
                    imageCaption: 'Actions disponibles en bas du sélecteur.',
                    imageHighlight: {
                        left: '25.5%',
                        top: '64.6%',
                        width: '16.0%',
                        height: '4.5%',
                        label: 'Actions',
                    },
                },
            ],
        },
        {
            title: 'Sélecteur de date + heure',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur le <strong>champ date/heure</strong> pour ouvrir le sélecteur.
                        </>
                    ),
                    imageSrc: calendarWithHoursScreenshot,
                    imageAlt: 'Champ date/heure',
                    imageCaption: "Ouverture du sélecteur date + heure.",
                    imageHighlight: {
                        left: '31.7%',
                        top: '39.8%',
                        width: '20.8%',
                        height: '5.2%',
                        label: 'Date/heure',
                    },
                },
                {
                    text: (
                        <>
                            Sélectionner la <strong>date</strong>, puis choisir l'<strong>heure</strong> et les{' '}
                            <strong>minutes</strong> dans la colonne dédiée.
                        </>
                    ),
                    imageSrc: calendarWithHoursScreenshot,
                    imageAlt: 'Sélecteur avec colonnes heure et minutes',
                    imageCaption: 'Sélection de la date et de l’heure.',
                    imageHighlight: {
                        left: '46.9%',
                        top: '45.6%',
                        width: '13.75%',
                        height: '32.5%',
                        label: 'Heure / Min',
                    },
                },
                {
                    text: (
                        <>
                            Les actions <strong>Aujourd'hui</strong>, <strong>Effacer</strong> et{' '}
                            <strong>Valider</strong> restent disponibles dans le pied de page.
                        </>
                    ),
                    imageSrc: calendarWithHoursScreenshot,
                    imageAlt: 'Actions du sélecteur date + heure',
                    imageCaption: 'Actions disponibles en bas du sélecteur.',
                    imageHighlight: {
                        left: '32.5%',
                        top: '77.7%',
                        width: '28.2%',
                        height: '3.95%',
                        label: 'Actions',
                    },
                },
            ],
        },
    ],
    tips: [
        <>
            <strong>Format</strong> : jj/mm/aaaa (ou jj/mm/aaaa hh:mm).
        </>,
        <>
            <strong>Boutons</strong> : <strong>Effacer</strong> supprime la valeur,{' '}
            <strong>Aujourd'hui</strong> sélectionne la date du jour.
        </>,
        <>
            <strong>Début / fin</strong> : si une date de début et une date de fin sont liées, une date de fin
            antérieure à la date de début (et inversement) n'est pas autorisée, y compris pour les heures et
            minutes.
        </>,
        <>
            <strong>Limites</strong> : certaines dates/heures peuvent être désactivées par des limites min/max.
        </>,
    ],
}
