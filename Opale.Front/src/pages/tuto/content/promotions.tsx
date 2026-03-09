import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
/* eslint-disable react/no-unescaped-entities */
import popupAddPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-ajouter-promotion.png'
import popupCreateCycleScreenshot from '../../../assets/tuto/promo/screen-pop-up-creer-cycle.png'
import popupEditPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-modifier-promo.png'
import type { TutorialContent } from '../types'

export const promotionsTutorialContent: TutorialContent = {
    objective: 'Créer et maintenir les promotions avec leurs structures pédagogiques.',
    expectedResult: 'La promotion est complète, structurée et exploitable par les modules de planning.',
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
                    text: <>Dans le pop-up, renseigner les <strong>champs obligatoires</strong> du cycle.</>,
                    imageSrc: popupCreateCycleScreenshot,
                    imageAlt: "Pop-up de création d'un cycle dans OPALE",
                    imageCaption: 'Le pop-up de création contient les champs obligatoires du cycle.',
                    subSteps: [
                        <>
                            Champ <strong>Nom du cycle</strong>: saisir un nom clair (ex: ADI, CIR).
                        </>,
                        <>
                            Champ <strong>Type de formation</strong>: choisir via la liste déroulante{' '}
                            <em>Formation Initiale</em> ou <em>Formation en apprentissage</em>.
                        </>,
                        <>
                            Champ <strong>Nombre de promotions</strong>: saisir le nombre d'années du cycle
                            (ex: <strong>3</strong> pour un cycle en 3 ans).
                        </>,
                    ],
                },
                {
                    text: <>Choisir le bouton adapté en bas du pop-up selon le résultat souhaité.</>,
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans enregistrer</em> les
                            informations saisies.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: valide la création du cycle et ajoute une nouvelle
                            carte sur la page Promotions.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Ajouter une promotion au sein d\'un cycle',
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
                            Dans le pop-up <strong>Ajouter une promotion</strong>, renseigner uniquement le{' '}
                            <strong>nom de la promotion</strong>.
                        </>
                    ),
                    imageSrc: popupAddPromotionScreenshot,
                    imageAlt: 'Pop-up Ajouter une promotion dans OPALE',
                    imageCaption: 'Le pop-up demande uniquement le nom de la promotion.',
                    subSteps: [
                        <>
                            Saisir le <strong>nom de la promotion</strong> avec la convention choisie.
                        </>,
                        <>
                            <em>Conseil</em>: garder un <strong>même système de nommage</strong> au sein d'un
                            cycle (ex: AP4, AP5, AP6) pour faciliter la lecture des plannings.
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
                            <strong>Annuler</strong>: ferme le pop-up sans création de promotion.
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
            title: 'Modifier les informations d\'une promotion',
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
                        </>,
                        <>
                            <strong>Partie 2 - Groupes</strong>: créer autant de groupes que souhaité pour les
                            matières communes, puis définir le nombre d'étudiants par groupe (ex: 40
                            étudiants répartis en 2 groupes de 20).
                        </>,
                        <>
                            <strong>Partie 3 - Spécialités</strong>: créer les spécialités de la promotion
                            (ex: cybersécurité, dev) et définir le nombre d'élèves dans chaque spécialité.
                            Les spécialités sont <strong>indépendantes</strong> des groupes.
                        </>,
                        <>
                            <strong>Partie 4 - Contraintes académiques</strong>: définir les plages de dates de{' '}
                            <strong>Entreprise</strong> (ou <strong>Vacances</strong> pour un parcours
                            initial), <strong>Stages</strong>, <strong>International</strong>,{' '}
                            <strong>Partiels</strong> et <strong>Rattrapages</strong>.
                        </>,
                        <>
                            Définir correctement ces périodes est essentiel pour afficher clairement le
                            planning macro et éviter de poser des cours sur ces plages en planning micro.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour
                            finaliser la modification.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up sans appliquer les changements.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: applique les modifications sur la promotion.
                        </>,
                        <>
                            Ces informations sont très importantes pour générer des plannings macro et micro
                            fiables.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Supprimer un cycle ou une promotion',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l'icône <strong>poubelle</strong> (ou le bouton{' '}
                            <strong>Supprimer</strong> si les icônes sont désactivées), soit au niveau du{' '}
                            <strong>cycle</strong>, soit au niveau d'une <strong>promotion</strong>.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: 'Zone des boutons de suppression cycle et promotion',
                    imageCaption:
                        "Les boutons de suppression du cycle et d'une promotion sont situés sur la même colonne d'actions.",
                    imageHighlights: [
                        {
                            left: '41.5%',
                            top: '15.5%',
                            width: '4.1%',
                            height: '7.0%',
                            label: 'Suppression cycle',
                        },
                        {
                            left: '40.6%',
                            top: '32.5%',
                            width: '4.1%',
                            height: '7.0%',
                            label: 'Suppression promotion',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Corbeille du cycle</strong> (en haut de la carte): supprime le cycle
                            complet et son contenu associé.
                        </>,
                        <>
                            <strong>Corbeille d'une promotion</strong> (sur la ligne promotion): supprime
                            uniquement la promotion cible.
                        </>,
                    ],
                },
                <>
                    <strong>Étape 2 (à venir)</strong>: un pop-up de confirmation apparaîtra pour valider ou
                    annuler la suppression.
                </>,
            ],
        },
    ],
    tips: [
        'Nommer les groupes de façon stable pour faciliter les imports futurs.',
        'Revérifier les contraintes avant de lancer une génération de planning.',
    ],
}


