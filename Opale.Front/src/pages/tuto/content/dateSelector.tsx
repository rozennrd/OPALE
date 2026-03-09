import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

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
                <>
                    Cliquer sur le <strong>champ de date</strong> ou l'icône calendrier pour ouvrir le
                    sélecteur.
                </>,
                <>
                    Naviguer entre les mois avec les flèches <strong>précédent</strong> et <strong>suivant</strong>.
                </>,
                <>
                    Cliquer sur un jour pour sélectionner la date (le sélecteur se ferme automatiquement).
                </>,
                <>
                    Les actions <strong>Aujourd'hui</strong>, <strong>Effacer</strong> et <strong>Valider</strong>
                    restent disponibles dans le pied de page.
                </>,
            ],
        },
        {
            title: 'Sélecteur de date + heure',
            steps: [
                <>
                    Cliquer sur le <strong>champ date/heure</strong> pour ouvrir le sélecteur.
                </>,
                <>
                    Sélectionner la <strong>date</strong>, puis choisir l'<strong>heure</strong> et les
                    <strong> minutes</strong> dans la colonne dédiée.
                </>,
                <>
                    Cliquer sur <strong>Valider</strong> pour fermer le sélecteur et enregistrer.
                </>,
            ],
        },
    ],
    tips: [
        'Le format affiché est jj/mm/aaaa (ou jj/mm/aaaa hh:mm).',
        "Effacer supprime la valeur, Aujourd'hui positionne la date du jour.",
        'Certaines dates/heures peuvent être désactivées par des limites min/max.',
    ],
}


