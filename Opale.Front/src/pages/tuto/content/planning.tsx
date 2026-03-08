import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPagePlanningScreenshot from '../../../assets/tuto/planning/screen-page-planning.png'
import screenPagePlanningDownloadScreenshot from '../../../assets/tuto/planning/screen-page-planning-download.png'
import screenPagePlanningDownloadDoScreenshot from '../../../assets/tuto/planning/screen-page-planning-download-do.png'

export const planningTutorialContent: TutorialContent = {
    objective: "Accompagner l'utilisateur avec une checklist et guider la gÃ©nÃ©ration du planning demandÃ©.",
    expectedResult: 'Planning demandÃ© gÃ©nÃ©rÃ© (macro et/ou micro).',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la page Planning',
            steps: [
                {
                    text: (
                        <>
                            La page Planning est organisÃ©e en <strong>deux colonnes</strong>:{' '}
                            <strong>Macro</strong> et <strong>Micro</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningScreenshot,
                    imageAlt: 'Vue gÃ©nÃ©rale de la page Planning',
                    imageCaption: 'Checklist macro et micro avec sections dÃ©pliantes.',
                },
                <>
                    Chaque colonne prÃ©sente une <strong>checklist</strong> pour sÃ©curiser les prÃ©requis
                    de gÃ©nÃ©ration.
                </>,
                <>
                    Les checklists sont dÃ©coupÃ©es en <strong>sections dÃ©pliantes</strong>, une section
                    par page (Promotions, Ã‰vÃ©nements, Enseignants, etc.).
                </>,
            ],
        },
        {
            title: 'GÃ©nÃ©rer un planning macro',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur le bouton <strong>GÃ©nÃ©rer le planning macro</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningScreenshot,
                    imageAlt: 'Bouton GÃ©nÃ©rer le planning macro',
                    imageCaption: 'Le bouton lance la gÃ©nÃ©ration macro.',
                },
                <>
                    Attendre quelques instants pendant la gÃ©nÃ©ration.
                </>,
                {
                    text: (
                        <>
                            Une fois la gÃ©nÃ©ration terminÃ©e, cliquer sur <strong>TÃ©lÃ©charger le fichier</strong>.
                        </>
                    ),
                    imageSrc: screenPagePlanningDownloadScreenshot,
                    imageAlt: 'Bouton TÃ©lÃ©charger le fichier',
                    imageCaption: 'Le bouton de tÃ©lÃ©chargement apparaÃ®t aprÃ¨s la gÃ©nÃ©ration.',
                },
                {
                    text: (
                        <>
                            Le fichier est tÃ©lÃ©chargÃ©. Il est accessible dans le dossier{' '}
                            <strong>TÃ©lÃ©chargements</strong> ou dans les tÃ©lÃ©chargements du navigateur.
                        </>
                    ),
                    imageSrc: screenPagePlanningDownloadDoScreenshot,
                    imageAlt: 'TÃ©lÃ©chargement du fichier macro',
                    imageCaption: 'Le fichier gÃ©nÃ©rÃ© est disponible dans les tÃ©lÃ©chargements.',
                },
            ],
        },
        {
            title: 'GÃ©nÃ©rer un planning micro',
            steps: [
                <>
                    Non disponible pour le moment.
                </>,
            ],
        },
    ],
    tips: [
        'Les checklists sont prÃ©sentes Ã  titre indicatif.',
        'Les checklists sont dÃ©coupÃ©es par sections dÃ©pliantes, une section par page.',
        'La gÃ©nÃ©ration du planning macro est actuellement indisponible.',
    ],
}

