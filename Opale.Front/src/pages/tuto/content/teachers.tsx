import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageProfScreenshot from '../../../assets/tuto/prof/page-prof.png'
import screenPageProfSuppressionScreenshot from '../../../assets/tuto/prof/page-prof.png'
import screenPopupProfScreenshot from '../../../assets/tuto/prof/page-prof-add.png'
import screenPopupProfModifScreenshot from '../../../assets/tuto/prof/page-prof-update.png'
import dropdownProfTypeScreenshot from '../../../assets/tuto/prof/page-prof-droplist-type.png'
import dropdownProfRattachementScreenshot from '../../../assets/tuto/prof/page-prof-droplist-rattachement.png'
import dropdownProfCampusScreenshot from '../../../assets/tuto/prof/page-prof-droplist-campus.png'
import dropdownProfPromoScreenshot from '../../../assets/tuto/prof/page-prof-droplist-promo.png'
import dropdownProfMatieresScreenshot from '../../../assets/tuto/prof/page-prof-droplist-matieres.png'

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
                        left: '82.6%',
                        top: '17.9%',
                        width: '15.0%',
                        height: '4.3%',
                        label: "Création d'enseignant",
                        labelLeft: '-4.2rem',
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
                    imagePlacement: 'beforeSubSteps',
                    imageHighlights: [
                        {
                            left: '21.9%',
                            top: '35.7%',
                            width: '23.6%',
                            height: '38.5%',
                            label: 'Informations',
                        },
                        {
                            left: '46.1%',
                            top: '35.6%',
                            width: '16.8%',
                            height: '17.8%',
                            label: 'Matières',
                        },
                        {
                            left: '62.7%',
                            top: '35.6%',
                            width: '16.6%',
                            height: '39.0%',
                            label: 'Disponibilités',
                        },
                    ],
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Informations</strong>: remplir <strong>Nom</strong>,{' '}
                                    <strong>Prénom</strong>, <strong>téléphone</strong>,{' '}
                                    <strong>Email Junia</strong> et <strong>Email perso</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Type</strong>: choisir le mode d'intervention de l'enseignant ({' '}
                                    <em>Présentiel</em>, <em>Hybride</em> ou <em>Distanciel</em>).
                                </>
                            ),
                            imageSrc: dropdownProfTypeScreenshot,
                            imageAlt: "Liste déroulante du type d'enseignant",
                            imageCaption: "Sélection du type d'enseignant.",
                            imageHighlight: {
                                left: '26.9%',
                                top: '47.7%',
                                width: '17.5%',
                                height: '26.0%',
                                label: 'Type',
                            },
                        },
                        {
                            text: (
                                <>
                                    <strong>Rattachement</strong>: indiquer <em>Interne</em> ou <em>Vacataire</em>.
                                </>
                            ),
                            imageSrc: dropdownProfRattachementScreenshot,
                            imageAlt: "Liste déroulante du rattachement de l'enseignant",
                            imageCaption: "Sélection du rattachement.",
                            imageHighlight: {
                                left: '28.0%',
                                top: '52.2%',
                                width: '16.1%',
                                height: '18.5%',
                                label: 'Rattachement',
                            },
                        },
                        {
                            text: (
                                <>
                                    <strong>Campus d'origine</strong>: préciser le campus de référence (ex:
                                    Bordeaux, Lille, Châteauroux) pour faciliter l'organisation inter-campus.
                                </>
                            ),
                            imageSrc: dropdownProfCampusScreenshot,
                            imageAlt: "Liste déroulante du campus d'origine",
                            imageCaption: "Sélection du campus d'origine.",
                            imageHighlight: {
                                left: '29.1%',
                                top: '56.8%',
                                width: '15.0%',
                                height: '19.0%',
                                label: 'Campus',
                            },
                        },
                        {
                            text: (
                                <>
                                    <strong>Matières enseignées</strong>: ajouter les matières enseignées puis
                                    associer, si nécessaire, les promotions cibles.
                                    <br />
                                    <em>Conseil</em>: pour attribuer ou désattribuer une matière, se référer à la
                                    section <strong>Attribuer des matières à un enseignant</strong>.
                                    <br />
                                    <em>Note</em> : voir le tuto{' '}
                                    <strong>Attribuer des matières à un enseignant</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Disponibilités</strong>: créer une ou plusieurs périodes, définir la
                                    plage de dates, puis renseigner la grille <strong>Matin / Après-midi</strong>{' '}
                                    du <strong>Lundi au Vendredi</strong>.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                                    <br />
                                    <em>Note</em> : voir le tuto{' '}
                                    <strong>Ajouter des périodes de disponibilités</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    Vérifier la légende <em>Disponible</em> / <em>Non disponible</em> pour éviter
                                    les inversions lors de la saisie.
                                </>
                            ),
                        },
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
                            <strong>Annuler, créer ou enregistrer</strong>.
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
                            <strong>Annuler, créer ou enregistrer</strong>.
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
                        left: '20.8%',
                        top: '39.6%',
                        width: '12.0%',
                        height: '7.4%',
                        label: 'Enseignant à modifier',
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
                    imagePlacement: 'beforeSubSteps',
                    imageHighlights: [
                        {
                            left: '21.9%',
                            top: '35.8%',
                            width: '18.1%',
                            height: '39.0%',
                            label: 'Informations',
                        },
                        {
                            left: '40.6%',
                            top: '35.7%',
                            width: '24.8%',
                            height: '18.1%',
                            label: 'Matières',
                        },
                        {
                            left: '66.0%',
                            top: '35.6%',
                            width: '14.0%',
                            height: '38.8%',
                            label: 'Disponibilités',
                        },
                    ],
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Informations</strong>: remplir <strong>Nom</strong>,{' '}
                                    <strong>Prénom</strong>, <strong>téléphone</strong>,{' '}
                                    <strong>Email Junia</strong> et <strong>Email perso</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Type</strong>: choisir le mode d'intervention de l'enseignant ({' '}
                                    <em>Présentiel</em>, <em>Hybride</em> ou <em>Distanciel</em>).
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Rattachement</strong>: indiquer <em>Interne</em> ou <em>Vacataire</em>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Campus d'origine</strong>: préciser le campus de référence (ex:
                                    Bordeaux, Lille, Châteauroux) pour faciliter l'organisation inter-campus.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Matières enseignées</strong>: ajouter les matières enseignées puis
                                    associer, si nécessaire, les promotions cibles.
                                    <br />
                                    <em>Conseil</em>: pour attribuer ou désattribuer une matière, se référer à la
                                    section <strong>Attribuer des matières à un enseignant</strong>.
                                    <br />
                                    <em>Note</em> : voir le tuto{' '}
                                    <strong>Attribuer des matières à un enseignant</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    <strong>Disponibilités</strong>: créer une ou plusieurs périodes, définir la
                                    plage de dates, puis renseigner la grille <strong>Matin / Après-midi</strong>{' '}
                                    du <strong>Lundi au Vendredi</strong>.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                                    <br />
                                    <em>Note</em> : voir le tuto{' '}
                                    <strong>Ajouter des périodes de disponibilités</strong>.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    Vérifier la légende <em>Disponible</em> / <em>Non disponible</em> pour éviter
                                    les inversions lors de la saisie.
                                </>
                            ),
                        },
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
                                    <strong>Annuler, créer ou enregistrer</strong>.
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
                {
                    text: (
                        <>
                            Sélectionner la <strong>promotion</strong> voulue.
                        </>
                    ),
                    imageSrc: dropdownProfPromoScreenshot,
                    imageAlt: 'Liste déroulante des promotions',
                    imageCaption: 'Sélection de la promotion.',
                    imageHighlight: {
                        left: '41.8%',
                        top: '40.2%',
                        width: '11.1%',
                        height: '39.1%',
                        label: 'Promotion',
                    },
                },
                {
                    text: (
                        <>
                            Sélectionner la <strong>matière</strong> voulue.
                            <br />
                            La liste affiche uniquement les matières de la promotion sélectionnée.
                            <br />
                            Si aucune promotion n'est sélectionnée, toutes les matières disponibles sont
                            proposées.
                            <br />
                            Si une matière est choisie sans promotion, la promotion associée est
                            automatiquement sélectionnée.
                            <br />
                            <em>Note</em> : si la matière est sélectionnée en premier, la promotion est
                            automatiquement remplie.
                            <br />
                            <em>Note</em> : un champ non modifiable affiche <strong>NA</strong>. Ce champ
                            affichera à l'avenir le volume horaire attribué à ce prof pour cette matière. Voir le
                            tuto <strong>Attribuer des matières à un enseignant</strong>.
                        </>
                    ),
                    imageSrc: dropdownProfMatieresScreenshot,
                    imageAlt: 'Liste déroulante des matières',
                    imageCaption: 'Sélection de la matière.',
                    imageHighlight: {
                        left: '45.8%',
                        top: '40.1%',
                        width: '17.1%',
                        height: '62.0%',
                        label: 'Matière',
                    },
                },
            ],
        },
        {
            title: 'Ajouter des périodes de disponibilités',
            steps: [
                {
                    text: (
                        <>
                            Depuis la <strong>carte de détail</strong> (création ou modification), cliquer sur{' '}
                            <strong>Ajouter une période de disponibilité</strong>.
                        </>
                    ),
                    imageSrc: screenPopupProfModifScreenshot,
                    imageAlt: "Carte de détail d'un enseignant",
                    imageCaption: "Ajout d'une période de disponibilité depuis la carte de détail.",
                    imageHighlight: {
                        left: '61.8%',
                        top: '44.8%',
                        width: '16.0%',
                        height: '3.4%',
                        label: 'Ajouter une période',
                    },
                },
                <>
                    Renseigner la <strong>date de début</strong> et la <strong>date de fin</strong> de la
                    période.
                    <br />
                    Une période de disponibilité peut couvrir une longue période tant que les
                    disponibilités par demi-journée du <strong>Lundi au Vendredi</strong> ne changent pas.
                    <br />
                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                </>,
                <>
                    Une fois toutes les périodes créées, cliquer sur <strong>Enregistrer</strong> ou{' '}
                    <strong>Créer</strong> selon le contexte.
                    <br />
                    <em>Action commune</em> : voir le tuto{' '}
                    <strong>Annuler, créer ou enregistrer</strong>.
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








