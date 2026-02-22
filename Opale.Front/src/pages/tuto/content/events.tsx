import type { TutorialContent } from '../types'
import screenPageEventScreenshot from '../../../assets/tuto/event/screen-page-event.png'
import screenPageEventSuppressionScreenshot from '../../../assets/tuto/event/screen-page-event-suppression.png'
import screenPopupEventModifScreenshot from '../../../assets/tuto/event/screen-pop-up-event-modif.png'
import screenPopupEventScreenshot from '../../../assets/tuto/event/screen-pop-up-event.png'

export const eventsTutorialContent: TutorialContent = {
    objective:
        'Consulter et administrer les evenements qui impactent directement ou indirectement l ecole (Junia).',
    expectedResult:
        'Les evenements sont fiables, filtres facilement, et correctement crees, modifies ou supprimes.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Evenements affiche une <strong>vue consolidee</strong> des evenements{' '}
                            <strong>Junia</strong> et <strong>externes</strong>, regroupes par mois.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Vue generale de la page Evenements dans OPALE',
                    imageCaption:
                        'Vue generale avec toolbar de recherche/filtrage et liste des evenements.',
                },
                <>
                    Chaque ligne d evenement contient les <strong>informations principales</strong>: nom,
                    date, lieu et type d evenement.
                </>,
                <>
                    La toolbar en haut centralise les actions: <strong>recherche</strong>,{' '}
                    <strong>filtres</strong>, <strong>creation</strong> et{' '}
                    <strong>suppression en mode selection</strong>.
                </>,
            ],
        },
        {
            title: 'Creer un evenement',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l icone <strong>+</strong> dans la toolbar pour ouvrir le pop-up de{' '}
                            <u>creation d un evenement</u>.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Bouton + de creation d evenement',
                    imageCaption: 'Le bouton + ouvre le pop-up de creation d un evenement.',
                    imageHighlight: {
                        left: '92.7%',
                        top: '21.35%',
                        width: '2.2%',
                        height: '4.8%',
                        label: 'Creer un evenement',
                        labelLeft: '-5rem',
                        labelTop: '-0.5rem',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner le pop-up <strong>Nouvel evenement</strong>. Ce formulaire est aussi
                            reutilise dans le tutoriel de <strong>modification</strong>.
                        </>
                    ),
                    imageSrc: screenPopupEventScreenshot,
                    imageAlt: 'Pop-up de creation/modification d evenement',
                    imageCaption: 'Formulaire de creation/modification d evenement.',
                    subSteps: [
                        <>
                            <strong>Nom</strong>: saisir un intitule clair et reconnaissable (ex: Journee
                            Portes Ouvertes, Forum Entreprises).
                        </>,
                        <>
                            <strong>Date de debut</strong> et <strong>Date de fin</strong>: definir la plage
                            reelle de l evenement. Verifier la coherence chronologique (<em>fin &gt;= debut</em>).
                        </>,
                        <>
                            <strong>Salle / Lieu</strong>: preciser le lieu principal (campus, salle, adresse
                            ou site externe) pour faciliter l organisation.
                        </>,
                        <>
                            <strong>Type</strong>: choisir la categorie de l evenement (ex: salon/expo,
                            journee portes ouvertes, forum, autre evenement).
                        </>,
                        <>
                            <strong>Cible</strong>: selectionner <em>Junia</em> et/ou <em>Externe</em> selon le
                            public concerne.
                        </>,
                        <>
                            <strong>Promotions</strong>: rattacher les promotions impactees. Si l evenement est
                            global, laisser le champ sans promotion cible.
                        </>,
                        <>
                            <strong>Macro planning</strong> / <strong>Micro planning</strong>: activer selon
                            l impact attendu dans les plannings.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: documenter le contexte, les objectifs
                            et les contraintes utiles pour l equipe.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Creer</strong> selon le resultat
                            souhaite.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans creation</em>.
                        </>,
                        <>
                            <strong>Creer</strong>: enregistre le nouvel evenement dans la liste.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Modifier un evenement',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la ligne de l evenement a modifier pour ouvrir le pop-up d edition.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Acces a la modification d un evenement',
                    imageCaption: 'La ligne evenement ouvre le pop-up de modification.',
                    imageHighlight: {
                        left: '21.2%',
                        top: '41.0%',
                        width: '73.4%',
                        height: '9.7%',
                        label: 'Evenement a modifier',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up de modification reprend les <strong>memes champs</strong> que la creation,
                            avec des valeurs deja renseignees. Mettre a jour uniquement ce qui a evolue.
                        </>
                    ),
                    imageSrc: screenPopupEventModifScreenshot,
                    imageAlt: 'Pop-up de modification d evenement',
                    imageCaption: 'Meme formulaire que la creation, utilise en edition.',
                    subSteps: [
                        <>
                            <strong>Nom</strong>: ajuster l intitule si l evenement change de format ou de
                            perimetre.
                        </>,
                        <>
                            <strong>Date de debut</strong> et <strong>Date de fin</strong>: corriger les dates en
                            cas de decalage ou d extension de periode.
                        </>,
                        <>
                            <strong>Salle / Lieu</strong>: actualiser la localisation si besoin logistique.
                        </>,
                        <>
                            <strong>Type</strong>: verifier que la categorie reste conforme a la nature de
                            l evenement.
                        </>,
                        <>
                            <strong>Cible</strong>: revalider <em>Junia</em> / <em>Externe</em> selon les publics
                            impactes.
                        </>,
                        <>
                            <strong>Promotions</strong>: ajouter/retirer les promotions concernees pour garder un
                            impact planning fiable.
                        </>,
                        <>
                            <strong>Macro planning</strong> / <strong>Micro planning</strong>: confirmer que les
                            activations correspondent toujours au besoin reel.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: mettre a jour les informations
                            operationnelles (objectifs, contraintes, contexte).
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
                            <strong>Enregistrer</strong>: applique les changements sur l evenement.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Supprimer un evenement',
            steps: [
                {
                    text: (
                        <>
                            <strong>Etape 1.1</strong>: depuis la vue principale, cliquer sur{' '}
                            <strong>Selectionner</strong> pour activer le mode de suppression.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Acces au mode suppression depuis la page Evenements',
                    imageCaption: 'Le bouton Selectionner ouvre les actions de suppression.',
                    imageHighlight: {
                        left: '83.0%',
                        top: '20.65%',
                        width: '9.5%',
                        height: '6.1%',
                        label: 'Acces suppression',
                    },
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Selectionner</strong>, cocher un ou plusieurs evenements, puis
                            cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageEventSuppressionScreenshot,
                    imageAlt: 'Mode suppression d evenements',
                    imageCaption:
                        'Mode selection avec actions de suppression en lot (Supprimer n).',
                    imageHighlights: [
                        {
                            left: '82.7%',
                            top: '20.5%',
                            width: '9.8%',
                            height: '6.65%',
                            label: 'Mode selection',
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
                            Le compteur <strong>(n)</strong> indique le nombre d evenements selectionnes.
                        </>,
                        <>
                            Utiliser <strong>Tout selectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la selection.
                        </>,
                    ],
                },
                <>
                    <strong>Etape 2 (a venir)</strong>: un pop-up de confirmation apparaitra pour valider ou
                    annuler la suppression.
                </>,
            ],
        },
        {
            title: 'Utiliser la barre d outil',
            steps: [
                {
                    text: (
                        <>
                            La barre d outil centralise la <strong>recherche textuelle</strong>, les{' '}
                            <strong>filtres</strong>, la <strong>creation</strong> et le{' '}
                            <strong>mode selection</strong>.
                        </>
                    ),
                    imageSrc: screenPageEventScreenshot,
                    imageAlt: 'Barre d outil de la page Evenements',
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
                            label: 'Selection',
                            labelLeft: '-0.5rem',
                        },
                        {
                            left: '92.7%',
                            top: '21.3%',
                            width: '2.2%',
                            height: '4.8%',
                            label: 'Creation',
                            labelLeft: '-0.5rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer rapidement un evenement par son nom.
                        </>,
                        <>
                            <strong>Filtres par date</strong>: <em>A partir du</em> / <em>Jusqu au</em>.
                        </>,
                        <>
                            <strong>Filtres par cible</strong>: <em>Tous</em>, <em>Junia</em> ou{' '}
                            <em>Externe</em>.
                        </>,
                        <>
                            <strong>Filtre par type d evenement</strong> et bouton{' '}
                            <strong>Reset filtres</strong>.
                        </>,
                        <>
                            Le bouton <strong>+</strong> ouvre la creation d evenement.
                        </>,
                        <>
                            Le bouton <strong>Selectionner</strong> permet la suppression d un ou plusieurs
                            evenements.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Utiliser des noms d evenements explicites pour faciliter la recherche et le suivi.',
        'Verifier les dates et la cible avant validation pour eviter des impacts de planning non souhaites.',
        'Les reglages Macro/Micro planning influencent directement la qualite des plannings generes.',
    ],
}

