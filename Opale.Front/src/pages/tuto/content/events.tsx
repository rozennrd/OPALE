import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import pageEventJuniaScreenshot from '../../../assets/tuto/event/page-event-junia.png'
import pageEventJuniaAddScreenshot from '../../../assets/tuto/event/page-event-junia-add.png'
import pageEventExterneAddScreenshot from '../../../assets/tuto/event/page-event-externe-add.png'
import pageEventJuniaUpdateScreenshot from '../../../assets/tuto/event/page-event-junia-update.png'
import pageEventJuniaDroplistSalleScreenshot from '../../../assets/tuto/event/page-event-junia-droplist-salle.png'
import pageEventJuniaDroplistTypeScreenshot from '../../../assets/tuto/event/page-event-junia-droplist-type.png'
import pageEventJuniaDroplistPromoScreenshot from '../../../assets/tuto/event/page-event-junia-droplist-promo.png'

export const eventsTutorialContent: TutorialContent = {
    objective:
        "Consulter et administrer les événements exceptionnels qui impactent directement ou indirectement l'école (Junia).",
    expectedResult:
        'Les événements sont fiables, filtrés facilement, et correctement créés, modifiés ou supprimés.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Événements affiche une <strong>vue consolidée</strong> des événements{' '}
                            <strong>Junia</strong> et <strong>externes</strong>, regroupés par mois.
                        </>
                    ),
                    imageSrc: pageEventJuniaScreenshot,
                    imageAlt: 'Vue générale de la page Événements dans OPALE',
                    imageCaption:
                        'Vue générale avec toolbar de recherche/filtrage et liste des événements.',
                },
                <>
                    La toolbar en haut centralise les actions: <strong>recherche</strong>,{' '}
                    <strong>filtres</strong>, <strong>création</strong> et{' '}
                    <strong>suppression en mode sélection</strong>.
                </>,
                <>
                    Chaque ligne d'événement contient les <strong>informations principales</strong>: nom,
                    date, lieu et type d'événement.
                </>,
                <>
                    Cliquer sur un événement donne accès à ses <strong>informations détaillées</strong>.
                </>,
            ],
        },
        {
            title: 'Créer un événement',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>+</strong> dans la toolbar pour ouvrir le pop-up de{' '}
                            <u>création d'un événement</u>.
                        </>
                    ),
                    imageSrc: pageEventJuniaScreenshot,
                    imageAlt: "Bouton + de création d'un événement",
                    imageCaption: "Le bouton + ouvre le pop-up de création d'un événement.",
                    imageHighlight: {
                        left: '81.8%',
                        top: '22.3%',
                        width: '12.4%',
                        height: '3.9%',
                        label: 'Créer un événement',
                        labelLeft: '-5rem',
                        labelTop: '-0.5rem',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner le pop-up <strong>Nouvel événement</strong>. Ce formulaire est aussi
                            réutilisé dans le tutoriel de <strong>modification</strong>.
                        </>
                    ),
                    imageSrc: pageEventJuniaAddScreenshot,
                    imageAlt: "Pop-up de création/modification d'événement",
                    imageCaption: "Formulaire de création/modification d'événement.",
                    imagePlacement: 'beforeSubSteps',
                    subSteps: [
                        <>
                            <strong>Nom</strong>: saisir un intitulé clair et reconnaissable (ex: Journée
                            Portes Ouvertes, Forum Entreprises).
                        </>,
                        <>
                            <strong>Date de début</strong> et <strong>Date de fin</strong>: définir la plage
                            réelle de l'événement. Vérifier la cohérence chronologique (
                            <em>fin &gt;= début</em>).
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                        </>,
                        {
                            text: (
                                <>
                                    <strong>Salle / Lieu</strong>: préciser le lieu principal (campus, salle,
                                    adresse ou site externe) pour faciliter l'organisation.
                                </>
                            ),
                            imageSrc: pageEventJuniaDroplistSalleScreenshot,
                            imageAlt: "Sélection de la salle ou du lieu de l'événement",
                            imageCaption: "Liste déroulante des salles/lieux disponibles.",
                        },
                        {
                            text: (
                                <>
                                    <strong>Type</strong>: choisir la catégorie de l'événement (ex: salon/expo,
                                    journée portes ouvertes, forum, autre événement).
                                </>
                            ),
                            imageSrc: pageEventJuniaDroplistTypeScreenshot,
                            imageAlt: "Sélection du type d'événement",
                            imageCaption: "Liste déroulante des types d'événement.",
                        },
                        {
                            text: (
                                <>
                                    <strong>Cible</strong>: sélectionner <em>Junia</em> et/ou <em>Externe</em>{' '}
                                    selon le public concerné.
                                    <br />
                                    Si la cible est <strong>Junia</strong>, l'en-tête de la carte est{' '}
                                    <strong>violet</strong>. Si la cible est <strong>Externe</strong>, l'en-tête
                                    de la carte est <strong>bleu</strong>.
                                </>
                            ),
                            imageSrc: pageEventExterneAddScreenshot,
                            imageAlt: "Sélection de la cible de l'événement",
                            imageCaption: "La couleur de l'en-tête varie selon la cible choisie.",
                        },
                        {
                            text: (
                                <>
                                    <strong>Promotions</strong>: rattacher les promotions impactées. Si
                                    l'événement est global, ce champ n'est pas affiché.
                                </>
                            ),
                            imageSrc: pageEventJuniaDroplistPromoScreenshot,
                            imageAlt: "Sélection des promotions concernées",
                            imageCaption: "Liste déroulante des promotions impactées.",
                        },
                        <>
                            <strong>Macro planning</strong> / <strong>Micro planning</strong>: activer selon
                            l'impact attendu dans les plannings.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: documenter le contexte, les objectifs
                            et les contraintes utiles pour l'équipe.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur la <strong>croix</strong> en haut à droite ou appuyer sur{' '}
                            <strong>Escape</strong> pour annuler la création. Cette action ouvre un pop-up de
                            confirmation.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler ou enregistrer/créer</strong>.
                        </>
                    ),
                    subSteps: [
                        <>
                            Cliquer sur la <strong>croix</strong> en haut à droite ou appuyer sur{' '}
                            <strong>Escape</strong> annule la fermeture et renvoie sur la{' '}
                            <strong>carte de détail de création</strong> en conservant les informations.
                        </>,
                        <>
                            Cliquer sur <strong>Fermer sans créer</strong> ferme la carte de détail de création
                            sans créer l'événement.
                        </>,
                        <>
                            Cliquer sur <strong>Fermer et créer</strong> ferme la carte de détail de création
                            et crée l'événement.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Créer</strong> pour créer le nouvel événement. Cette action
                            ouvre un pop-up de confirmation.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler ou enregistrer/créer</strong>.
                        </>
                    ),
                    subSteps: [
                        <>
                            Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite ou{' '}
                            <strong>Escape</strong> renvoie sur le pop-up de création en conservant les
                            informations saisies.
                        </>,
                        <>
                            Cliquer sur <strong>Créer</strong> crée l'événement et ferme le pop-up de création.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Modifier un événement',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la ligne de l'événement à modifier pour ouvrir le pop-up d'édition.
                        </>
                    ),
                    imageSrc: pageEventJuniaScreenshot,
                    imageAlt: "Accès à la modification d'un événement",
                    imageCaption: "La ligne événement ouvre le pop-up de modification.",
                    imageHighlight: {
                        left: '25.0%',
                        top: '38.0%',
                        width: '70.0%',
                        height: '8.0%',
                        label: 'Événement à modifier',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up de modification reprend les <strong>mêmes champs</strong> que la création,
                            avec des valeurs déjà renseignées. Mettre à jour uniquement ce qui a évolué.
                        </>
                    ),
                    imageSrc: pageEventJuniaUpdateScreenshot,
                    imageAlt: "Pop-up de modification d'événement",
                    imageCaption: 'Même formulaire que la création, utilisé en édition.',
                    imagePlacement: 'beforeSubSteps',
                    subSteps: [
                        <>
                            <strong>Nom</strong>: ajuster l'intitulé si l'événement change de format ou de
                            périmètre.
                        </>,
                        <>
                        <strong>Date de début</strong> et <strong>Date de fin</strong>: corriger les dates en
                        cas de décalage ou d'extension de période.
                        <br />
                        <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                    </>,
                        <>
                            <strong>Salle / Lieu</strong>: actualiser la localisation si besoin logistique.
                        </>,
                        <>
                            <strong>Type</strong>: vérifier que la catégorie reste conforme à la nature de
                            l'événement.
                        </>,
                        <>
                            <strong>Cible</strong>: revalider <em>Junia</em> / <em>Externe</em> selon les publics
                            impactés.
                        </>,
                        <>
                            <strong>Promotions</strong>: ajouter/retirer les promotions concernées pour garder un
                            impact planning fiable.
                        </>,
                        <>
                            <strong>Macro planning</strong> / <strong>Micro planning</strong>: confirmer que les
                            activations correspondent toujours au besoin réel.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: mettre à jour les informations
                            opérationnelles (objectifs, contraintes, contexte).
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Supprimer</strong> ou <strong>Enregistrer</strong> selon le
                            résultat souhaité.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Supprimer</strong>: supprime l'événement affiché à l'écran. Cette
                                    action ouvre un pop-up de confirmation.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                                </>
                            ),
                            subSteps: [
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut à
                                    droite ou <strong>Escape</strong> annule la suppression et renvoie sur la{' '}
                                    <strong>carte de détail de modification</strong> en conservant les
                                    informations saisies.
                                </>,
                                <>
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement l'événement.
                                </>,
                            ],
                        },
                        {
                            text: (
                                <>
                                    <strong>Enregistrer</strong>: enregistre les modifications. Cette action
                                    ouvre un pop-up de confirmation.
                                    <br />
                                    <em>Action commune</em> : voir le tuto{' '}
                                    <strong>Annuler ou enregistrer/créer</strong>.
                                </>
                            ),
                            subSteps: [
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut à
                                    droite ou <strong>Escape</strong> renvoie sur la{' '}
                                    <strong>carte de détail de modification</strong> en conservant les
                                    informations saisies.
                                </>,
                                <>
                                    Cliquer sur <strong>Enregistrer</strong> enregistre l'événement et ferme le
                                    pop-up de modification.
                                </>,
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Supprimer un événement',
            steps: [
                {
                    text: (
                        <>
                            La suppression des événements se fait en <strong>mode sélection</strong> depuis la
                            toolbar, ou depuis la <strong>carte de détail</strong> d'un événement en
                            modification.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                        </>
                    ),
                    imageSrc: pageEventJuniaScreenshot,
                    imageAlt: "Mode suppression d'événements",
                    imageCaption:
                        'Mode sélection avec actions de suppression en lot (Supprimer n).',
                },
            ],
        },
        {
            title: "Utiliser la barre d'outils",
            steps: [
                {
                    text: (
                        <>
                            La barre d'outils contient :
                            <ul>
                                <li>
                                    <strong>Recherche</strong> d'événement.
                                </li>
                                <li>
                                    <strong>Sélectionner / Quitter sélection</strong> avec compteur des éléments
                                    sélectionnés.
                                </li>
                                <li>
                                    <strong>Réinitialiser les filtres</strong>.
                                </li>
                                <li>
                                    <strong>Ajouter un événement</strong>.
                                </li>
                                <li>
                                    <strong>Filtres de dates</strong> : À partir du / Jusqu'au.
                                </li>
                                <li>
                                    <strong>Filtre Cible</strong> : Tous, Junia, Externe.
                                </li>
                                <li>
                                    <strong>Filtre Type d'événement</strong> : Tous les types, JPO, Examen,
                                    Conférence, Forum, Salon, Autre.
                                </li>
                            </ul>
                            <em>Action commune</em> : voir le tuto <strong>Rechercher et filtrer</strong>.
                        </>
                    ),
                    imageSrc: pageEventJuniaScreenshot,
                    imageAlt: "Barre d'outils de la page Événements",
                    imageCaption: 'Toolbar de recherche, filtres et actions.',
                },
            ],
        },
    ],
    tips: [
        "Utiliser des noms d'événements explicites pour faciliter la recherche et le suivi.",
        'Vérifier les dates et la cible avant validation pour éviter des impacts de planning non souhaités.',
        'Les réglages Macro/Micro planning influencent directement la qualité des plannings générés.',
    ],
}
