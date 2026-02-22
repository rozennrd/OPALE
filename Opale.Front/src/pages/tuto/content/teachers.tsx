import type { TutorialContent } from '../types'
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
                    Chaque carte enseignant contient les informations clés (<strong>nom</strong>,{' '}
                    <strong>téléphone</strong>, <strong>mode d'intervention</strong>) et sert de point d'accès
                    pour la consultation/détail.
                </>,
                <>
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>, la{' '}
                    <strong>création</strong> et la <strong>suppression en mode sélection</strong>.
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
                        label: 'Création enseignant',
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
                            <strong>Téléphone</strong>, <strong>Email Junia</strong> et{' '}
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
                        </>,
                        <>
                            <strong>Disponibilités</strong>: créer une ou plusieurs périodes, définir la plage de
                            dates, puis renseigner la grille <strong>Matin / Après-midi</strong> du{' '}
                            <strong>Lundi au Vendredi</strong>.
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
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour finaliser.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans sauvegarde</em>.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: valide la fiche enseignant et la rend disponible dans la
                            liste.
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
                    subSteps: [
                        <>
                            Mettre à jour les <strong>informations personnelles</strong>: Nom, Prénom, Téléphone,
                            Email Junia, Email perso.
                        </>,
                        <>
                            Vérifier la cohérence de <strong>Type</strong>, <strong>Rattachement</strong> et{' '}
                            <strong>Campus d'origine</strong>.
                        </>,
                        <>
                            Ajuster les <strong>matières enseignées</strong> et les promotions associées selon
                            la charge pédagogique réelle.
                        </>,
                        <>
                            Actualiser les <strong>disponibilités</strong> (périodes, grille hebdomadaire) pour
                            garantir des plannings fiables.
                        </>,
                        <>
                            En mode édition, le bouton <strong>Supprimer</strong> peut être affiché selon les
                            règles de la page.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour valider
                            l'édition.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: abandonne les modifications en cours.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: applique les changements sur la fiche enseignant.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Supprimer un enseignant',
            steps: [
                {
                    text: (
                        <>
                            <strong>Étape 1.1</strong>: cliquer sur <strong>Sélectionner</strong> depuis la toolbar
                            pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Activation du mode suppression enseignant',
                    imageCaption: 'Le bouton Sélectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '76.7%',
                        top: '19.8%',
                        width: '9.7%',
                        height: '5.9%',
                        label: 'Mode sélection',
                    },
                },
                {
                    text: (
                        <>
                            Cocher un ou plusieurs enseignants, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfSuppressionScreenshot,
                    imageAlt: "Suppression d'enseignants en mode sélection",
                    imageCaption:
                        'Le mode sélection permet une suppression unitaire ou multiple des enseignants.',
                    imageHighlights: [
                        {
                            left: '76.7%',
                            top: '19.8%',
                            width: '9.7%',
                            height: '5.9%',
                            label: 'Sélection active',
                        },
                        {
                            left: '86.6%',
                            top: '29.35%',
                            width: '8.9%',
                            height: '6.0%',
                            label: 'Supprimer (n)',
                        },
                    ],
                    subSteps: [
                        <>
                            Le compteur <strong>(n)</strong> indique le nombre d'enseignants sélectionnés.
                        </>,
                        <>
                            Les actions <strong>Tout sélectionner</strong> et <strong>Effacer</strong> facilitent
                            l'ajustement de la sélection avant suppression.
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
                            La barre d'outils regroupe les fonctions de <strong>recherche</strong>,{' '}
                            <strong>filtrage</strong> et <strong>actions rapides</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: "Barre d'outils de la page Enseignants",
                    imageCaption: 'Toolbar de recherche, filtres, sélection et création.',
                    imageHighlights: [
                        {
                            left: '22.1%',
                            top: '19.8%',
                            width: '30.4%',
                            height: '5.8%',
                            label: 'Recherche',
                        },
                        {
                            left: '52.8%',
                            top: '19.8%',
                            width: '9.0%',
                            height: '5.8%',
                            label: 'Filtre matières',
                            labelLeft: '-0.4rem',
                        },
                        {
                            left: '61.9%',
                            top: '19.8%',
                            width: '15.3%',
                            height: '5.8%',
                            label: 'Filtres de mode',
                            labelTop: '3rem',
                        },
                        {
                            left: '77.4%',
                            top: '19.8%',
                            width: '8.9%',
                            height: '5.8%',
                            label: 'Sélection',
                            labelLeft: '-0.4rem',
                        },
                        {
                            left: '86.5%',
                            top: '19.8%',
                            width: '6.0%',
                            height: '5.8%',
                            label: 'Réinitialisation des filtres',
                            labelLeft: '-3rem',
                            labelTop: '3rem',
                        },
                        {
                            left: '92.3%',
                            top: '19.7%',
                            width: '2.7%',
                            height: '5.4%',
                            label: 'Création',
                            labelLeft: '-1.8rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer rapidement un enseignant par nom ou
                            prénom.
                        </>,
                        <>
                            <strong>Filtre Matières</strong>: afficher uniquement les enseignants rattachés à une
                            matière donnée.
                        </>,
                        <>
                            <strong>Filtres de mode</strong>: <em>Tous</em>, <em>Présentiel</em>,{' '}
                            <em>Hybride</em>, <em>Distanciel</em>.
                        </>,
                        <>
                            <strong>Sélectionner</strong>: activer le mode de suppression multiple.
                        </>,
                        <>
                            <strong>Reset filtres</strong>: revenir rapidement à la vue complète.
                        </>,
                        <>
                            Le bouton <strong>+</strong> ouvre le pop-up de création d'un enseignant.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Utiliser un format de nommage stable (Nom Prénom) pour éviter les doublons.',
        'Maintenir à jour les disponibilités avant toute génération de planning.',
        "Vérifier le rattachement et le campus d'origine pour anticiper les contraintes logistiques.",
    ],
}

