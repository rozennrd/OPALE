import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageProfScreenshot from '../../../assets/tuto/prof/screen-page-prof.png'
import screenPageProfSuppressionScreenshot from '../../../assets/tuto/prof/screen-page-prof-suppression.png'
import screenPopupProfScreenshot from '../../../assets/tuto/prof/screen-pop-up-prof.png'
import screenPopupProfModifScreenshot from '../../../assets/tuto/prof/screen-pop-up-prof-modif.png'

export const teachersTutorialContent: TutorialContent = {
    objective:
        'Gérer les fiches enseignants (internes et vacataires) pour fiabiliser la génération des plannings.',
    expectedResult:
        'Chaque enseignant est correctement renseigné (profil, matières, disponibilités) et exploitable dans la planification.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Enseignants affiche l'ensemble des enseignants dans une <strong>vue unique</strong>,
                            séparée en <strong>3 catégories</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Vue générale de la page Enseignants dans OPALE',
                    imageCaption:
                        "Vue générale avec catégories d'enseignants, toolbar de recherche/filtres et cartes enseignants.",
                },
                <>
                    <strong>Internes Bordeaux</strong>: enseignants du campus local, mobilisables sans déplacement
                    inter-campus.
                </>,
                <>
                    <strong>Internes Lille/Châteauroux</strong>: enseignants Junia d'un autre campus; leur venue
                    doit être anticipée dans l'organisation.
                </>,
                <>
                    <strong>Vacataires</strong>: intervenants externes à Junia.
                </>,
                <>
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>, la{' '}
                    <strong>création</strong> et la <strong>suppression en mode sélection</strong>.
                </>,
                <>
                    Chaque carte enseignant contient les informations clés (<strong>nom</strong>,{' '}
                    <strong>téléphone</strong>, <strong>mode d'intervention</strong>) et sert de point d'accès
                    pour la consultation/détail.
                </>,
            ],
        },
        {
            title: 'Créer un enseignant',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>+</strong> dans la toolbar pour ouvrir le pop-up{' '}
                            <u>Détail de l'enseignant</u>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: "Bouton + de création d'un enseignant",
                    imageCaption: "Le bouton + ouvre le pop-up de création d'un enseignant.",
                    imageHighlight: {
                        left: '92.3%',
                        top: '19.7%',
                        width: '2.7%',
                        height: '5.4%',
                        label: "Création d'enseignant",
                        labelLeft: '-4rem',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner les champs du pop-up de création en suivant les blocs fonctionnels.
                        </>
                    ),
                    imageSrc: screenPopupProfScreenshot,
                    imageAlt: "Pop-up de création d'un enseignant",
                    imageCaption: 'Le pop-up permet de définir le profil, les matières et les disponibilités.',
                    subSteps: [
                        <>
                            <strong>Informations</strong>: remplir <strong>Nom</strong>, <strong>Prénom</strong>,{' '}
                            <strong>téléphone</strong>, <strong>Email Junia</strong> et{' '}
                            <strong>Email perso</strong>.
                        </>,
                        <>
                            <strong>Type</strong>: choisir le mode d'intervention de l'enseignant ({' '}
                            <em>Présentiel</em>, <em>Hybride</em> ou <em>Distanciel</em>).
                        </>,
                        <>
                            <strong>Rattachement</strong>: indiquer <em>Interne</em> ou <em>Vacataire</em>.
                        </>,
                        <>
                            <strong>Campus d'origine</strong>: préciser le campus de référence (ex: Bordeaux,
                            Lille, Châteauroux) pour faciliter l'organisation inter-campus.
                        </>,
                        <>
                            <strong>Matières enseignées</strong>: ajouter les matières enseignées puis associer,
                            si nécessaire, les promotions cibles.
                            <br />
                            <em>Conseil</em>: pour attribuer ou désattribuer une matière, se référer à la
                            section <strong>Attribuer des matières à un enseignant</strong>.
                            <br />
                            <em>Note</em> : voir le tuto <strong>Attribuer des matières à un enseignant</strong>.
                        </>,
                        <>
                            <strong>Disponibilités</strong>: créer une ou plusieurs périodes, définir la plage de
                            dates, puis renseigner la grille <strong>Matin / Après-midi</strong> du{' '}
                            <strong>Lundi au Vendredi</strong>.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                            <br />
                            <em>Note</em> : voir le tuto <strong>Ajouter des périodes de disponibilités</strong>.
                        </>,
                        <>
                            Vérifier la légende <em>Disponible</em> / <em>Non disponible</em> pour éviter les
                            inversions lors de la saisie.
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
                            sans créer l'enseignant.
                        </>,
                        <>
                            Cliquer sur <strong>Fermer et créer</strong> ferme la carte de détail de création
                            et crée l'enseignant.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Créer</strong> pour créer le nouvel enseignant. Cette action
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
                            Cliquer sur <strong>Créer</strong> crée l'enseignant et ferme le pop-up de création.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Modifier un enseignant',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de l'enseignant à modifier pour ouvrir le
                            pop-up de détail en mode édition.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: "Accès à la modification d'un enseignant",
                    imageCaption: 'La carte enseignant ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.4%',
                        top: '48.9%',
                        width: '13.4%',
                        height: '10.5%',
                        label: 'enseignant à modifier',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up de modification reprend les <strong>mêmes champs</strong> que la création,
                            avec des valeurs déjà pré-remplies.
                        </>
                    ),
                    imageSrc: screenPopupProfModifScreenshot,
                    imageAlt: "Pop-up de modification d'un enseignant",
                    imageCaption:
                        'En modification, les informations existantes peuvent être corrigées et complétées.',
                    subSteps: [
                        <>
                            Mettre à jour les <strong>informations personnelles</strong>: Nom, Prénom, téléphone,
                            Email Junia, Email perso.
                        </>,
                        <>
                            Vérifier la cohérence de <strong>Type</strong>, <strong>Rattachement</strong> et{' '}
                            <strong>Campus d'origine</strong>.
                        </>,
                        <>
                            Ajuster les <strong>matières enseignées</strong> et les promotions associées selon
                            la charge pédagogique réelle.
                            <br />
                            <em>Conseil</em>: pour attribuer ou désattribuer une matière, se référer à la
                            section <strong>Attribuer des matières à un enseignant</strong>.
                            <br />
                            <em>Note</em> : voir le tuto <strong>Attribuer des matières à un enseignant</strong>.
                        </>,
                        <>
                            Actualiser les <strong>disponibilités</strong> (périodes, grille hebdomadaire) pour
                            garantir des plannings fiables.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                            <br />
                            <em>Note</em> : voir le tuto <strong>Ajouter des périodes de disponibilités</strong>.
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
                                    <strong>Supprimer</strong>: supprime l'enseignant affiché à l'écran. Cette
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
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement l'enseignant.
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
                                    Cliquer sur <strong>Enregistrer</strong> enregistre l'enseignant et ferme
                                    le pop-up de modification.
                                </>,
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Attribuer des matières à un enseignant',
            steps: [
                <>
                    Sur la <strong>carte de détail</strong>, lors d'une création ou d'une modification, cliquer
                    sur <strong>Ajouter une matière</strong>.
                </>,
                <>
                    Sélectionner la <strong>promotion</strong> voulue.
                </>,
                <>
                    Sélectionner la <strong>matière</strong> voulue. La liste de matières affiche uniquement les
                    matières de la promotion sélectionnée. Si aucune promotion n'est sélectionnée, toutes les
                    matières disponibles sont proposées. Si une matière est choisie sans promotion, la promotion
                    associée à cette matière est automatiquement sélectionnée.
                    <br />
                    Le champ <strong>NA</strong> à droite du nom de la matière affiche le nombre d'heures
                    attribuées à l'enseignant une fois les heures renseignées depuis la page Matières.
                </>,
            ],
        },
        {
            title: 'Ajouter des périodes de disponibilités',
            steps: [
                <>
                    Depuis la <strong>carte de détail</strong> (création ou modification), cliquer sur{' '}
                    <strong>Ajouter une période de disponibilité</strong>.
                </>,
                <>
                    Renseigner la <strong>date de début</strong> et la <strong>date de fin</strong> de la
                    période.
                    <br />
                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                    <br />
                    Une période de disponibilité peut couvrir une longue période tant que les
                    disponibilités par demi-journée du <strong>Lundi au Vendredi</strong> ne changent pas.
                </>,
                <>
                    Une fois toutes les périodes créées, cliquer sur <strong>Enregistrer</strong> ou{' '}
                    <strong>Créer</strong> selon le contexte.
                    <br />
                    <em>Action commune</em> : voir le tuto{' '}
                    <strong>Annuler ou enregistrer/créer</strong>.
                </>,
                <>
                    Si on revient sur la carte de détail via la modification, les périodes de disponibilités
                    sont découpées en semaines. Il est alors possible de modifier la disponibilité par
                    demi-journée, semaine par semaine.
                </>,
            ],
        },
        {
            title: 'Supprimer un enseignant',
            steps: [
                {
                    text: (
                        <>
                            La suppression des enseignants se fait en <strong>mode sélection</strong> depuis la
                            toolbar, ou depuis la <strong>carte de détail</strong> d'un enseignant en
                            modification.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfSuppressionScreenshot,
                    imageAlt: "Suppression d'enseignants en mode sélection",
                    imageCaption:
                        'Le mode sélection permet une suppression unitaire ou multiple des enseignants.',
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
                                    <strong>Recherche</strong> d'enseignant.
                                </li>
                                <li>
                                    <strong>Filtres de disponibilité</strong> : Dispo à partir du / Jusqu'au.
                                </li>
                                <li>
                                    <strong>Filtre Type de cours</strong> : Tous, Présentiel, Hybride,
                                    Distanciel.
                                </li>
                                <li>
                                    <strong>Filtre Promotion</strong> (liste déroulante).
                                </li>
                                <li>
                                    <strong>Filtre Matières</strong> (liste déroulante).
                                </li>
                                <li>
                                    <strong>Sélectionner / Quitter sélection</strong> avec compteur des
                                    éléments sélectionnés.
                                </li>
                                <li>
                                    <strong>Réinitialiser les filtres</strong>.
                                </li>
                                <li>
                                    <strong>Ajouter un enseignant</strong>.
                                </li>
                            </ul>
                            <em>Action commune</em> : voir le tuto <strong>Rechercher et filtrer</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: "Barre d'outils de la page Enseignants",
                    imageCaption: 'Toolbar de recherche, filtres, sélection et création.',
                },
            ],
        },
    ],
    tips: [
        "Utiliser un format de nommage stable (Nom Prénom) pour éviter les doublons. Les adresses email sont uniques, c'est ce qui permet d'empêcher la création de doublons.",
        'Maintenir à jour les disponibilités avant toute génération de planning.',
        "Vérifier le rattachement et le campus d'origine pour anticiper les contraintes logistiques.",
    ],
}






