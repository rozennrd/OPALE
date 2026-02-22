import type { TutorialContent } from '../types'
import screenPageSalleScreenshot from '../../../assets/tuto/salle/screen-page-salle.png'
import screenPageSalleSuppressionScreenshot from '../../../assets/tuto/salle/screen-page-salle-suppression.png'
import screenPopupSalleScreenshot from '../../../assets/tuto/salle/screen-pop-up-salle.png'
import screenPopupSalleModifScreenshot from '../../../assets/tuto/salle/screen-pop-up-salle-modif.png'

export const roomsTutorialContent: TutorialContent = {
    objective:
        'Administrer les salles de Junia Bordeaux avec leurs types, capacités et disponibilités pour fiabiliser la planification.',
    expectedResult:
        'Chaque salle est correctement configurée (identité, types, disponibilité) et exploitable par les modules de planning.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Salles centralise les salles de <strong>Junia Bordeaux</strong> avec une
                            organisation par <strong>étage</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Vue générale de la page Salles dans OPALE',
                    imageCaption:
                        'Vue générale avec toolbar de recherche/filtres, catégories par étage et cartes salles.',
                },
                <>
                    Les salles sont regroupées en <strong>3 catégories</strong>: <em>Rez-de-chaussée</em>,{' '}
                    <em>1er étage</em> et <em>2ème étage</em> (1 étage = 1 catégorie).
                </>,
                <>
                    Chaque carte salle affiche les informations essentielles (nom/code, étage) et le{' '}
                    <strong>type principal</strong> de la salle.
                </>,
                <>
                    Une salle possède <strong>un type principal</strong> et <strong>zéro, un ou plusieurs
                    types secondaires</strong> (types de cours possibles dans cette salle).
                </>,
                <>
                    La disponibilité peut être pilotée au niveau de la salle (ex: <strong>travaux</strong>),
                    pour la rendre utilisable ou non dans la planification.
                </>,
                <>
                    La page propose aussi une <strong>zone d'ajout</strong> (carte pointillée avec bouton +)
                    pour créer une nouvelle salle.
                </>,
            ],
        },
        {
            title: 'Créer une salle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <u>zone pointillée avec le bouton +</u> pour ouvrir le pop-up de
                            création d'une salle.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: "Zone de création d'une salle sur la page Salles",
                    imageCaption: "La zone pointillée ouvre le formulaire de création d'une nouvelle salle.",
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
                            Renseigner les informations de la salle dans le pop-up (même structure que
                            l'édition).
                        </>
                    ),
                    imageSrc: screenPopupSalleScreenshot,
                    imageAlt: "Pop-up de création d'une salle",
                    imageCaption:
                        'Le formulaire de création définit identité, types, disponibilité et commentaire.',
                    subSteps: [
                        <>
                            <strong>Identité de la salle & types</strong>: saisir le{' '}
                            <strong>Nom court (code salle)</strong>, le <strong>Surnom / nom complet</strong>,
                            l'<strong>Étage</strong> et la <strong>Capacité (places)</strong>.
                        </>,
                        <>
                            <strong>Disponibilité globale</strong>: activer/désactiver le statut réservable de
                            la salle (ex: indisponible en cas de travaux).
                        </>,
                        <>
                            <strong>Type principal</strong>: choisir le type prioritaire de la salle pour
                            l'icône, le filtrage et la planification.
                        </>,
                        <>
                            <strong>Types disponibles</strong>: cocher les types secondaires compatibles avec la
                            salle (aucun, un ou plusieurs).
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: ajouter les informations utiles
                            (équipements, contraintes d'usage, remarques).
                        </>,
                        <>
                            Le <strong>type principal</strong> reste la référence fonctionnelle de la salle;
                            les types disponibles servent à étendre les usages possibles.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> selon le
                            résultat souhaité.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans sauvegarder</em>.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: crée/valide la salle et la rend visible dans la liste.
                        </>,
                        <>
                            En mode édition, un bouton <strong>Supprimer</strong> peut être affiché selon les
                            règles de la page.
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
                            <strong>Étape 1.1</strong>: depuis la toolbar, cliquer sur{' '}
                            <strong>Sélectionner</strong> pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: 'Activation du mode suppression sur la page Salles',
                    imageCaption: 'Le bouton Sélectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '86.1%',
                        top: '20.7%',
                        width: '8.5%',
                        height: '3.8%',
                        label: 'Mode sélection',
                    },
                },
                {
                    text: (
                        <>
                            Cocher une ou plusieurs salles, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleSuppressionScreenshot,
                    imageAlt: 'Suppression de salles en mode sélection',
                    imageCaption:
                        'Le mode sélection permet une suppression multiple avec compteur des éléments sélectionnés.',
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
                            Le compteur <strong>(n)</strong> indique le nombre de salles sélectionnées.
                        </>,
                        <>
                            Utiliser <strong>Tout sélectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la sélection avant suppression.
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
            title: 'Modifier une salle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de la salle à modifier pour ouvrir le pop-up
                            de détail en mode édition.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: "Accès à la modification d'une salle",
                    imageCaption: 'La carte salle ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.5%',
                        top: '42.7%',
                        width: '14.5%',
                        height: '9.6%',
                        label: 'Salle à modifier',
                    },
                },
                {
                    text: (
                        <>
                            Mettre à jour les informations de la salle dans le pop-up{' '}
                            <strong>Identité de la salle & types</strong>.
                        </>
                    ),
                    imageSrc: screenPopupSalleModifScreenshot,
                    imageAlt: "Pop-up de modification d'une salle",
                    imageCaption:
                        "Le pop-up permet d'ajuster identité, types, disponibilité et commentaires.",
                    subSteps: [
                        <>
                            <strong>Nom court (code salle)</strong>, <strong>Surnom / nom complet</strong>,{' '}
                            <strong>Étage</strong> et <strong>Capacité (places)</strong>: corriger ces champs
                            si l'identité ou l'usage de la salle évolue.
                        </>,
                        <>
                            <strong>Disponibilité globale</strong>: basculer la salle en disponible/non
                            disponible (ex: indisponible en cas de maintenance ou travaux).
                        </>,
                        <>
                            <strong>Type principal</strong>: vérifier qu'il correspond toujours à l'usage
                            prioritaire de la salle.
                        </>,
                        <>
                            <strong>Types disponibles</strong>: ajuster les types secondaires selon les usages
                            réels autorisés dans la salle.
                        </>,
                        <>
                            <strong>Description / commentaires</strong>: mettre à jour les contraintes, les
                            équipements et toute information utile à l'exploitation.
                        </>,
                        <>
                            Le bouton <strong>Supprimer</strong> peut être disponible dans ce pop-up selon les
                            règles de la page.
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
            title: "Utiliser la barre d'outils",
            steps: [
                {
                    text: (
                        <>
                            La barre d'outils regroupe la <strong>recherche</strong>, les{' '}
                            <strong>filtres de salles</strong> et les <strong>actions rapides</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: "Barre d'outils de la page Salles",
                    imageCaption: 'Toolbar de recherche, filtres, mode sélection et réinitialisation.',
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
                            label: 'Filtre capacité',
                            labelTop: '2.4rem',
                        },
                        {
                            left: '66.2%',
                            top: '28.6%',
                            width: '13.2%',
                            height: '3.6%',
                            label: 'Filtre disponibilité',
                            labelTop: '2.4rem',
                        },
                        {
                            left: '86.1%',
                            top: '20.7%',
                            width: '8.5%',
                            height: '3.8%',
                            label: 'Sélection',
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
                            <strong>Capacité</strong>: combiner un comparateur et une valeur (ex: <em>&gt;= 24</em>)
                            pour cibler les salles adaptées.
                        </>,
                        <>
                            <strong>Disponibilité</strong>: afficher les salles disponibles, non disponibles ou
                            les deux.
                        </>,
                        <>
                            <strong>Sélectionner</strong>: activer la suppression multiple.
                        </>,
                        <>
                            <strong>Reset filtres</strong>: revenir rapidement à la vue complète.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Maintenir la capacité et la disponibilité à jour pour éviter des affectations irréalisables.',
        "Conserver un type principal cohérent avec l'usage prioritaire de la salle.",
        'Documenter les contraintes de salle dans les commentaires (équipements, restrictions, travaux).',
    ],
}
