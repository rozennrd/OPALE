import type { TutorialContent } from '../types'
import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
import eventPageScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import { buildPageTutorialDeepLink } from './docLinks'

const DOC_LINKS = {
    promotions: buildPageTutorialDeepLink('promotions'),
    events: buildPageTutorialDeepLink('events'),
} as const

export const macroTutorialContent: TutorialContent = {
    objective:
        'Suivre un flux simple et fiable pour generer un planning macro a partir des donnees minimales requises.',
    expectedResult:
        'Le planning macro est genere sans blocage majeur, avec des periodes academiques et evenements correctement pris en compte.',
    steps: [
        {
            text: (
                <>
                    Creer chaque <strong>cycle</strong> et chaque <strong>promotion</strong> depuis la page
                    Promotions.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour creer cycles et promotions',
            imageCaption: 'Creation de la structure de base des promotions.',
            subSteps: [
                <>
                    Prioriser la creation de <strong>toutes les promotions cibles</strong> avant de passer aux
                    autres pages.
                </>,
                <>
                    <a href={DOC_LINKS.promotions} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Promotions
                    </a>
                    {' '}dans un nouvel onglet si besoin.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les informations de chaque promotion, au minimum:{' '}
                    <strong>Nom</strong>, <strong>Date de debut</strong>, <strong>Date de fin</strong> et{' '}
                    <strong>contraintes academiques</strong>.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour renseigner les informations minimales',
            imageCaption: 'Saisie des informations minimales necessaires au planning macro.',
            subSteps: [
                <>
                    Les contraintes academiques (entreprise/vacances, stages, international, partiels,
                    rattrapages) structurent directement le rendu macro.
                </>,
                <>
                    Si ces champs sont incomplets, le resultat macro peut etre incoherent.
                </>,
            ],
        },
        {
            text: (
                <>
                    Creer tous les evenements connus a date depuis la page Evenements.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Evenements pour creer les evenements',
            imageCaption: 'Creation des evenements impactant la planification.',
            subSteps: [
                <>
                    Inclure les evenements Junia et externes ayant un impact direct ou indirect sur
                    l organisation.
                </>,
                <>
                    <a href={DOC_LINKS.events} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Evenements
                    </a>
                    {' '}dans un nouvel onglet si besoin.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les evenements crees, au minimum: <strong>Nom</strong>,{' '}
                    <strong>Date de debut</strong>, <strong>Date de fin</strong>, <strong>Cible</strong>, et
                    verifier que l affichage <strong>Macro planning</strong> est actif.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Evenements pour completer les informations minimales',
            imageCaption: 'Validation des champs minimaux necessaires au flux macro.',
            subSteps: [
                <>
                    Un evenement mal cible ou non active pour le macro peut ne pas remonter correctement dans
                    la generation.
                </>,
            ],
        },
        {
            text: (
                <>
                    Aller sur la page <strong>Planning</strong> puis cliquer sur{' '}
                    <strong>Generer le planning macro</strong>.
                </>
            ),
            subSteps: [
                <>
                    Ouvrir la page planning: <a href="/planning" target="_blank" rel="noreferrer">/planning</a>
                </>,
                <>
                    Si la generation echoue, revenir verifier en priorite les promotions et evenements.
                </>,
            ],
        },
    ],
    tips: [
        'Valider d abord la qualite des promotions avant de multiplier les evenements.',
        'Ne pas lancer la generation macro tant que les contraintes academiques ne sont pas completes.',
    ],
}

