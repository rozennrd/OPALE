import promoPageScreenshot from '../../../assets/tuto/promo/screen-page-promo.png'
import popupAddPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-ajouter-promotion.png'
import popupCreateCycleScreenshot from '../../../assets/tuto/promo/screen-pop-up-creer-cycle.png'
import popupEditPromotionScreenshot from '../../../assets/tuto/promo/screen-pop-up-modifier-promo.png'
import type { TutorialContent } from '../types'

export const promotionsTutorialContent: TutorialContent = {
    objective: 'Creer et maintenir les promotions avec leurs structures pedagogiques.',
    expectedResult: 'La promotion est complete, structuree et exploitable par les modules de planning.',
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
                        'Vue generale de la page Promotions avec cycles existants et zone de creation.',
                },
                <>
                    La page est structuree avec <strong>une carte par cycle</strong>. Chaque carte est
                    independante des autres.
                </>,
                <>
                    Depuis une carte, vous pouvez <strong>supprimer le cycle</strong> via l icone corbeille
                    du cycle.
                </>,
                <>
                    Depuis cette meme carte, vous pouvez <strong>ajouter une promotion</strong>,{' '}
                    <strong>supprimer une promotion</strong> et <strong>modifier les informations</strong>{' '}
                    d une promotion.
                </>,
                <>
                    La carte permet aussi de <strong>deposer les maquettes pedagogiques</strong> du cycle
                    et/ou des promotions du cycle.
                </>,
                <>
                    Pour creer un nouveau cycle, cliquer sur le <strong>bouton +</strong> dans la{' '}
                    <strong>zone pointillee</strong> a droite de la page.
                </>,
            ],
        },
        {
            title: 'Creer un cycle',
            steps: [
                {
                    text: (
                        <>
                            Cliquer dans <u>la zone pointillee avec le bouton +</u> pour ouvrir le pop-up de
                            creation.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: 'Zone pour ouvrir le pop-up de creation d un cycle sur la page Promotions',
                    imageCaption: 'Cette zone ouvre le pop-up contenant les champs de creation du cycle.',
                    imageHighlight: {
                        left: '71.4%',
                        top: '12.5%',
                        width: '25.6%',
                        height: '57.5%',
                        label: 'Zone d ouverture du pop-up',
                    },
                },
                {
                    text: <>Dans le pop-up, renseigner les <strong>champs obligatoires</strong> du cycle.</>,
                    imageSrc: popupCreateCycleScreenshot,
                    imageAlt: 'Pop-up de creation d un cycle dans OPALE',
                    imageCaption: 'Le pop-up de creation contient les champs obligatoires du cycle.',
                    subSteps: [
                        <>
                            Champ <strong>Nom du cycle</strong>: saisir un nom clair (ex: ADI, CIR).
                        </>,
                        <>
                            Champ <strong>Type de formation</strong>: choisir via la liste deroulante{' '}
                            <em>Formation Initiale</em> ou <em>Formation en Apprentisage</em>.
                        </>,
                        <>
                            Champ <strong>Nombre de promotions</strong>: saisir le nombre d annees du cycle
                            (ex: <strong>3</strong> pour un cycle en 3 ans).
                        </>,
                    ],
                },
                {
                    text: <>Choisir le bouton adapte en bas du pop-up selon le resultat souhaite.</>,
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans enregistrer</em> les
                            informations saisies.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: valide la creation du cycle et ajoute une nouvelle
                            carte sur la page Promotions.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Ajouter une promotion au sein d un cycle',
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
                        'Le bouton Ajouter une promotion ouvre le pop-up d ajout pour le cycle selectionne.',
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
                            <em>Conseil</em>: garder un <strong>meme systeme de nommage</strong> au sein d
                            un cycle (ex: AP4, AP5, AP6) pour faciliter la lecture des plannings.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Ajouter</strong> selon le
                            resultat souhaite.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up sans creation de promotion.
                        </>,
                        <>
                            <strong>Ajouter</strong>: valide la creation et affiche la promotion dans la carte
                            du cycle.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Modifier les informations d une promotion',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l icone <strong>stylo</strong> (ou le bouton <strong>Modifier</strong>{' '}
                            si les icones sont desactivees) sur la ligne de la promotion a modifier. Cela
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
                            organise en <strong>4 parties</strong>.
                        </>
                    ),
                    imageSrc: popupEditPromotionScreenshot,
                    imageAlt: 'Pop-up Modifier une promotion dans OPALE',
                    imageCaption: 'Le pop-up de modification est organise en 4 parties.',
                    subSteps: [
                        <>
                            <strong>Partie 1 - Informations principales</strong>: nom de la promotion, nombre
                            d etudiants, date de debut, date de fin.
                        </>,
                        <>
                            <strong>Partie 2 - Groupes</strong>: creer autant de groupes que souhaite pour les
                            matieres communes, puis definir le nombre d etudiants par groupe (ex: 40
                            etudiants repartis en 2 groupes de 20).
                        </>,
                        <>
                            <strong>Partie 3 - Specialites</strong>: creer les specialites de la promotion
                            (ex: cyber-securite, dev) et definir le nombre d eleves dans chaque specialite.
                            Les specialites sont <strong>independantes</strong> des groupes.
                        </>,
                        <>
                            <strong>Partie 4 - Contraintes academiques</strong>: definir les plages de dates de{' '}
                            <strong>Entreprise</strong> (ou <strong>Vacances</strong> pour un parcours
                            initial), <strong>Stages</strong>, <strong>International</strong>,{' '}
                            <strong>Partiels</strong> et <strong>Rattrapages</strong>.
                        </>,
                        <>
                            Definir correctement ces periodes est essentiel pour afficher clairement le
                            planning macro et eviter de poser des cours sur ces plages en planning micro.
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
                            Ces informations sont tres importantes pour generer des plannings macro et micro
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
                            Cliquer sur l icone <strong>poubelle</strong> (ou le bouton{' '}
                            <strong>Supprimer</strong> si les icones sont desactivees), soit au niveau du{' '}
                            <strong>cycle</strong>, soit au niveau d une <strong>promotion</strong>.
                        </>
                    ),
                    imageSrc: promoPageScreenshot,
                    imageAlt: 'Zone des boutons de suppression cycle et promotion',
                    imageCaption:
                        'Les boutons de suppression du cycle et d une promotion sont situes sur la meme colonne d actions.',
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
                            complet et son contenu associe.
                        </>,
                        <>
                            <strong>Corbeille d une promotion</strong> (sur la ligne promotion): supprime
                            uniquement la promotion cible.
                        </>,
                    ],
                },
                <>
                    <strong>Etape 2 (a venir)</strong>: un pop-up de confirmation apparaitra pour valider ou
                    annuler la suppression.
                </>,
            ],
        },
    ],
    tips: [
        'Nommer les groupes de facon stable pour faciliter les imports futurs.',
        'Reverifier les contraintes avant de lancer une generation de planning.',
    ],
}
