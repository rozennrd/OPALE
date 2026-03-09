import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
import eventPageScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import teachersPageScreenshot from '../../../assets/tuto/prof/page-prof.png'
import roomsPageScreenshot from '../../../assets/tuto/salle/screen-page-salle.png'
import matieresPageScreenshot from '../../../assets/tuto/matiere/screen-page-matiere.png'
import popupEditPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-modifier-promo.png'
import popupEventModifScreenshot from '../../../assets/tuto/event/screen-pop-up-event-modif.png'
import popupProfModifScreenshot from '../../../assets/tuto/prof/screen-pop-up-prof-modif.png'
import popupSalleModifScreenshot from '../../../assets/tuto/salle/screen-pop-up-salle-modif.png'
import popupMatiereModifScreenshot from '../../../assets/tuto/matiere/screen-pop-up-matiere-modif.png'
import { buildPageTutorialDeepLink } from './docLinks'

const DOC_LINKS = {
    promotions: buildPageTutorialDeepLink('promotions'),
    events: buildPageTutorialDeepLink('events'),
    teachers: buildPageTutorialDeepLink('teachers'),
    rooms: buildPageTutorialDeepLink('rooms'),
    matieres: buildPageTutorialDeepLink('matieres'),
} as const

export const microTutorialContent: TutorialContent = {
    objective:
        'Suivre un flux complet pour générer un planning micro exploitable, avec toutes les ressources et contraintes correctement renseignées.',
    expectedResult:
        'Le planning micro est généré avec des affectations cohérentes (promotions, événements, enseignants, salles, matières).',
    steps: [
        {
            text: (
                <>
                    Créer chaque <strong>cycle</strong> et chaque <strong>promotion</strong>.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour créer les cycles et promotions',
            imageCaption: 'Création de la structure de base avant le flux micro.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.promotions} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Promotions
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les informations de chaque promotion avec <strong>tous les champs</strong>.
                </>
            ),
            imageSrc: popupEditPromotionScreenshot,
            imageAlt: "Pop-up de modification d'une promotion",
            imageCaption: 'Le micro requiert une promotion complètement renseignée.',
            subSteps: [
                <>
                    Compléter les informations principales, groupes, spécialités et contraintes académiques.
                </>,
            ],
        },
        {
            text: (
                <>
                    Créer tous les événements connus à date.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Événements pour créer les événements',
            imageCaption: 'Création des événements impactant le flux micro.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.events} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Événements
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les événements créés avec <strong>tous les champs</strong>.
                </>
            ),
            imageSrc: popupEventModifScreenshot,
            imageAlt: "Pop-up de modification d'événement",
            imageCaption: 'Le micro requiert des événements complètement qualifiés.',
            subSteps: [
                <>
                    Vérifier en particulier la cible, les promotions concernées, et les options macro/micro.
                </>,
            ],
        },
        {
            text: (
                <>
                    Créer tous les enseignants nécessaires.
                </>
            ),
            imageSrc: teachersPageScreenshot,
            imageAlt: 'Page Enseignants pour créer les enseignants',
            imageCaption: 'Création des fiches enseignants.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.teachers} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Enseignants
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les enseignants créés avec <strong>tous les champs</strong>.
                </>
            ),
            imageSrc: popupProfModifScreenshot,
            imageAlt: "Pop-up de modification d'un enseignant",
            imageCaption: 'Le micro dépend fortement des disponibilités et matières enseignées.',
            subSteps: [
                <>
                    Compléter profil, rattachement, matières et disponibilités détaillées.
                </>,
            ],
        },
        {
            text: (
                <>
                    Vérifier que toutes les salles sont créées, que leur <strong>type principal</strong>,
                    leurs <strong>types secondaires</strong> et leur <strong>disponibilité</strong> sont corrects.
                </>
            ),
            imageSrc: roomsPageScreenshot,
            imageAlt: 'Page Salles pour vérifier les informations',
            imageCaption: 'Vérification des salles avant génération micro.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.rooms} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Salles
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Si un point de vérification salle n'est pas valide, faire les modifications nécessaires.
                </>
            ),
            imageSrc: popupSalleModifScreenshot,
            imageAlt: "Pop-up de modification d'une salle",
            imageCaption: 'Correction des salles avant génération micro.',
            subSteps: [
                <>
                    Corriger les types, la capacité ou la disponibilité globale selon le besoin.
                </>,
            ],
        },
        {
            text: (
                <>
                    Vérifier que les matières ont bien été importées, et que les volumes horaires et
                    répartitions sont corrects.
                </>
            ),
            imageSrc: matieresPageScreenshot,
            imageAlt: 'Page Matières pour vérifier les imports et volumes',
            imageCaption: 'Contrôle des matières par promotion.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.matieres} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Matières
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Depuis la page Matières, attribuer un ou plusieurs enseignants à chaque matière et
                    renseigner les volumes horaires par enseignant.
                </>
            ),
            imageSrc: popupMatiereModifScreenshot,
            imageAlt: "Pop-up de modification d'une matière",
            imageCaption: 'Affectation des enseignants et répartition des volumes TD/TP.',
            subSteps: [
                <>
                    Vérifier la cohérence entre volumes de la matière et volumes affectés aux enseignants.
                </>,
            ],
        },
        {
            text: (
                <>
                    Aller sur la page <strong>Planning</strong> puis cliquer sur{' '}
                    <strong>Générer le planning micro</strong>.
                </>
            ),
            subSteps: [
                <>
                    Ouvrir la page planning: <a href="/planning" target="_blank" rel="noreferrer">/planning</a>
                </>,
                <>
                    Si la génération bloque, reprendre la vérification dans l'ordre du flux ci-dessus.
                </>,
            ],
        },
    ],
    tips: [
        "Exécuter le flux dans l'ordre pour limiter les incohérences de données.",
        'Pour le micro, tout champ critique non renseigné peut impacter fortement la génération.',
        'Vérifier en priorité promotions, enseignants, salles et matières avant de relancer un calcul.',
    ],
}


