import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
import eventPageScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import { buildPageTutorialDeepLink } from './docLinks'

const DOC_LINKS = {
    promotions: buildPageTutorialDeepLink('promotions'),
    events: buildPageTutorialDeepLink('events'),
} as const

export const macroTutorialContent: TutorialContent = {
    objective:
        'Suivre des étapes simples et fiables pour générer un planning macro à partir des données minimales requises.',
    expectedResult:
        'Le planning macro est généré sans blocage majeur, avec des périodes académiques et événements correctement pris en compte.',
    steps: [
        {
            text: (
                <>
                    Créer chaque <strong>cycle</strong> et chaque <strong>promotion</strong> depuis la page
                    Promotions.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour créer cycles et promotions',
            imageCaption: 'Création de la structure de base des promotions.',
            subSteps: [
                <>
                    Prioriser la création de <strong>toutes les promotions cibles</strong> avant de passer aux
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
                    <strong>Nom</strong>, <strong>Date de début</strong>, <strong>Date de fin</strong> et{' '}
                    <strong>contraintes académiques</strong>.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour renseigner les informations minimales',
            imageCaption: 'Saisie des informations minimales nécessaires au planning macro.',
            subSteps: [
                <>
                    Les contraintes académiques (entreprise/vacances, stages, international, partiels,
                    rattrapages) structurent directement le rendu macro.
                </>,
                <>
                    Si ces champs sont incomplets, le résultat macro peut être incohérent.
                </>,
            ],
        },
        {
            text: (
                <>
                    Créer tous les événements connus à date depuis la page Événements.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Événements pour créer les événements',
            imageCaption: 'Création des événements impactant la planification.',
            subSteps: [
                <>
                    Inclure les événements Junia et externes ayant un impact direct ou indirect sur
                    l'organisation.
                </>,
                <>
                    <a href={DOC_LINKS.events} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Événements
                    </a>
                    {' '}dans un nouvel onglet si besoin.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les événements créés, au minimum: <strong>Nom</strong>,{' '}
                    <strong>Date de début</strong>, <strong>Date de fin</strong>, <strong>Cible</strong>, et
                    vérifier que l'affichage <strong>Macro planning</strong> est actif.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Événements pour compléter les informations minimales',
            imageCaption: 'Validation des champs minimaux nécessaires à la génération macro.',
            subSteps: [
                <>
                    Un événement mal ciblé ou non activé pour le macro peut ne pas remonter correctement dans
                    la génération.
                </>,
            ],
        },
        {
            text: (
                <>
                    Aller sur la page <strong>Planning</strong> puis cliquer sur{' '}
                    <strong>Générer le planning macro</strong>.
                </>
            ),
            subSteps: [
                <>
                    Ouvrir la page planning: <a href="/planning" target="_blank" rel="noreferrer">/planning</a>
                </>,
                <>
                    Si la génération échoue, revenir vérifier en priorité les promotions et événements.
                </>,
            ],
        },
    ],
    tips: [
        "Valider d'abord la qualité des promotions avant de multiplier les événements.",
        'Ne pas lancer la génération macro tant que les contraintes académiques ne sont pas complètes.',
    ],
}


