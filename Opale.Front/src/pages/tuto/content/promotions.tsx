import promoPageScreenshot from '../../../assets/tuto/promo/page-promo.png'
/* eslint-disable react/no-unescaped-entities */
import popupAddPromotionScreenshot from '../../../assets/tuto/promo/page-promo-add-promo.png'
import popupCreateCycleScreenshot from '../../../assets/tuto/promo/page-promo-add-cycle.png'
import popupEditPromotionScreenshot from '../../../assets/tuto/promo/page-promo-update-promo.png'
import popupEditPromotionDetailsScreenshot from '../../../assets/tuto/promo/page-promo-update-promo.png'
import popupEditPromotionFullScreenshot from '../../../assets/tuto/promo/page-promo-update-promo-full.png'
import promoSelectMaquetteScreenshot from '../../../assets/tuto/promo/page-promo-select-maquette.png'
import promoPrevisualiserMaquetteScreenshot from '../../../assets/tuto/promo/page-promo-previsualiser-maquette.png'
import promoMaquetterSelectionnerScreenshot from '../../../assets/tuto/promo/page-promo-maquetter-selectionner.png'
import promoLierSpeScreenshot from '../../../assets/tuto/promo/page-promo-lier-spe.png'
import promoLierSpeDroplistScreenshot from '../../../assets/tuto/promo/page-promo-lier-spe-droplist.png'
import type { TutorialContent } from '../types'
export const promotionsTutorialContent: TutorialContent = {
    objective: 'Créer et maintenir les cycles et promotions avec leurs structures pédagogiques.',
    expectedResult: 'Les cycles et promotions sont complets, structurés et exploitables par les modules de planning.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page Promotions',
            steps: [
                {
                    text: (
                        <>
                            La page Promotions <strong>liste les cycles</strong> et les{' '}
                            <strong>promotions de chaque cycle</strong>.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Capture de la page Promotions dans OPALE",
                    imageCaption:
                        'Vue générale de la page Promotions avec cycles existants et zone de création.',
                },
                {
                    text: (
                        <>
                            La page est structurée avec <strong>une carte par cycle</strong>. Chaque carte est
                            indépendante des autres.
                        </>
                    ),
                    imageSrc: popupEditPromotionDetailsScreenshot,
                    imageAlt: "Carte de cycle sur la page Promotions",
                    imageCaption: "Chaque cycle est affiché dans une carte indépendante.",
                },
                <>
                    Depuis une carte, vous pouvez <strong>supprimer le cycle</strong> via l'icône corbeille
                    du cycle.
                </>,
                <>
                    Depuis cette même carte, vous pouvez <strong>ajouter une promotion</strong>,{' '}
                    <strong>supprimer une promotion</strong> et <strong>modifier les informations</strong>{' '}
                    d'une promotion.
                </>,
                <>
                    La carte permet aussi de <strong>déposer les maquettes pédagogiques</strong> du cycle
                    et/ou des promotions du cycle.
                </>,
                <>
                    Pour créer un nouveau cycle, cliquer sur le <strong>bouton +</strong> dans la{' '}
                    <strong>zone pointillée</strong> à droite de la page.
                </>,
            ],
        },
        {
            title: 'Créer un cycle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer dans <u>la zone pointillée avec le bouton +</u> pour ouvrir le pop-up de
                            création.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Zone pour ouvrir le pop-up de création d'un cycle sur la page Promotions",
                    imageCaption: "Cette zone ouvre le pop-up contenant les champs de création du cycle.",
                    imageHighlight: {
                        left: '19.6%',
                        top: '72.8%',
                        width: '20.5%',
                        height: '14.3%',
                        label: "Zone d'ouverture du pop-up",
                    },
                },
                {
                    text: <>Renseigner les <strong>champs obligatoires</strong> du cycle.</>,
                    imageSrc: popupCreateCycleScreenshot,
                    imageAlt: "Pop-up de création d'un cycle dans OPALE",
                    imageCaption: "Le pop-up de création contient les champs obligatoires du cycle.",
                    imageHighlights: [
                        {
                            left: '79.45%',
                            top: '28.25%',
                            width: '1.66%',
                            height: '3.5%',
                            label: "Annuler l'action",
                        },
                        {
                            left: '73.6%',
                            top: '65.5%',
                            width: '7.7%',
                            height: '6.7%',
                            label: "Enregistrer l'action",
                        },
                    ],
                    subSteps: [
                        <>
                            Champ <strong>Nom du cycle</strong>: saisir un nom clair (ex: ADI, CIR).
                            <br />
                            Il n'est pas possible de donner un nom de cycle déjà existant.
                        </>,
                        <>
                            Champ <strong>Type de formation</strong>: choisir via la liste déroulante
                            <em>Formation Initiale</em> ou <em>Formation en apprentissage</em>.
                        </>,
                        <>
                            Champ <strong>Nombre de promotions</strong>: saisir le nombre d'années du cycle
                            (ex: <strong>3</strong> pour un cycle en 3 ans).
                            <br />
                            Les promotions sont créées automatiquement avec le nom du cycle, puis
                            incrémentées de <strong>1</strong> jusqu'au nombre d'années.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur la <strong>croix</strong> en haut à droite ou sur la touche
                            <strong>Escape</strong> du clavier ferme le pop-up de création.
                            Attention, pas de message de confirmation d'action.
                        </>
                    ),
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Enregistrer</strong> ouvre un pop-up de confirmation.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Annuler, créer ou enregistrer</strong>.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite ou
                            <strong>Escape</strong> renvoie sur le pop-up de création en conservant les
                            informations saisies.
                        </>,
                        <>
                            <strong>Créer</strong> crée le cycle et ferme le pop-up de création.
                        </>,
                    ],
                },
            ],
        },
        {
            title: "Ajouter une promotion au sein d'un cycle",
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur le bouton <strong>Ajouter une promotion</strong> dans la carte du
                            cycle cible. Cette action ouvre un pop-up.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Bouton Ajouter une promotion sur une carte de cycle",
                    imageCaption:
                        "Le bouton Ajouter une promotion ouvre le pop-up d'ajout pour le cycle sélectionné.",
                    imageHighlight: {
                        left: '19.6%',
                        top: '45.2%',
                        width: '20.7%',
                        height: '6.0%',
                        label: 'Bouton Ajouter une promotion',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner le pop-up <strong>Ajouter une promotion</strong> avec le{' '}
                            <strong>nom de la promotion</strong>.
                        </>
                    ),
                    imageSrc: popupAddPromotionScreenshot,
                    imageAlt: "Pop-up Ajouter une promotion dans OPALE",
                    imageCaption: "Le pop-up demande uniquement le nom de la promotion.",
                    imageHighlights: [
                        {
                            left: '61.57%',
                            top: '40.4%',
                            width: '1.66%',
                            height: '3.5%',
                            label: "Annuler l'action",
                        },
                        {
                            left: '57.85%',
                            top: '52.55%',
                            width: '5.8%',
                            height: '6.7%',
                            label: "Ajouter la promotion",
                            labelLeft: '1.2rem',
                        },
                        {
                            left: '52.8%',
                            top: '52.5%',
                            width: '5.4%',
                            height: '6.7%',
                            label: "Annuler l'action",
                            labelLeft: '-2.8rem',
                        },
                    ],
                    subSteps: [
                        <>
                            Renseigner le <strong>nom de la promotion</strong> avec la convention choisie.
                            <br />
                            <em>Conseil</em>: garder un <strong>même système de nommage</strong> au sein d'un
                            cycle (ex: AP3, AP4, AP5) pour faciliter la lecture des plannings.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Ajouter</strong> selon le
                            résultat souhaité.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up sans création de promotion. Possible
                            aussi d'appuyer sur <strong>Escape</strong> ou sur la <strong>croix</strong> en haut
                            à droite.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler, créer ou enregistrer</strong>.
                        </>,
                        <>
                            <strong>Ajouter</strong>: valide la création et affiche la promotion dans la carte
                            du cycle.
                        </>,
                    ],
                },
            ],
        },
        {
            title: "Modifier les informations d'une promotion",
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>stylo</strong> (ou le bouton <strong>Modifier</strong>{' '}
                            si les icônes sont désactivées) sur la ligne de la promotion à modifier. Cela
                            ouvre le pop-up de modification.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Bouton stylo pour modifier une promotion",
                    imageCaption: "Le stylo de la ligne promotion ouvre le pop-up de modification.",
                    imageHighlight: {
                        left: '33.3%',
                        top: '22.2%',
                        width: '3.3%',
                        height: '6.1%',
                        label: 'Bouton Modifier',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner les informations du pop-up <strong>Modifier une promotion</strong>,
                            organisé en <strong>4 parties</strong>.
                        </>
                    ),
                    imageSrc: popupEditPromotionScreenshot,
                    imageAlt: "Pop-up Modifier une promotion dans OPALE",
                    imageCaption: "Le pop-up de modification est organisé en 4 parties.",
                    imageHighlights: [
                        {
                            left: '19.2%',
                            top: '31.0%',
                            width: '18.65%',
                            height: '37.0%',
                            label: 'Partie 1',
                        },
                        {
                            left: '37.9%',
                            top: '31.0%',
                            width: '18.55%',
                            height: '15.0%',
                            label: 'Partie 2',
                        },
                        {
                            left: '37.9%',
                            top: '46.05%',
                            width: '18.55%',
                            height: '15.0%',
                            label: 'Partie 3',
                        },
                        {
                            left: '56.5%',
                            top: '31.0%',
                            width: '23.65%',
                            height: '37.0%',
                            label: 'Partie 4',
                        },
                    ],

                    imagePlacement: 'beforeSubSteps',
                    imageAfterSrc: popupEditPromotionFullScreenshot,
                    imageAfterAlt: "Pop-up Modifier une promotion avec toutes les informations",
                    imageAfterCaption: "Aperçu complet du pop-up après la saisie des informations.",
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Partie 1 - Informations principales</strong>
                                </>
                            ),
                            subSteps: [
                                <>
                                    Renseigner le <strong>nom de la promotion</strong>, le
                                    <strong>nombre d'étudiants</strong>, la <strong>date de début</strong>
                                    et la <strong>date de fin</strong>.
                                </>,
                                <>
                                    Vérifier que les dates affichées par défaut sont celles déjà
                                    enregistrées pour la promotion. Si elles sont vides, renseigner
                                    la date de début et la date de fin.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                                </>,
                            ],
                        },
                        {
                            text: (
                                <>
                                    <strong>Partie 2 - Groupes</strong>
                                </>
                            ),
                            subSteps: [
                                <>
                                    Créer autant de groupes que souhaité pour les matières communes,
                                    puis définir le nombre d'étudiants par groupe (ex: 40 étudiants
                                    répartis en 2 groupes de 20).
                                </>,
                                <>
                                    Cliquer sur <strong>+ Ajouter un groupe</strong>.
                                </>,
                            ],
                        },
                        {
                            text: (
                                <>
                                    <strong>Partie 3 - Spécialités</strong>
                                </>
                            ),
                            subSteps: [
                                <>
                                    Créer les spécialités de la promotion (ex: cybersécurité, dev)
                                    et définir le nombre d'élèves dans chaque spécialité. Les
                                    spécialités sont <strong>indépendantes</strong> des groupes.
                                </>,
                                <>
                                    Cliquer sur <strong>+ Ajouter une spécialité</strong>.
                                </>,
                            ],
                        },
                        {
                            text: (
                                <>
                                    <strong>Partie 4 - Contraintes académiques</strong>
                                </>
                            ),
                            subSteps: [
                                <>
                                    Définir les plages de dates de <strong>Entreprise</strong> (ou
                                    <strong>Vacances</strong> pour un parcours initial),
                                    <strong>Stages</strong>, <strong>International</strong>,
                                    <strong>Partiels</strong> et <strong>Rattrapages</strong>.
                                </>,
                                <>
                                    Repérer le message <strong>Info : Les vacances scolaires sont déjà
                                    récupérées via l'API. Inutile de les ajouter manuellement.</strong>
                                    pour les cycles initiaux.
                                </>,
                                <>
                                    Cliquer sur <strong>+</strong> pour ajouter une période et sur
                                    <strong>-</strong> pour supprimer la période.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                                </>,
                                <>
                                    Définir correctement ces périodes est essentiel pour afficher clairement
                                    le planning macro et éviter de poser des cours sur ces plages en
                                    planning micro.
                                </>,
                            ],
                        },
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Enregistrer</strong> pour enregistrer les modifications.
                        </>
                    ),
                    subSteps: [
                        <>
                            Si aucune modification n'a été faite, cliquer sur <strong>Enregistrer</strong> fait
                            quitter automatiquement.
                        </>,
                        <>
                            Si des modifications ont été faites, cliquer sur <strong>Enregistrer</strong> ouvre
                            un pop-up de confirmation.
                            <br />
                            <strong>Enregistrer</strong>: enregistre les modifications et fait quitter.
                            <br />
                            <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite, ou{' '}
                            <strong>Escape</strong>: revient sur la <strong>carte de détail</strong>. Rien n'est
                            enregistré, les modifications restent visibles.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler, créer ou enregistrer</strong>.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur la <strong>croix</strong> en haut à droite ou appuyer sur{' '}
                            <strong>Escape</strong> pour quitter la fenêtre.
                        </>
                    ),
                    subSteps: [
                        <>
                            Si aucune modification n'a été faite, le pop-up de modification se ferme.
                        </>,
                        <>
                            Si des modifications ont été faites, un pop-up de confirmation s'ouvre.
                            <br />
                            <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite, ou{' '}
                            <strong>Escape</strong>: revient sur la <strong>carte de détail</strong>, les
                            modifications restent visibles.
                            <br />
                            <strong>Fermer sans enregistrer</strong>: ferme le pop-up sans enregistrer.
                            <br />
                            <strong>Enregistrer et fermer</strong>: enregistre et ferme le pop-up.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Importer une ou plusieurs maquettes',
            steps: [
                {
                    text: (
                        <>
                            Importer une ou plusieurs maquettes Excel en utilisant l'une des méthodes
                            suivantes.
                        </>
                    ),
                    subSteps: [
                        <>
                            Méthode 1 : faire un <strong>drag and drop</strong> d'une ou plusieurs maquettes
                            Excel dans la zone dédiée du cycle cible. Les fichiers acceptés sont
                            <strong> uniquement</strong> des fichiers Excel.
                        </>,
                        {
                            text: (
                                <>
                                    Méthode 2 : cliquer sur la zone de <strong>drag and drop</strong> pour
                                    ouvrir l'explorateur de fichiers.
                                </>
                            ),
                            imageSrc: promoPageScreenshot,
                            imageAlt: "Zone de drag and drop pour importer une maquette",
                            imageCaption: "Cliquer sur la zone ouvre l'explorateur de fichiers.",
                            imagePlacement: 'beforeSubSteps',
                            imageHighlight: {
                                left: '20.3%',
                                top: '51.0%',
                                width: '19.8%',
                                height: '10.4%',
                                label: "Zone de drag and drop ou de clic pour ouvrir l'explorateur de fichiers",
                                labelLeft: '-1rem',
                            },
                            subSteps: [
                                {
                                    text: (
                                        <>
                                            Sélectionner un ou plusieurs fichiers Excel, puis cliquer sur
                                            <strong> Ouvrir</strong>.
                                            <br />
                                            L'explorateur affiche uniquement les fichiers Excel et les dossiers.
                                        </>
                                    ),
                                    imageSrc: promoSelectMaquetteScreenshot,
                                    imageAlt: "Explorateur de fichiers pour sélectionner la maquette",
                                    imageCaption: "Sélectionner les fichiers Excel à importer.",
                                },
                            ],
                        },
                    ],
                },
                {
                    text: (
                        <>
                            Vérifier la prévisualisation de la maquette.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    Dans la prévisualisation, vérifier les informations suivantes.
                                </>
                            ),
                            imageSrc: promoPrevisualiserMaquetteScreenshot,
                            imageAlt: "Prévisualisation de la maquette Excel",
                            imageCaption: "La prévisualisation détaille les données extraites de la maquette.",
                            imageHighlights: [
                                {
                                    left: '20.3%',
                                    top: '2.5%',
                                    width: '59.8%',
                                    height: '8.7%',
                                    label: "En-tête du pop-up",
                                    labelLeft: '-7rem',
                                    labelTop: '3rem',
                                    labelWidth: '6.5rem',
                                },
                                {
                                    left: '20.3%',
                                    top: '11.4%',
                                    width: '59.8%',
                                    height: '20.9%',
                                    label: "Tableau affichant les informations principales",
                                    labelLeft: '-7rem',
                                    labelTop: '5rem',
                                    labelWidth: '6.5rem',
                                },
                                {
                                    left: '20.3%',
                                    top: '32.5%',
                                    width: '59.8%',
                                    height: '6.4%',
                                    label: "Navigation entre les promotions",
                                    labelLeft: '-7rem',
                                    labelTop: '3rem',
                                    labelWidth: '6.5rem',
                                },
                                {
                                    left: '20.3%',
                                    top: '39.1%',
                                    width: '59.8%',
                                    height: '51.2%',
                                    label: "Tableau affichant la liste des matières et quelques informations",
                                    labelLeft: '-7rem',
                                    labelTop: '10rem',
                                    labelWidth: '6.5rem',
                                },
                            ],
                            subSteps: [
                                <>
                                    Vérifier dans le premier tableau : <strong>Année scolaire</strong>,
                                    <strong>Cycle détecté</strong>, <strong>Promotions détectées</strong>,
                                    <strong>Spécialités détectées</strong>, <strong>Nombre de matières extraites</strong>,
                                    <strong>Nombre d'avertissements</strong> et <strong>Feuilles détectées</strong>.
                                </>,
                                <>
                                    <em>Action commune</em> : vérifier dans le second tableau : <strong>Promo</strong>,
                                    <strong>UE</strong>, <strong>Matière</strong>, <strong>Semestres</strong>,
                                    <strong>Spécialité</strong> (si disponible), <strong>Total heures</strong> et
                                    <strong>Total des épreuves</strong>.
                                </>,
                                <>
                                    <em>Action commune</em> : si plusieurs promotions sont détectées, utiliser
                                    <strong>Promotion précédente</strong> et <strong>Promotion suivante</strong>. Ces
                                    éléments sont des <strong>boutons</strong>. Le centre affiche le nom de la
                                    promotion et l'index <strong>(n/x)</strong>.
                                </>,
                            ],
                        },
                    ],
                },
                {
                    text: (
                        <>
                            Valider ou annuler la prévisualisation.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    Cliquer sur <strong>Annuler</strong> (ou la <strong>croix</strong> /
                                    <strong>Escape</strong>) ou sur <strong>Valider</strong>.
                                    <br />
                                    <em>Action commune</em> : voir le tuto
                                    <strong> Annuler, créer ou enregistrer</strong>.
                                </>
                            ),
                            imageSrc: promoPrevisualiserMaquetteScreenshot,
                            imageAlt: "Boutons Annuler et Valider sur la prévisualisation",
                            imageCaption: "Les boutons de validation se trouvent en bas du pop-up.",
                        },
                        {
                            text: (
                                <>
                                    Si <strong>Valider</strong> est sélectionné, le nom du fichier apparaît dans
                                    la zone de <strong>drag and drop</strong>.
                                    <br />
                                    Vous pouvez prévisualiser d'autres maquettes sans supprimer celles déjà validées.
                                    <br />
                                    Cliquer sur la <strong>croix</strong> d'un fichier pour le retirer.
                                </>
                            ),
                            imageSrc: promoMaquetterSelectionnerScreenshot,
                            imageAlt: "Fichiers de maquette sélectionnés",
                            imageCaption: "Les fichiers validés apparaissent dans la zone de sélection.",
                            imageHighlight: {
                                left: '20.3%',
                                top: '62.2%',
                                width: '19.8%',
                                height: '5.1%',
                                label: "Liste des fichiers sélectionnés et validés",
                                labelLeft: '-1rem',
                            },
                        },
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Importer la maquette</strong> une fois toutes les maquettes
                            sélectionnées.
                        </>
                    ),
                    imageSrc: promoMaquetterSelectionnerScreenshot,
                    imageAlt: "Bouton Importer la maquette",
                    imageCaption: "Le bouton Importer la maquette lance l'import des fichiers sélectionnés.",
                    imageHighlight: {
                        left: '27.7%',
                        top: '66.75%',
                        width: '11.6%',
                        height: '6.2%',
                        label: "Bouton Importer"
                    },
                    subSteps: [
                        {
                            text: (
                                <>
                                    Si des spécialités sont détectées, un pop-up d'association s'ouvre. Sinon,
                                    l'import démarre directement.
                                </>
                            ),
                            imageSrc: promoLierSpeScreenshot,
                            imageAlt: "Pop-up de liaison des spécialités",
                            imageCaption: "Le pop-up permet de lier les spécialités détectées et déclarées.",
                            subSteps: [
                                <>Vérifier que le nom du fichier apparaît en sous-titre du pop-up.</>,
                                <>
                                    Repérer : à gauche les <strong>spécialités détectées</strong>, à droite les
                                    <strong>spécialités déclarées</strong> (issues des promotions).
                                </>,
                                {
                                    text: (
                                        <>
                                            Pour chaque spécialité détectée, sélectionner la spécialité déclarée via
                                            la liste déroulante.
                                        </>
                                    ),
                                    imageSrc: promoLierSpeDroplistScreenshot,
                                    imageAlt: "Listes déroulantes de liaison des spécialités",
                                    imageCaption: "Chaque spécialité détectée doit être associée via la liste.",
                                    imageHighlight: {
                                        left: '41.8%',
                                        top: '43.8%',
                                        width: '7.5%',
                                        height: '16.9%',
                                        label: "Liste des spécialités déclarées",
                                        labelLeft: '-1.8rem',
                                    },
                                },
                                {
                                    text: (
                                        <>
                                            Vous pouvez <strong>ajouter</strong>, <strong>supprimer</strong> ou
                                            <strong>modifier</strong> le nom et les effectifs des spécialités déclarées.
                                            Ces changements sont enregistrés dans le détail de la promotion concernée.
                                        </>
                                    ),
                                    imageSrc: promoLierSpeScreenshot,
                                    imageAlt: "Actions disponibles dans le pop-up de liaison",
                                    imageCaption: "Les actions permettent d'ajuster les spécialités déclarées.",
                                    imageHighlights: [
                                        {
                                            left: '69.1%',
                                            top: '44.1%',
                                            width: '7.2%',
                                            height: '5.2%',
                                            label: "Bouton Ajouter une spécialité",
                                            labelLeft: '-1rem',
                                        },
                                        {
                                            left: '72.05%',
                                            top: '49.2%',
                                            width: '2.5%',
                                            height: '12.0%',
                                            label: "Bouton Supprimer une spécialité",
                                            labelLeft: '1.8rem',
                                            labelTop: '1.8rem',
                                        },
                                        {
                                            left: '50.7%',
                                            top: '49.2%',
                                            width: '21.9%',
                                            height: '5.4%',
                                            label: "Champ nom et nombre d'étudiants",
                                            labelLeft: '-1.5rem',
                                        },
                                    ],
                                },
                                <>
                                    Si une spécialité détectée n'est pas liée, ses matières sont importées en
                                    <strong>tronc commun</strong>.
                                </>,
                                <>
                                    Cliquer sur <strong>Importer sans lier</strong> pour importer toutes les
                                    matières en tronc commun.
                                </>,
                                <>
                                    Cliquer sur <strong>Appliquer & importer</strong> pour appliquer les liaisons.
                                </>,
                                <>
                                    Cliquer sur la <strong>croix</strong> ou appuyer sur <strong>Escape</strong>
                                    annule l'association et revient à l'étape <strong>4</strong> (Importer la
                                    maquette).
                                </>,
                            ],
                        },
                    ],
                },
                <>
                    Attendre quelques instants : un message de récap apparaît dans la zone de
                    <strong>drag and drop</strong>.
                </>,
            ],
        },
        {
            title: 'Supprimer un cycle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>poubelle</strong> (ou le bouton <strong>Supprimer</strong> si les icônes sont désactivées) sur la carte du cycle.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Bouton de suppression d'un cycle",
                    imageCaption: "La corbeille du cycle supprime le cycle complet et son contenu associé.",
                    imageHighlight: {
                        left: '36.6%',
                        top: '14.1%',
                        width: '3.5%',
                        height: '7.0%',
                        label: "Bouton Supprimer un cycle",
                        labelLeft: '-1rem'
                    },
                },
                <>
                    <strong>Corbeille du cycle</strong> (en haut de la carte): supprime le cycle complet et
                    son contenu associé.
                </>,
                <>
                    <strong>Étape 2 (à venir)</strong>: un pop-up de confirmation apparaîtra pour valider ou
                    annuler la suppression.
                    <br />
                    <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                </>,
            ],
        },
        {
            title: 'Supprimer une promotion',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>poubelle</strong> (ou le bouton <strong>Supprimer</strong> si les icônes sont désactivées) sur la ligne promotion.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: "Bouton de suppression d'une promotion",
                    imageCaption: "La corbeille de la promotion supprime uniquement la promotion cible.",
                    imageHighlight: {
                        left: '35.7%',
                        top: '22.35%',
                        width: '3.7%',
                        height: '6.8%',
                        labelLeft: '-1rem',
                    },
                },
                <>
                    <strong>Corbeille d'une promotion</strong> (sur la ligne promotion): supprime uniquement
                    la promotion cible.
                </>,
                <>
                    <strong>Étape 2 (à venir)</strong>: un pop-up de confirmation apparaîtra pour valider ou
                    annuler la suppression.
                    <br />
                    <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                </>,
            ],
        },
    ],
    tips: [
        'Nommer de façon stable les cycles, promotions, spécialités et groupes pour faciliter les imports futurs.',
        'Revérifier les contraintes avant de lancer une génération de planning.',
    ],
}

