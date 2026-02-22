import type { TutorialContent } from '../types'
import screenPageProfScreenshot from '../../../assets/tuto/prof/screen-page-prof.png'
import screenPageProfSuppressionScreenshot from '../../../assets/tuto/prof/screen-page-prof-suppression.png'
import screenPopupProfScreenshot from '../../../assets/tuto/prof/screen-pop-up-prof.png'
import screenPopupProfModifScreenshot from '../../../assets/tuto/prof/screen-pop-up-prof-modif.png'

export const teachersTutorialContent: TutorialContent = {
    objective:
        'Gerer les fiches enseignants (internes et vacataires) pour fiabiliser la generation des plannings.',
    expectedResult:
        'Chaque enseignant est correctement renseigne (profil, matieres, disponibilites) et exploitable dans la planification.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Enseignants affiche l ensemble des enseignants dans une <strong>vue unique</strong>,
                            separee en <strong>3 categories</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Vue generale de la page Enseignants dans OPALE',
                    imageCaption:
                        'Vue generale avec categories d enseignants, toolbar de recherche/filtres et cartes enseignants.',
                },
                <>
                    <strong>Internes Bordeaux</strong>: enseignants du campus local, mobilisables sans deplacement
                    inter-campus.
                </>,
                <>
                    <strong>Internes Lille/Chateauroux</strong>: enseignants Junia d un autre campus; leur venue
                    doit etre anticipee dans l organisation.
                </>,
                <>
                    <strong>Vacataires</strong>: intervenants externes a Junia.
                </>,
                <>
                    Chaque carte enseignant contient les informations clefs (<strong>nom</strong>,{' '}
                    <strong>telephone</strong>, <strong>mode d intervention</strong>) et sert de point d acces
                    pour la consultation/detail.
                </>,
                <>
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>, la{' '}
                    <strong>creation</strong> et la <strong>suppression en mode selection</strong>.
                </>,
            ],
        },
        {
            title: 'Creer un enseignant',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur l icone <strong>+</strong> dans la toolbar pour ouvrir le pop-up{' '}
                            <u>Detail de l enseignant</u>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Bouton + de creation d un enseignant',
                    imageCaption: 'Le bouton + ouvre le pop-up de creation d un enseignant.',
                    imageHighlight: {
                        left: '92.3%',
                        top: '19.7%',
                        width: '2.7%',
                        height: '5.4%',
                        label: 'Creation enseignant',
                        labelLeft: '-4rem',
                    },
                },
                {
                    text: (
                        <>
                            Renseigner les champs du pop-up de creation en suivant les blocs fonctionnels.
                        </>
                    ),
                    imageSrc: screenPopupProfScreenshot,
                    imageAlt: 'Pop-up de creation d un enseignant',
                    imageCaption: 'Le pop-up permet de definir le profil, les matieres et les disponibilites.',
                    subSteps: [
                        <>
                            <strong>Informations</strong>: remplir <strong>Nom</strong>, <strong>Prenom</strong>,{' '}
                            <strong>Telephone</strong>, <strong>Email Junia</strong> et{' '}
                            <strong>Email perso</strong>.
                        </>,
                        <>
                            <strong>Type</strong>: choisir le mode d intervention de l enseignant ({' '}
                            <em>Presentiel</em>, <em>Hybride</em> ou <em>Distanciel</em>).
                        </>,
                        <>
                            <strong>Rattachement</strong>: indiquer <em>Interne</em> ou <em>Vacataire</em>.
                        </>,
                        <>
                            <strong>Campus d origine</strong>: preciser le campus de reference (ex: Bordeaux,
                            Lille, Chateauroux) pour faciliter l organisation inter-campus.
                        </>,
                        <>
                            <strong>Matieres enseignees</strong>: ajouter les matieres enseignees puis associer,
                            si necessaire, les promotions cibles.
                        </>,
                        <>
                            <strong>Disponibilites</strong>: creer une ou plusieurs periodes, definir la plage de
                            dates, puis renseigner la grille <strong>Matin / Apres-midi</strong> du{' '}
                            <strong>Lundi au Vendredi</strong>.
                        </>,
                        <>
                            Verifier la legende <em>Disponible</em> / <em>Non disponible</em> pour eviter les
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
                            Cliquer sur la <strong>carte</strong> de l enseignant a modifier pour ouvrir le
                            pop-up de detail en mode edition.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Acces a la modification d un enseignant',
                    imageCaption: 'La carte enseignant ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.4%',
                        top: '48.9%',
                        width: '13.4%',
                        height: '10.5%',
                        label: 'Enseignant a modifier',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up de modification reprend les <strong>memes champs</strong> que la creation,
                            avec des valeurs deja pre-remplies.
                        </>
                    ),
                    imageSrc: screenPopupProfModifScreenshot,
                    imageAlt: 'Pop-up de modification d un enseignant',
                    imageCaption:
                        'En modification, les informations existantes peuvent etre corrigees et completees.',
                    subSteps: [
                        <>
                            Mettre a jour les <strong>informations personnelles</strong>: Nom, Prenom, Telephone,
                            Email Junia, Email perso.
                        </>,
                        <>
                            Verifier la coherence de <strong>Type</strong>, <strong>Rattachement</strong> et{' '}
                            <strong>Campus d origine</strong>.
                        </>,
                        <>
                            Ajuster les <strong>matieres enseignees</strong> et les promotions associees selon
                            la charge pedagogique reelle.
                        </>,
                        <>
                            Actualiser les <strong>disponibilites</strong> (periodes, grille hebdomadaire) pour
                            garantir des plannings fiables.
                        </>,
                        <>
                            En mode edition, le bouton <strong>Supprimer</strong> peut etre affiche selon les
                            regles de la page.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour valider
                            l edition.
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
                            <strong>Etape 1.1</strong>: cliquer sur <strong>Selectionner</strong> depuis la toolbar
                            pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Activation du mode suppression enseignant',
                    imageCaption: 'Le bouton Selectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '76.7%',
                        top: '19.8%',
                        width: '9.7%',
                        height: '5.9%',
                        label: 'Mode selection',
                    },
                },
                {
                    text: (
                        <>
                            Cocher un ou plusieurs enseignants, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfSuppressionScreenshot,
                    imageAlt: 'Suppression d enseignants en mode selection',
                    imageCaption:
                        'Le mode selection permet une suppression unitaire ou multiple des enseignants.',
                    imageHighlights: [
                        {
                            left: '76.7%',
                            top: '19.8%',
                            width: '9.7%',
                            height: '5.9%',
                            label: 'Selection active',
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
                            Le compteur <strong>(n)</strong> indique le nombre d enseignants selectionnes.
                        </>,
                        <>
                            Les actions <strong>Tout selectionner</strong> et <strong>Effacer</strong> facilitent
                            l ajustement de la selection avant suppression.
                        </>,
                    ],
                },
                <>
                    <strong>Etape 2 (a venir)</strong>: un pop-up de confirmation apparaitra pour valider ou
                    annuler la suppression.
                </>,
            ],
        },
        {
            title: 'Utiliser la barre d outil',
            steps: [
                {
                    text: (
                        <>
                            La barre d outil regroupe les fonctions de <strong>recherche</strong>,{' '}
                            <strong>filtrage</strong> et <strong>actions rapides</strong>.
                        </>
                    ),
                    imageSrc: screenPageProfScreenshot,
                    imageAlt: 'Barre d outil de la page Enseignants',
                    imageCaption: 'Toolbar de recherche, filtres, selection et creation.',
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
                            label: 'Filtre matieres',
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
                            label: 'Selection',
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
                            label: 'Creation',
                            labelLeft: '-1.8rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer rapidement un enseignant par nom ou
                            prenom.
                        </>,
                        <>
                            <strong>Filtre Matieres</strong>: afficher uniquement les enseignants rattaches a une
                            matiere donnee.
                        </>,
                        <>
                            <strong>Filtres de mode</strong>: <em>Tous</em>, <em>Presentiel</em>,{' '}
                            <em>Hybride</em>, <em>Distanciel</em>.
                        </>,
                        <>
                            <strong>Selectionner</strong>: activer le mode de suppression multiple.
                        </>,
                        <>
                            <strong>Reset filtres</strong>: revenir rapidement a la vue complete.
                        </>,
                        <>
                            Le bouton <strong>+</strong> ouvre le pop-up de creation d un enseignant.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Utiliser un format de nommage stable (Nom Prenom) pour eviter les doublons.',
        'Maintenir a jour les disponibilites avant toute generation de planning.',
        'Verifier le rattachement et le campus d origine pour anticiper les contraintes logistiques.',
    ],
}
