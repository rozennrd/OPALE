import type { TutorialContent } from '../types'
import screenPageSalleScreenshot from '../../../assets/tuto/salle/screen-page-salle.png'
import screenPageSalleSuppressionScreenshot from '../../../assets/tuto/salle/screen-page-salle-suppression.png'
import screenPopupSalleScreenshot from '../../../assets/tuto/salle/screen-pop-up-salle.png'
import screenPopupSalleModifScreenshot from '../../../assets/tuto/salle/screen-pop-up-salle-modif.png'

export const roomsTutorialContent: TutorialContent = {
    objective:
        'Administrer les salles de Junia Bordeaux avec leurs types, capacites et disponibilites pour fiabiliser la planification.',
    expectedResult:
        'Chaque salle est correctement configuree (identite, types, disponibilite) et exploitable par les modules de planning.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Salles centralise les salles de <strong>Junia Bordeaux</strong> avec une
                            organisation par <strong>etage</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Vue generale de la page Salles dans OPALE',
                    imageCaption:
                        'Vue generale avec toolbar de recherche/filtres, categories par etage et cartes salles.',
                },
                <>
                    Les salles sont regroupees en <strong>3 categories</strong>: <em>Rez-de-chaussee</em>,{' '}
                    <em>1er etage</em> et <em>2eme etage</em> (1 etage = 1 categorie).
                </>,
                <>
                    Chaque carte salle affiche les informations essentielles (nom/code, etage) et le{' '}
                    <strong>type principal</strong> de la salle.
                </>,
                <>
                    Une salle possede <strong>un type principal</strong> et <strong>zero, un ou plusieurs
                    types secondaires</strong> (types de cours possibles dans cette salle).
                </>,
                <>
                    La disponibilite peut etre pilotee au niveau de la salle (ex: <strong>travaux</strong>),
                    pour la rendre utilisable ou non dans la planification.
                </>,
                <>
                    La page propose aussi une <strong>zone d ajout</strong> (carte pointillee avec bouton +)
                    pour creer une nouvelle salle.
                </>,
            ],
        },
        {
            title: 'Creer une salle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <u>zone pointillee avec le bouton +</u> pour ouvrir le pop-up de
                            creation d une salle.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Zone de creation d une salle sur la page Salles',
                    imageCaption: 'La zone pointillee ouvre le formulaire de creation d une nouvelle salle.',
                    imageHighlight: {
                        left: '36.6%',
                        top: '52.9%',
                        width: '13.9%',
                        height: '8.0%',
                        label: 'Ajouter une salle',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner les informations de la salle dans le pop-up (meme structure que
                            l edition).
                        </>
                    ),
                    imageSrc: screenPopupSalleScreenshot,
                    imageAlt: 'Pop-up de creation d une salle',
                    imageCaption:
                        'Le formulaire de creation definit identite, types, disponibilite et commentaire.',
                    subSteps: [
                        <>
                            <strong>Identite de la salle & types</strong>: saisir le{' '}
                            <strong>Nom court (code salle)</strong>, le <strong>Surnom / nom complet</strong>,
                            l <strong>Etage</strong> et la <strong>Capacite (places)</strong>.
                        </>,
                        <>
                            <strong>Disponibilite globale</strong>: activer/desactiver le statut reservable de
                            la salle (ex: indisponible en cas de travaux).
                        </>,
                        <>
                            <strong>Type principal</strong>: choisir le type prioritaire de la salle pour
                            l icone, le filtrage et la planification.
                        </>,
                        <>
                            <strong>Types disponibles</strong>: cocher les types secondaires compatibles avec la
                            salle (aucun, un ou plusieurs).
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: ajouter les informations utiles
                            (equipements, contraintes d usage, remarques).
                        </>,
                        <>
                            Le <strong>type principal</strong> reste la reference fonctionnelle de la salle;
                            les types disponibles servent a etendre les usages possibles.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> selon le
                            resultat souhaite.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans sauvegarder</em>.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: cree/valide la salle et la rend visible dans la liste.
                        </>,
                        <>
                            En mode edition, un bouton <strong>Supprimer</strong> peut etre affiche selon les
                            regles de la page.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Supprimer une salle',
            steps: [
                {
                    text: (
                        <>
                            <strong>Etape 1.1</strong>: depuis la toolbar, cliquer sur{' '}
                            <strong>Selectionner</strong> pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Activation du mode suppression sur la page Salles',
                    imageCaption: 'Le bouton Selectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '86.1%',
                        top: '20.7%',
                        width: '8.5%',
                        height: '3.8%',
                        label: 'Mode selection',
                    },
                },
                {
                    text: (
                        <>
                            Cocher une ou plusieurs salles, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleSuppressionScreenshot,
                    imageAlt: 'Suppression de salles en mode selection',
                    imageCaption:
                        'Le mode selection permet une suppression multiple avec compteur des elements selectionnes.',
                    imageHighlights: [
                        {
                            left: '85.3%',
                            top: '20.4%',
                            width: '9.2%',
                            height: '4.5%',
                            label: 'Quitter le mode sélection',
                            labelLeft: '-2.5rem',
                        },
                        {
                            left: '86.7%',
                            top: '36.5%',
                            width: '8.5%',
                            height: '6.1%',
                            label: 'Supprimer (n)',
                            labelLeft: '-0.8rem',
                        },
                    ],
                    subSteps: [
                        <>
                            Le compteur <strong>(n)</strong> indique le nombre de salles selectionnees.
                        </>,
                        <>
                            Utiliser <strong>Tout selectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la selection avant suppression.
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
            title: 'Modifier une salle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de la salle a modifier pour ouvrir le pop-up
                            de detail en mode edition.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Acces a la modification d une salle',
                    imageCaption: 'La carte salle ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.5%',
                        top: '42.7%',
                        width: '14.5%',
                        height: '9.6%',
                        label: 'Salle a modifier',
                    },
                },
                {
                    text: (
                        <>
                            Mettre a jour les informations de la salle dans le pop-up{' '}
                            <strong>Identite de la salle & types</strong>.
                        </>
                    ),
                    imageSrc: screenPopupSalleModifScreenshot,
                    imageAlt: 'Pop-up de modification d une salle',
                    imageCaption:
                        'Le pop-up permet d ajuster identite, types, disponibilite et commentaires.',
                    subSteps: [
                        <>
                            <strong>Nom court (code salle)</strong>, <strong>Surnom / nom complet</strong>,{' '}
                            <strong>Etage</strong> et <strong>Capacite (places)</strong>: corriger ces champs
                            si l identite ou l usage de la salle evolue.
                        </>,
                        <>
                            <strong>Disponibilite globale</strong>: basculer la salle en disponible/non
                            disponible (ex: indisponible en cas de maintenance ou travaux).
                        </>,
                        <>
                            <strong>Type principal</strong>: verifier qu il correspond toujours a l usage
                            prioritaire de la salle.
                        </>,
                        <>
                            <strong>Types disponibles</strong>: ajuster les types secondaires selon les usages
                            reels autorises dans la salle.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: mettre a jour les contraintes, les
                            equipements et toute information utile a l exploitation.
                        </>,
                        <>
                            Le bouton <strong>Supprimer</strong> peut etre disponible dans ce pop-up selon les
                            regles de la page.
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
                            <strong>Enregistrer</strong>: applique les changements sur la salle.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Utiliser la barre d outil',
            steps: [
                {
                    text: (
                        <>
                            La barre d outil regroupe la <strong>recherche</strong>, les{' '}
                            <strong>filtres de salles</strong> et les <strong>actions rapides</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Barre d outil de la page Salles',
                    imageCaption: 'Toolbar de recherche, filtres, mode selection et reinitialisation.',
                    imageHighlights: [
                        {
                            left: '22.7%',
                            top: '20.8%',
                            width: '62.6%',
                            height: '3.9%',
                            label: 'Recherche',
                        },
                        {
                            left: '22.7%',
                            top: '28.6%',
                            width: '9.5%',
                            height: '3.6%',
                            label: 'Filtre type',
                            labelLeft: '-0.2rem',
                            labelTop: '2.4rem',
                        },
                        {
                            left: '41.9%',
                            top: '28.6%',
                            width: '14.8%',
                            height: '3.6%',
                            label: 'Filtre capacite',
                            labelTop: '2.4rem',
                        },
                        {
                            left: '66.2%',
                            top: '28.6%',
                            width: '13.2%',
                            height: '3.6%',
                            label: 'Filtre disponibilite',
                            labelTop: '2.4rem',
                        },
                        {
                            left: '86.1%',
                            top: '20.7%',
                            width: '8.5%',
                            height: '3.8%',
                            label: 'Selection',
                            labelLeft: '-0.5rem',
                        },
                        {
                            left: '89.0%',
                            top: '28.0%',
                            width: '6.1%',
                            height: '4.4%',
                            label: 'Reset filtres',
                            labelLeft: '-0.8rem',
                            labelTop: '2.4rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer rapidement une salle par nom/code.
                        </>,
                        <>
                            <strong>Type</strong>: filtrer selon le type de salle (type principal).
                        </>,
                        <>
                            <strong>Capacite</strong>: combiner un comparateur et une valeur (ex: <em>&gt;= 24</em>)
                            pour cibler les salles adaptees.
                        </>,
                        <>
                            <strong>Disponibilite</strong>: afficher les salles disponibles, non disponibles ou
                            les deux.
                        </>,
                        <>
                            <strong>Selectionner</strong>: activer la suppression multiple.
                        </>,
                        <>
                            <strong>Reset filtres</strong>: revenir rapidement a la vue complete.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Maintenir la capacite et la disponibilite a jour pour eviter des affectations irrealisables.',
        'Conserver un type principal coherent avec l usage prioritaire de la salle.',
        'Documenter les contraintes de salle dans les commentaires (equipements, restrictions, travaux).',
    ],
}


