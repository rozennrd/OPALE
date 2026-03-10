import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageMatiereScreenshot from '../../../assets/tuto/matiere/page-matiere.png'
import screenPageMatiereSuppressionScreenshot from '../../../assets/tuto/matiere/page-matiere.png'
import popupMatiereUpdateAlertScreenshot from '../../../assets/tuto/matiere/page-matiere-update-alert.png'
import popupMatiereUpdateNoAlertScreenshot from '../../../assets/tuto/matiere/page-matiere-update-no-alert.png'
import dropdownMatiereProfScreenshot from '../../../assets/tuto/matiere/page-matiere-droplist-prof.png'

export const matieresTutorialContent: TutorialContent = {
    objective:
        'Administrer les matières de chaque promotion pour garantir une base pédagogique fiable pour les plannings.',
    expectedResult:
        'Les matières sont correctement structurées par promotion, avec des volumes cohérents et des affectations d\'enseignants maîtrisées.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Matières affiche l'ensemble des matières dans une vue consolidée par
                            <strong> promotion</strong>. Ces matières sont <strong>récupérées</strong> et{' '}
                            <strong>remplies automatiquement</strong> lors de l'import d'une maquette.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Vue générale de la page Matières dans OPALE',
                    imageCaption:
                        'Vue générale avec toolbar de recherche/filtres et liste des matières par promotion.',
                },
                <>
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>, la{' '}
                    <strong>création</strong> et la <strong>suppression en mode sélection</strong>.
                </>,
                <>
                    Les matières sont regroupées en <strong>catégories par promotion</strong> (ex: AP3, AP4, AP5,
                    etc.).
                </>,
                <>
                    Chaque carte matière présente le <strong>nom</strong>, les <strong>volumes horaires</strong>{' '}
                    (h total, TD, TP) et le <strong>semestre</strong>.
                </>,
                <>
                    La création d'une matière est <strong>en cours d'implémentation</strong>. Elle se fera via le <strong>bouton de la
                    toolbar</strong> et permettra de créer une matière si elle n'a pas été détectée lors de
                    l'import de la maquette.
                </>,
            ],
        },
        {
            title: 'Créer une matière',
            steps: [
                <>
                    Le bouton de création dans la toolbar est <strong>présent</strong> mais{' '}
                    <strong>non fonctionnel</strong> : la fonctionnalité n'est pas encore développée.
                </>,
                <>
                    Le but est de pouvoir créer une matière dans le cas où elle n'aurait pas été détectée lors
                    de l'import de la maquette.
                </>,
            ],
        },
        {
            title: 'Modifier une matière',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de la matière à modifier pour ouvrir le
                            pop-up de détail matière.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: "Accès à la modification d'une matière",
                    imageCaption: 'La carte matière ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '24.3%',
                        top: '42.7%',
                        width: '17.4%',
                        height: '9.2%',
                        label: 'Matière à modifier',
                        labelLeft: '-0.1rem',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up <strong>Détail matière</strong> est structuré en deux colonnes :
                            <strong> à gauche</strong> les informations de la matière, <strong> à droite</strong>{' '}
                            l'attribution des enseignants.
                        </>
                    ),
                },
                {
                    text: (
                        <>
                            Mettre à jour les informations dans le pop-up <strong>Détail matière</strong>.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateNoAlertScreenshot,
                    imageAlt: "Pop-up de modification d'une matière",
                    imageCaption:
                        "La carte de détail permet d'ajuster les volumes et les affectations d'enseignants.",
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '19.8%',
                        top: '30.5%',
                        width: '32.0%',
                        height: '45.0%',
                        label: 'Informations',
                    },
                    subSteps: [
                        <>
                            <strong>Champs modifiables</strong> (colonne information, à gauche) :
                            <ul>
                                <li>
                                    <strong>Nom de la matière</strong>
                                </li>
                                <li>
                                    <strong>Volume total (h)</strong>
                                </li>
                                <li>
                                    <strong>Volume TD (h)</strong>
                                </li>
                                <li>
                                    <strong>Volume TP (h)</strong>
                                </li>
                                <li>
                                    <strong>Volume Projet (h)</strong>
                                </li>
                                <li>
                                    <strong>Volume e-learning (h)</strong>
                                </li>
                                <li>
                                    <strong>Volume Autres (h)</strong>
                                </li>
                            </ul>
                        </>,
                        <>
                            Le nombre total d'épreuves et le détail des types d'épreuves sont affichés.
                        </>,
                        {
                            text: (
                                <>
                                    <strong>Attribuer des heures</strong> à un enseignant si nécessaire.
                                    <br />
                                    <em>Note</em> : voir le tuto{' '}
                                    <strong>Attribuer des heures à un enseignant</strong>.
                                </>
                            ),
                            imageSrc: popupMatiereUpdateNoAlertScreenshot,
                            imageAlt: "Attribution des heures dans le détail d'une matière",
                            imageCaption: "Attribution des heures aux enseignants depuis la carte de détail.",
                            imageHighlight: {
                                left: '54.0%',
                                top: '30.5%',
                                width: '26.2%',
                                height: '36.0%',
                                label: 'Enseignants',
                            },
                        },
                        <>
                            Un <strong>warning</strong> indique le nombre d'heures <strong>restantes</strong> à
                            attribuer. Il disparaît lorsqu'il ne reste plus rien à attribuer.
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
                                    <strong>Supprimer</strong>: supprime la matière affichée à l'écran. Cette
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
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement la matière.
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
                                    Cliquer sur <strong>Enregistrer</strong> enregistre la matière et ferme le
                                    pop-up de modification.
                                </>,
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Modifier la répartition du volume horaire',
            steps: [
                <>
                    Les volumes sont extraits de la maquette avec les règles suivantes :
                    <br />
                    <ul>
                        <li>
                            <strong>Volume total (h)</strong> = première valeur non nulle parmi{' '}
                            <strong>Nb heures planifiées</strong>, <strong>Nb heures étudiant</strong> ou{' '}
                            <strong>Nb heures encadrées</strong>. Si aucun total n'est renseigné, il est
                            calculé à partir de la somme des détails (<strong>cours magistral</strong>,{' '}
                            <strong>cours interactif</strong>, <strong>TD</strong>, <strong>TP</strong>,{' '}
                            <strong>projet</strong>, <strong>e-learning</strong>,{' '}
                            <strong>visites / conférences</strong>, <strong>auto-géré</strong>).
                        </li>
                        <li>
                            <strong>Volume TD (h)</strong> = <strong>TD + cours magistral + cours interactif</strong>.
                        </li>
                        <li>
                            <strong>Volume TP (h)</strong> = <strong>TP</strong>. Les autres types contribuent au
                            volume total.
                        </li>
                    </ul>
                </>,
                {
                    text: (
                        <>
                            Pour modifier le volume horaire total ou le nombre d'heures par type, cliquer dans le champ
                            et saisir la nouvelle valeur.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateNoAlertScreenshot,
                    imageAlt: "Pop-up de modification d'une matière",
                    imageCaption:
                        "La carte de détail permet d'ajuster les volumes et les affectations d'enseignants.",
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '19.8%',
                        top: '30.5%',
                        width: '32.0%',
                        height: '35.5%',
                        label: 'Informations',
                    },
                },
                <>
                    Si la somme des heures <strong>TD</strong> et <strong>TP</strong> dépasse le{' '}
                    <strong>volume total</strong>, le type modifié est automatiquement ajusté au maximum autorisé
                    pour respecter le total.
                </>,
            ],
        },
        {
            title: 'Attribuer des heures à un enseignant',
            steps: [
                {
                    text: (
                        <>
                            Depuis la <strong>carte de détail</strong> (en mode modification, et plus tard en
                            mode création). Les enseignants déjà attribués à la matière depuis la page
                            Enseignants sont affichés.
                            <br />
                            <em>Note</em> : voir le tuto <strong>Attribuer des matières à un enseignant</strong>.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateAlertScreenshot,
                    imageAlt: "Carte de détail d'une matière",
                    imageCaption: "Accès à l'attribution des heures par enseignant.",
                    imageHighlight: {
                        left: '54.0%',
                        top: '27.5%',
                        width: '26.2%',
                        height: '36.0%',
                        label: 'Enseignants',
                    },
                },
                {
                    text: (
                        <>
                            Si l'enseignant voulu n'est pas affiché, cliquer sur <strong>+ Ajouter</strong>.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateAlertScreenshot,
                    imageAlt: "Bouton d'ajout d'un enseignant",
                    imageCaption: "Le bouton + Ajouter permet d'ajouter un enseignant.",
                    imageHighlight: {
                        left: '54.5%',
                        top: '35.6%',
                        width: '7.2%',
                        height: '5.75%',
                        label: 'Ajouter',
                    },
                },
                {
                    text: (
                        <>
                            Sélectionner un <strong>enseignant</strong> en cliquant sur la liste déroulante.
                        </>
                    ),
                    imageSrc: dropdownMatiereProfScreenshot,
                    imageAlt: "Liste déroulante des enseignants",
                    imageCaption: "Sélection d'un enseignant.",
                    imageHighlight: {
                        left: '55.2%',
                        top: '44.6%',
                        width: '16.1%',
                        height: '16.9%',
                        label: 'Enseignant',
                    },
                },
                {
                    text: (
                        <>
                            Cliquer sur le champ du type de cours voulu et attribuer le nombre d'heures
                            souhaité. Si la valeur est supérieure à <strong>0</strong>, le label du type de cours
                            passe en <strong>vert</strong>.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateNoAlertScreenshot,
                    imageAlt: "Attribution des heures par type de cours",
                    imageCaption: "Les labels passent en vert quand des heures sont attribuées.",
                    imageHighlight: {
                        left: '55.3%',
                        top: '50.6%',
                        width: '5.15%',
                        height: '5.2%',
                        label: 'Labels verts',
                        labelLeft: '-0.4rem',
                    },
                },
                {
                    text: (
                        <>
                            Si la somme des heures par type dépasse le volume total, ou si un type dépasse son
                            volume prévu, le champ modifié est automatiquement ajusté au maximum autorisé. Si
                            aucun volume n'est prévu pour un type de cours, le champ n'est pas saisissable.
                        </>
                    ),
                },
                {
                    text: (
                        <>
                            Pour supprimer un enseignant, cliquer sur le bouton <strong>-</strong> à côté de son
                            nom.
                        </>
                    ),
                    imageSrc: popupMatiereUpdateNoAlertScreenshot,
                    imageAlt: "Suppression d'un enseignant",
                    imageCaption: "Bouton de suppression d'un enseignant.",
                    imageHighlight: {
                        left: '71.0%',
                        top: '45.75%',
                        width: '3.0%',
                        height: '5.2%',
                        label: 'Supprimer',
                        labelLeft: '-0.6rem',
                    },
                },
                {
                    text: (
                        <>
                            En bas à gauche, un <strong>warning</strong> indique le nombre d'heures restantes à
                            attribuer. Il disparaît quand il ne reste plus rien à attribuer. Un second warning
                            temporaire peut apparaître si un dépassement est détecté (environ{' '}
                            <strong>2 secondes</strong>).
                        </>
                    ),
                    imageSrc: popupMatiereUpdateAlertScreenshot,
                    imageAlt: "Warning d'heures restantes",
                    imageCaption: "Warning indiquant les heures restantes à attribuer.",
                    imageHighlight: {
                        left: '19.8%',
                        top: '70.9%',
                        width: '32.5%',
                        height: '8.5%',
                        label: 'Warning',
                    },
                },
            ],
        },
        {
            title: 'Supprimer une matière',
            steps: [
                {
                    text: (
                        <>
                            La suppression des matières se fait en <strong>mode sélection</strong> depuis la
                            toolbar, ou depuis la <strong>carte de détail</strong> d'une matière en modification.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereSuppressionScreenshot,
                    imageAlt: 'Suppression de matières en mode sélection',
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
                                    <strong>Recherche</strong> de matière.
                                </li>
                                <li>
                                    <strong>Sélectionner / Quitter sélection</strong> avec compteur des
                                    éléments sélectionnés.
                                </li>
                                <li>
                                    <strong>Réinitialiser les filtres</strong>.
                                </li>
                                <li>
                                    <strong>Ajouter une matière</strong> (bouton présent, non disponible).
                                </li>
                                <li>
                                    <strong>Filtre Semestre</strong> : Tous, S1, S2.
                                </li>
                                <li>
                                    <strong>Filtre Cycles</strong> (liste déroulante).
                                </li>
                                <li>
                                    <strong>Filtre Promotions</strong> (liste déroulante).
                                </li>
                                <li>
                                    <strong>Filtre Enseignants</strong> (liste déroulante).
                                </li>
                            </ul>
                            <em>Action commune</em> : voir le tuto <strong>Rechercher et filtrer</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: "Barre d'outils de la page Matières",
                    imageCaption: 'Toolbar de recherche, filtres et actions.',
                },
            ],
        },
    ],
    tips: [
        'Maintenir des libellés de matières stables pour éviter les doublons entre promotions.',
        'Vérifier la cohérence des volumes avant validation pour limiter les erreurs de planification.',
        'Contrôler la répartition TD/TP par enseignant pour garder une charge réaliste.',
    ],
}





