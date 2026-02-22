import type { TutorialContent } from '../types'
import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
import eventPageScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import teachersPageScreenshot from '../../../assets/tuto/prof/screen-page-prof.png'
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
        'Suivre un flux complet pour generer un planning micro exploitable, avec toutes les ressources et contraintes correctement renseignees.',
    expectedResult:
        'Le planning micro est genere avec des affectations coherentes (promotions, evenements, enseignants, salles, matieres).',
    steps: [
        {
            text: (
                <>
                    Creer chaque <strong>cycle</strong> et chaque <strong>promotion</strong>.
                </>
            ),
            imageSrc: promoPageScreenshot,
            imageAlt: 'Page Promotions pour creer les cycles et promotions',
            imageCaption: 'Creation de la structure de base avant le flux micro.',
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
            imageAlt: 'Pop-up de modification d une promotion',
            imageCaption: 'Le micro requiert une promotion completement renseignee.',
            subSteps: [
                <>
                    Completer les informations principales, groupes, specialites et contraintes academiques.
                </>,
            ],
        },
        {
            text: (
                <>
                    Creer tous les evenements connus a date.
                </>
            ),
            imageSrc: eventPageScreenshot,
            imageAlt: 'Page Evenements pour creer les evenements',
            imageCaption: 'Creation des evenements impactant le flux micro.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.events} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Evenements
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Renseigner les evenements crees avec <strong>tous les champs</strong>.
                </>
            ),
            imageSrc: popupEventModifScreenshot,
            imageAlt: 'Pop-up de modification d evenement',
            imageCaption: 'Le micro requiert des evenements completement qualifies.',
            subSteps: [
                <>
                    Verifier en particulier la cible, les promotions concernees, et les options macro/micro.
                </>,
            ],
        },
        {
            text: (
                <>
                    Creer tous les enseignants necessaires.
                </>
            ),
            imageSrc: teachersPageScreenshot,
            imageAlt: 'Page Enseignants pour creer les enseignants',
            imageCaption: 'Creation des fiches enseignants.',
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
                    Renseigner les enseignants crees avec <strong>tous les champs</strong>.
                </>
            ),
            imageSrc: popupProfModifScreenshot,
            imageAlt: 'Pop-up de modification d un enseignant',
            imageCaption: 'Le micro depend fortement des disponibilites et matieres enseignees.',
            subSteps: [
                <>
                    Completer profil, rattachement, matieres et disponibilites detaillees.
                </>,
            ],
        },
        {
            text: (
                <>
                    Verifier que toutes les salles sont creees, que leur <strong>type principal</strong>,
                    leurs <strong>types secondaires</strong> et leur <strong>disponibilite</strong> sont corrects.
                </>
            ),
            imageSrc: roomsPageScreenshot,
            imageAlt: 'Page Salles pour verifier les informations',
            imageCaption: 'Verification des salles avant generation micro.',
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
                    Si un point de verification salle n est pas valide, faire les modifications necessaires.
                </>
            ),
            imageSrc: popupSalleModifScreenshot,
            imageAlt: 'Pop-up de modification d une salle',
            imageCaption: 'Correction des salles avant generation micro.',
            subSteps: [
                <>
                    Corriger les types, la capacite ou la disponibilite globale selon le besoin.
                </>,
            ],
        },
        {
            text: (
                <>
                    Verifier que les matieres ont bien ete importees, et que les volumes horaires et
                    repartitions sont corrects.
                </>
            ),
            imageSrc: matieresPageScreenshot,
            imageAlt: 'Page Matieres pour verifier les imports et volumes',
            imageCaption: 'Controle des matieres par promotion.',
            subSteps: [
                <>
                    <a href={DOC_LINKS.matieres} target="_blank" rel="noreferrer">
                        Ouvrir le tuto Matieres
                    </a>
                    {' '}dans un nouvel onglet.
                </>,
            ],
        },
        {
            text: (
                <>
                    Depuis la page Matieres, attribuer un ou plusieurs enseignants a chaque matiere et
                    renseigner les volumes horaires par enseignant.
                </>
            ),
            imageSrc: popupMatiereModifScreenshot,
            imageAlt: 'Pop-up de modification d une matiere',
            imageCaption: 'Affectation des enseignants et repartition des volumes TD/TP.',
            subSteps: [
                <>
                    Verifier la coherence entre volumes de la matiere et volumes affectes aux enseignants.
                </>,
            ],
        },
        {
            text: (
                <>
                    Aller sur la page <strong>Planning</strong> puis cliquer sur{' '}
                    <strong>Generer le planning micro</strong>.
                </>
            ),
            subSteps: [
                <>
                    Ouvrir la page planning: <a href="/planning" target="_blank" rel="noreferrer">/planning</a>
                </>,
                <>
                    Si la generation bloque, reprendre la verification dans l ordre du flux ci-dessus.
                </>,
            ],
        },
    ],
    tips: [
        'Executer le flux dans l ordre pour limiter les incoherences de donnees.',
        'Pour le micro, tout champ critique non renseigne peut impacter fortement la generation.',
        'Verifier en priorite promotions, enseignants, salles et matieres avant de relancer un calcul.',
    ],
}

