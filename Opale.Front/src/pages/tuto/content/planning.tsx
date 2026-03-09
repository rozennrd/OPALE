import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPagePlanningScreenshot from '../../../assets/tuto/planning/page-planning.png'
import screenPagePlanningDownloadScreenshot from '../../../assets/tuto/planning/page-planning-download.png'
import screenPagePlanningDownloadDoScreenshot from '../../../assets/tuto/planning/page-planning-download-do.png'

export const planningTutorialContent: TutorialContent = {
    objective: "Accompagner l'utilisateur avec une checklist et guider la génération du planning demandé.",
    expectedResult: 'Planning demandé généré (macro et/ou micro).',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la page Planning',
            steps: [
                {
                    text: (
                        <>
                            La page Planning est organisée en <strong>deux colonnes</strong>:{' '}
                            <strong>Macro</strong> et <strong>Micro</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningScreenshot,
                    imageAlt: 'Vue générale de la page Planning',
                    imageCaption: 'Checklist macro et micro avec sections dépliantes.',
                },
                <>
                    Chaque colonne présente une <strong>checklist</strong> pour sécuriser les prérequis
                    de génération.
                </>,
                <>
                    Les checklists sont découpées en <strong>sections dépliantes</strong>, une section
                    par page (Promotions, Événements, Enseignants, etc.).
                </>,
            ],
        },
        {
            title: 'Générer un planning macro',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur le bouton <strong>Générer le planning macro</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningScreenshot,
                    imageAlt: 'Bouton Générer le planning macro',
                    imageCaption: 'Le bouton lance la génération macro.',
                },
                <>
                    Attendre quelques instants pendant la génération.
                </>,
                {
                    text: (
                        <>
                            Une fois la génération terminée, cliquer sur <strong>Télécharger le fichier</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningDownloadScreenshot,
                    imageAlt: 'Bouton Télécharger le fichier',
                    imageCaption: 'Le bouton de téléchargement apparaît après la génération.',
                },
                {
                    text: (
                        <>
                            Le fichier est téléchargé. Il est accessible dans le dossier{' '}
                            <strong>Téléchargements</strong> ou dans les téléchargements du navigateur.
                        </>
                    ),
                    imageSrc: screenPagePlanningDownloadDoScreenshot,
                    imageAlt: 'Téléchargement du fichier macro',
                    imageCaption: 'Le fichier généré est disponible dans les téléchargements.',
                },
            ],
        },
        {
            title: 'Générer un planning micro',
            steps: [
                <>
                    Non disponible pour le moment.
                </>,
            ],
        },
    ],
    tips: [
        'Les checklists sont présentes à titre indicatif.',
        'Les checklists sont découpées par sections dépliantes, une section par page.',
        'La génération du planning macro est actuellement indisponible.',
    ],
}


