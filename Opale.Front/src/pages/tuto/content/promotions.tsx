import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
/* eslint-disable react/no-unescaped-entities */
import popupAddPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-ajouter-promotion.png'
import popupCreateCycleScreenshot from '../../../assets/tuto/promo/screen-pop-up-creer-cycle.png'
import popupEditPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-modifier-promo.png'
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
                    imageAlt: 'Capture de la page Promotions dans OPALE',
                    imageCaption:
                        'Vue générale de la page Promotions avec cycles existants et zone de création.',
                },
                <>
                    La page est structurée avec <strong>une carte par cycle</strong>. Chaque carte est
                    indépendante des autres.
                </>,
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
                    imageCaption: 'Cette zone ouvre le pop-up contenant les champs de création du cycle.',
                    imageHighlight: {
                        left: '71.4%',
                        top: '12.5%',
                        width: '25.6%',
                        height: '57.5%',
                        label: "Zone d'ouverture du pop-up",
                    },
                },
                {
                    text: <>Renseigner les <strong>champs obligatoires</strong> du cycle.</>,
                    imageSrc: popupCreateCycleScreenshot,
                    imageAlt: "Pop-up de création d'un cycle dans OPALE",
                    imageCaption: 'Le pop-up de création contient les champs obligatoires du cycle.',
                    subSteps: [
                        <>
                            Champ <strong>Nom du cycle</strong>: saisir un nom clair (ex: ADI, CIR).
                            <br />
                            On ne peut pas donner un nom de cycle existant
                        </>,
                        <>
                            Champ <strong>Type de formation</strong>: choisir via la liste déroulante{' '}
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
                            Cliquer sur <strong>Enregistrer</strong> ou <strong>Annuler</strong> selon le
                            résultat souhaité.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Enregistrer</strong>: crée le cycle.
                        </>,
                        <>
                            <strong>Annuler</strong>: ferme le pop-up sans créer le cycle. Possible aussi de
                            cliquer sur la <strong>croix</strong> en haut à droite ou d'appuyer sur{' '}
                            <strong>Escape</strong>.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler ou enregistrer/créer</strong>.
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
                    imageAlt: 'Bouton Ajouter une promotion sur une carte de cycle',
                    imageCaption:
                        "Le bouton Ajouter une promotion ouvre le pop-up d'ajout pour le cycle sélectionné.",
                    imageHighlight: {
                        left: '21.0%',
                        top: '40.0%',
                        width: '24.5%',
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
                    imageAlt: 'Pop-up Ajouter une promotion dans OPALE',
                    imageCaption: 'Le pop-up demande uniquement le nom de la promotion.',
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
                            aussi d'appuyer sur <strong>Escape</strong>.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler ou enregistrer/créer</strong>.
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
                    imageAlt: 'Bouton stylo pour modifier une promotion',
                    imageCaption: 'Le stylo de la ligne promotion ouvre le pop-up de modification.',
                    imageHighlight: {
                        left: '38.0%',
                        top: '24.0%',
                        width: '3.8%',
                        height: '7.5%',
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
                    imageAlt: 'Pop-up Modifier une promotion dans OPALE',
                    imageCaption: 'Le pop-up de modification est organisé en 4 parties.',
                    subSteps: [
                        <>
                            <strong>Partie 1 - Informations principales</strong>: nom de la promotion, nombre
                            d'étudiants, date de début, date de fin.
                            <br />
                            Vérifier que les dates affichées par défaut sont celles déjà enregistrées pour la promotion.
                            Si elles sont vides, renseigner la date de début et la date de fin.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                        </>,
                        <>
                            <strong>Partie 2 - Groupes</strong>: créer autant de groupes que souhaité pour les
                            matières communes, puis définir le nombre d'étudiants par groupe (ex: 40
                            étudiants répartis en 2 groupes de 20).
                            <br />
                            Cliquer sur <strong>+ Ajouter un groupe</strong>.
                        </>,
                        <>
                            <strong>Partie 3 - Spécialités</strong>: créer les spécialités de la promotion
                            (ex: cybersécurité, dev) et définir le nombre d'élèves dans chaque spécialité.
                            Les spécialités sont <strong>indépendantes</strong> des groupes.
                            <br />
                            Cliquer sur <strong>+ Ajouter une spécialité</strong>.
                        </>,
                        <>
                            <strong>Partie 4 - Contraintes académiques</strong>: définir les plages de dates de{' '}
                            <strong>Entreprise</strong> (ou <strong>Vacances</strong> pour un parcours
                            initial), <strong>Stages</strong>, <strong>International</strong>,{' '}
                            <strong>Partiels</strong> et <strong>Rattrapages</strong>.
                            <br />
                            Repérer le message <strong>Info : Les vacances scolaires sont déjà récupérées via l'API.
                            Inutile de les ajouter manuellement.</strong> pour les cycles initiaux.
                            <br />
                            Cliquer sur <strong>+</strong> pour ajouter une période et sur <strong>-</strong> pour
                            supprimer la période.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Sélecteur de date</strong>.
                            <br />
                            Définir correctement ces périodes est essentiel pour afficher clairement le
                            planning macro et éviter de poser des cours sur ces plages en planning micro.
                        </>,
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
                            <strong>Annuler ou enregistrer/créer</strong>.
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
                            Excel dans la zone dédiée du cycle cible. Les fichiers acceptés sont{' '}
                            <strong>uniquement</strong> des fichiers Excel.
                        </>,
                        <>
                            Méthode 2 : cliquer sur la zone de <strong>drag and drop</strong> pour ouvrir
                            l'explorateur de fichiers.
                            <br />
                            Sélectionner un ou plusieurs fichiers Excel, puis cliquer sur <strong>Ouvrir</strong>.
                            <br />
                            L'explorateur affiche uniquement les fichiers Excel et les dossiers.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Vérifier la prévisualisation de la maquette.
                        </>
                    ),
                    subSteps: [
                        <>
                            Vérifier dans le premier tableau : <strong>Année scolaire</strong>,{' '}
                            <strong>Cycle détecté</strong>, <strong>Promotions détectées</strong>,{' '}
                            <strong>Spécialités détectées</strong>, <strong>Nombre de matières extraites</strong>,{' '}
                            <strong>Nombre d'avertissements</strong> et <strong>Feuilles détectées</strong>.
                            <br />
                            <em>Action commune</em> : vérifier dans le second tableau : <strong>Promo</strong>,{' '}
                            <strong>UE</strong>, <strong>Matière</strong>, <strong>Semestres</strong>,{' '}
                            <strong>Spécialité</strong> (si disponible), <strong>Total heures</strong> et{' '}
                            <strong>Total des épreuves</strong>.
                            <br />
                            <em>Action commune</em> : si plusieurs promotions sont détectées, utiliser{' '}
                            <strong>Promotion précédente</strong> et <strong>Promotion suivante</strong>. Ces
                            éléments sont des <strong>boutons</strong>. Le centre affiche le nom de la
                            promotion et l'index <strong>(n/x)</strong>.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> (ou la <strong>croix</strong> /{' '}
                            <strong>Escape</strong>) ou sur <strong>Valider</strong>.
                            <br />
                            <em>Action commune</em> : voir le tuto{' '}
                            <strong>Annuler ou enregistrer/créer</strong>.
                            <br />
                            Si <strong>Valider</strong> est sélectionné, le nom du fichier apparaît dans la
                            zone de <strong>drag and drop</strong>.
                            <br />
                            Vous pouvez prévisualiser d'autres maquettes sans supprimer celles déjà validées.
                            <br />
                            Cliquer sur la <strong>croix</strong> d'un fichier pour le retirer.
                        </>
                    ),
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Importer la maquette</strong> une fois toutes les maquettes
                            sélectionnées.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    Si des spécialités sont détectées, un pop-up d'association s'ouvre. Sinon,
                                    l'import démarre directement.
                                </>
                            ),
                            subSteps: [
                                <>Vérifier que le nom du fichier apparaît en sous-titre du pop-up.</>,
                                <>
                                    Repérer : à gauche les <strong>spécialités détectées</strong>, à droite les{' '}
                                    <strong>spécialités déclarées</strong> (issues des promotions).
                                </>,
                                <>
                                    Pour chaque spécialité détectée, sélectionner la spécialité déclarée via la
                                    liste déroulante.
                                </>,
                                <>
                                    Vous pouvez <strong>ajouter</strong>, <strong>supprimer</strong> ou{' '}
                                    <strong>modifier</strong> le nom et les effectifs des spécialités déclarées.
                                    Ces changements sont enregistrés dans le détail de la promotion concernée.
                                </>,
                                <>
                                    Si une spécialité détectée n'est pas liée, ses matières sont importées en{' '}
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
                                    Cliquer sur la <strong>croix</strong> ou appuyer sur <strong>Escape</strong>{' '}
                                    annule l'association et revient à l'étape <strong>4</strong> (Importer la
                                    maquette).
                                </>,
                            ],
                        },
                    ],
                },
                <>
                    Attendre quelques instants : un message de récap apparaît dans la zone de{' '}
                    <strong>drag and drop</strong>.
                </>,
            ],
        },
        {
            title: 'Supprimer un cycle',
            steps: [
                <>
                    Cliquer sur l'icône <strong>poubelle</strong> (ou le bouton{' '}
                    <strong>Supprimer</strong> si les icônes sont désactivées) sur la carte du cycle.
                </>,
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
                <>
                    Cliquer sur l'icône <strong>poubelle</strong> (ou le bouton{' '}
                    <strong>Supprimer</strong> si les icônes sont désactivées) sur la ligne promotion.
                </>,
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


