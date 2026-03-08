import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
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
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>,
                    la <strong>création</strong> et la <strong>suppression en mode sélection</strong>.
                </>,
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
            ],
        },
        {
            title: 'Créer une salle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>+</strong> dans la toolbar pour ouvrir le pop-up{' '}
                            <u>Détail de la salle</u>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: "Bouton + de création d'une salle",
                    imageCaption: "Le bouton + ouvre le pop-up de création d'une salle.",
                    imageHighlight: {
                        left: '92.2%',
                        top: '20.6%',
                        width: '2.6%',
                        height: '3.8%',
                        label: 'Création salle',
                        labelLeft: '-3.5rem',
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
                            sans créer la salle.
                        </>,
                        <>
                            Cliquer sur <strong>Fermer et créer</strong> ferme la carte de détail de création et
                            crée la salle.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Créer</strong> pour créer la nouvelle salle. Cette action ouvre
                            un pop-up de confirmation.
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
                            Cliquer sur <strong>Créer</strong> crée la salle et ferme le pop-up de création.
                        </>,
                    ],
                },
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
                                    <strong>Supprimer</strong>: supprime la salle affichée à l'écran. Cette
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
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement la salle.
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
                                    Cliquer sur <strong>Enregistrer</strong> enregistre la salle et ferme le
                                    pop-up de modification.
                                </>,
                            ],
                        },
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
                            La suppression des salles se fait en <strong>mode sélection</strong> depuis la
                            toolbar, ou depuis la <strong>carte de détail</strong> d'une salle en modification.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleSuppressionScreenshot,
                    imageAlt: 'Suppression de salles en mode sélection',
                    imageCaption:
                        'Le mode sélection permet une suppression multiple avec compteur des éléments sélectionnés.',
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
                                    <strong>Recherche</strong> de salle.
                                </li>
                                <li>
                                    <strong>SÃ©lectionner / Quitter sÃ©lection</strong> avec compteur des
                                    Ã©lÃ©ments sÃ©lectionnÃ©s.
                                </li>
                                <li>
                                    <strong>RÃ©initialiser les filtres</strong>.
                                </li>
                                <li>
                                    <strong>Ajouter une salle</strong>.
                                </li>
                                <li>
                                    <strong>Filtre Type</strong> : Tous les types, Cours, Informatique, Projet,
                                    Rassemblement, RÃ©union, Associatif, Ã‰lectronique, Fablab, RÃ©seau.
                                </li>
                                <li>
                                    <strong>Filtre CapacitÃ©</strong> : opÃ©rateur (Tous, &gt;, &lt;, =) + valeur.
                                </li>
                                <li>
                                    <strong>Filtre DisponibilitÃ©</strong> : Tous, Disponible, Non dispo.
                                </li>
                            </ul>
                            <em>Action commune</em> : voir le tuto <strong>Rechercher et filtrer</strong>.
                        </>
                    ),
                    imageSrc: screenPageSalleScreenshot,
                    imageAlt: "Barre d'outils de la page Salles",
                    imageCaption: 'Toolbar de recherche, filtres, mode sélection et réinitialisation.',
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
