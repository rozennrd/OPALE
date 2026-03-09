import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageEventScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import screenPageEventSuppressionScreenshot from '../../../assets/tuto/event/screen-page-event-suppression.png'
import screenPopupEventModifScreenshot from '../../../assets/tuto/event/screen-pop-up-event-modif.png'
import screenPopupEventScreenshot from '../../../assets/tuto/event/screen-pop-up-event.png'

export const eventsTutorialContent: TutorialContent = {
    objective:
        "Consulter et administrer les événements qui impactent directement ou indirectement l'école (Junia).",
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
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Vue générale de la page Événements dans OPALE',
                    imageCaption:
                        'Vue générale avec toolbar de recherche/filtrage et liste des événements.',
                },
                <>
                    Chaque ligne d'événement contient les <strong>informations principales</strong>: nom,
                    date, lieu et type d'événement.
                </>,
                <>
                    La toolbar en haut centralise les actions: <strong>recherche</strong>,{' '}
                    <strong>filtres</strong>, <strong>création</strong> et{' '}
                    <strong>suppression en mode sélection</strong>.
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
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: "Bouton + de création d'un événement",
                    imageCaption: "Le bouton + ouvre le pop-up de création d'un événement.",
                    imageHighlight: {
                        left: '92.7%',
                        top: '21.35%',
                        width: '2.2%',
                        height: '4.8%',
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
                    imageSrc: screenPopupEventScreenshot,
                    imageAlt: "Pop-up de création/modification d'événement",
                    imageCaption: "Formulaire de création/modification d'événement.",
                    subSteps: [
                        <>
                            <strong>Nom</strong>: saisir un intitulé clair et reconnaissable (ex: Journée
                            Portes Ouvertes, Forum Entreprises).
                        </>,
                        <>
                            <strong>Date de début</strong> et <strong>Date de fin</strong>: définir la plage
                            réelle de l'événement. Vérifier la cohérence chronologique (<em>fin &gt;= début</em>).
                        </>,
                        <>
                            <strong>Salle / Lieu</strong>: préciser le lieu principal (campus, salle, adresse
                            ou site externe) pour faciliter l'organisation.
                        </>,
                        <>
                            <strong>Type</strong>: choisir la catégorie de l'événement (ex: salon/expo,
                            journée portes ouvertes, forum, autre événement).
                        </>,
                        <>
                            <strong>Cible</strong>: sélectionner <em>Junia</em> et/ou <em>Externe</em> selon le
                            public concerné.
                        </>,
                        <>
                            <strong>Promotions</strong>: rattacher les promotions impactées. Si l'événement est
                            global, laisser le champ sans promotion cible.
                        </>,
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
                            Cliquer sur <strong>Annuler</strong> ou <strong>Créer</strong> selon le résultat
                            souhaité.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans création</em>.
                        </>,
                        <>
                            <strong>Créer</strong>: enregistre le nouvel événement dans la liste.
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
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: "Accès à la modification d'un événement",
                    imageCaption: "La ligne événement ouvre le pop-up de modification.",
                    imageHighlight: {
                        left: '21.2%',
                        top: '41.0%',
                        width: '73.4%',
                        height: '9.7%',
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
                    imageSrc: screenPopupEventModifScreenshot,
                    imageAlt: "Pop-up de modification d'événement",
                    imageCaption: 'Même formulaire que la création, utilisé en édition.',
                    subSteps: [
                        <>
                            <strong>Nom</strong>: ajuster l'intitulé si l'événement change de format ou de
                            périmètre.
                        </>,
                        <>
                            <strong>Date de début</strong> et <strong>Date de fin</strong>: corriger les dates en
                            cas de décalage ou d'extension de période.
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
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour finaliser
                            la modification.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: abandonne les modifications en cours.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: applique les changements sur l'événement.
                        </>,
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
                            <strong>Étape 1.1</strong>: depuis la vue principale, cliquer sur{' '}
                            <strong>Sélectionner</strong> pour activer le mode de suppression.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Accès au mode suppression depuis la page Événements',
                    imageCaption: 'Le bouton Sélectionner ouvre les actions de suppression.',
                    imageHighlight: {
                        left: '83.0%',
                        top: '20.65%',
                        width: '9.5%',
                        height: '6.1%',
                        label: 'Accès suppression',
                    },
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Sélectionner</strong>, cocher un ou plusieurs événements, puis
                            cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageEventSuppressionScreenshot,
                    imageAlt: "Mode suppression d'événements",
                    imageCaption:
                        'Mode sélection avec actions de suppression en lot (Supprimer n).',
                    imageHighlights: [
                        {
                            left: '82.7%',
                            top: '20.5%',
                            width: '9.8%',
                            height: '6.65%',
                            label: 'Mode sélection',
                        },
                        {
                            left: '86.5%',
                            top: '36.8%',
                            width: '8.8%',
                            height: '6.4%',
                            label: 'Supprimer (n)',
                        },
                    ],
                    subSteps: [
                        <>
                            Le compteur <strong>(n)</strong> indique le nombre d'événements sélectionnés.
                        </>,
                        <>
                            Utiliser <strong>Tout sélectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la sélection.
                        </>,
                    ],
                },
                <>
                    <strong>Étape 2 (à venir)</strong>: un pop-up de confirmation apparaîtra pour valider ou
                    annuler la suppression.
                </>,
            ],
        },
        {
            title: "Utiliser la barre d'outils",
            steps: [
                {
                    text: (
                        <>
                            La barre d'outils centralise la <strong>recherche textuelle</strong>, les{' '}
                            <strong>filtres</strong>, la <strong>création</strong> et le{' '}
                            <strong>mode sélection</strong>.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: "Barre d'outils de la page Événements",
                    imageCaption: 'Toolbar de recherche, filtres et actions.',
                    imageHighlights: [
                        {
                            left: '22.0%',
                            top: '20.6%',
                            width: '61.3%',
                            height: '5.7%',
                            label: 'Recherche textuelle',
                        },
                        {
                            left: '22.0%',
                            top: '26.7%',
                            width: '73.3%',
                            height: '8.2%',
                            label: 'Filtres',
                            labelTop: '3.5rem',
                        },
                        {
                            left: '83.5%',
                            top: '20.6%',
                            width: '9.0%',
                            height: '5.7%',
                            label: 'Sélection',
                            labelLeft: '-0.5rem',
                        },
                        {
                            left: '92.7%',
                            top: '21.3%',
                            width: '2.2%',
                            height: '4.8%',
                            label: 'Création',
                            labelLeft: '-0.5rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer rapidement un événement par son nom.
                        </>,
                        <>
                            <strong>Filtres par date</strong>: <em>À partir du</em> / <em>Jusqu'au</em>.
                        </>,
                        <>
                            <strong>Filtres par cible</strong>: <em>Tous</em>, <em>Junia</em> ou{' '}
                            <em>Externe</em>.
                        </>,
                        <>
                            <strong>Filtre par type d'événement</strong> et bouton{' '}
                            <strong>Réinitialiser les filtres</strong>.
                        </>,
                        <>
                            Le bouton <strong>+</strong> ouvre la création d'événement.
                        </>,
                        <>
                            Le bouton <strong>Sélectionner</strong> permet la suppression d'un ou plusieurs
                            événements.
                        </>,
                    ],
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

