import type { TutorialContent } from '../types'
import screenPageMatiereScreenshot from '../../../assets/tuto/matiere/screen-page-matiere.png'
import screenPageMatiereSuppressionScreenshot from '../../../assets/tuto/matiere/screen-page-matiere-suppression.png'
import screenPopupMatiereModifScreenshot from '../../../assets/tuto/matiere/screen-pop-up-matiere-modif.png'

export const matieresTutorialContent: TutorialContent = {
    objective:
        'Administrer les matieres de chaque promotion pour garantir une base pedagogique fiable pour les plannings.',
    expectedResult:
        'Les matieres sont correctement structurees par promotion, avec des volumes coherents et des affectations enseignants maitrisees.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Matieres affiche l ensemble des matieres dans une vue consolidee par
                            <strong> promotion</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Vue generale de la page Matieres dans OPALE',
                    imageCaption:
                        'Vue generale avec toolbar de recherche/filtres et liste des matieres par promotion.',
                },
                <>
                    Les matieres sont regroupees en <strong>categories par promotion</strong> (ex: ADI 1,
                    ADI 2, CIR 1, etc.).
                </>,
                <>
                    Chaque carte matiere presente le <strong>nom</strong>, les <strong>volumes horaires</strong>{' '}
                    (h total, TD, TP) et le <strong>semestre</strong>.
                </>,
                <>
                    La toolbar permet de <strong>rechercher</strong>, <strong>filtrer</strong>, activer le mode
                    <strong> suppression</strong>, puis revenir a la vue complete.
                </>,
                <>
                    La creation d une matiere suit le meme principe que Salles (zone + pointillee), mais
                    ce flux est <strong>en cours d implementation</strong>.
                </>,
            ],
        },
        {
            title: 'Creer une matiere',
            steps: [
                <>
                    <strong>Etape 1</strong>: cliquer sur la zone d ajout <strong>+</strong> (encadrement
                    pointille) pour ouvrir le pop-up de creation.
                </>,
                <>
                    <strong>Etape 2</strong>: completer le formulaire de creation. Les champs attendus sont les
                    <strong> memes que dans la modification</strong>.
                </>,
                {
                    text: (
                        <>
                            Les champs a renseigner pour la creation sont les suivants (meme logique que la
                            section Modifier une matiere).
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Nom de la matiere</strong>.
                        </>,
                        <>
                            <strong>Volume total (h)</strong>, <strong>Volume TD (h)</strong> et{' '}
                            <strong>Volume TP (h)</strong>.
                        </>,
                        <>
                            <strong>Semestre</strong> (S1/S2).
                        </>,
                        <>
                            Bloc <strong>Enseignants</strong>: ajouter un ou plusieurs enseignants, puis
                            repartir les heures <strong>TD</strong> et <strong>TP</strong> par enseignant.
                        </>,
                        <>
                            Verifier la coherence globale: la repartition des heures enseignants doit rester
                            compatible avec les volumes de la matiere.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            <strong>Etape 3</strong>: cliquer sur <strong>Annuler</strong> ou{' '}
                            <strong>Enregistrer</strong> pour finaliser.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans creation</em>.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: valide la nouvelle matiere dans la promotion cible.
                        </>,
                    ],
                },
                <>
                    <strong>Note</strong>: le flux de creation n est pas encore implemente, il n y a donc pas
                    de capture associee pour cette sous-section.
                </>,
            ],
        },
        {
            title: 'Supprimer une matiere',
            steps: [
                {
                    text: (
                        <>
                            <strong>Etape 1.1</strong>: cliquer sur <strong>Selectionner</strong> dans la toolbar
                            pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Activation du mode suppression sur la page Matieres',
                    imageCaption: 'Le bouton Selectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '86.1%',
                        top: '20.8%',
                        width: '8.8%',
                        height: '4.5%',
                        label: 'Mode selection',
                        labelLeft: '-0.3rem',
                    },
                },
                {
                    text: (
                        <>
                            Cocher une ou plusieurs matieres, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereSuppressionScreenshot,
                    imageAlt: 'Suppression de matieres en mode selection',
                    imageCaption:
                        'Le mode selection permet une suppression multiple avec compteur des elements selectionnes.',
                    imageHighlights: [
                        {
                            left: '85.5%',
                            top: '20.6%',
                            width: '9.8%',
                            height: '5.6%',
                            label: 'Selection active',
                            labelLeft: '-0.5rem',
                        },
                        {
                            left: '86.8%',
                            top: '37.5%',
                            width: '8.5%',
                            height: '6.2%',
                            label: 'Supprimer (n)',
                            labelLeft: '-0.8rem',
                        },
                    ],
                    subSteps: [
                        <>
                            Le compteur <strong>(n)</strong> indique le nombre de matieres selectionnees.
                        </>,
                        <>
                            Utiliser <strong>Tout selectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la selection.
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
            title: 'Modifier une matiere',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de la matiere a modifier pour ouvrir le
                            pop-up de detail matiere.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Acces a la modification d une matiere',
                    imageCaption: 'La carte matiere ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.8%',
                        top: '43.9%',
                        width: '14.6%',
                        height: '9.6%',
                        label: 'Matiere a modifier',
                        labelLeft: '-0.1rem',
                    },
                },
                {
                    text: (
                        <>
                            Mettre a jour les informations dans le pop-up <strong>Detail matiere</strong>.
                        </>
                    ),
                    imageSrc: screenPopupMatiereModifScreenshot,
                    imageAlt: 'Pop-up de modification d une matiere',
                    imageCaption:
                        'Le pop-up permet d ajuster les volumes et les affectations enseignants.',
                    subSteps: [
                        <>
                            <strong>Informations</strong>: modifier le nom de la matiere, le volume total,
                            le volume TD et le volume TP.
                        </>,
                        <>
                            Verifier que les volumes restent coherents entre eux (ex: volume total compatible
                            avec TD + TP selon la regle appliquee par l equipe).
                        </>,
                        <>
                            <strong>Enseignants</strong>: utiliser <strong>+ Ajouter</strong> pour associer un
                            enseignant a la matiere.
                        </>,
                        <>
                            Pour chaque enseignant associe, repartir les heures <strong>TD</strong> et{' '}
                            <strong>TP</strong> afin d obtenir une distribution claire des charges.
                        </>,
                        <>
                            Le bouton <strong>Supprimer</strong> permet de retirer la matiere selon les regles
                            de la page.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Annuler</strong> ou <strong>Enregistrer</strong> pour finaliser la
                            modification.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: abandonne les modifications en cours.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: applique les changements sur la matiere.
                        </>,
                    ],
                },
            ],
        },
        {
            title: 'Utiliser la barre d outil',
            steps: [
                {
                    text: (
                        <>
                            La barre d outil centralise la <strong>recherche</strong>, les{' '}
                            <strong>filtres multi-criteres</strong> et les <strong>actions de selection</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Barre d outil de la page Matieres',
                    imageCaption: 'Toolbar de recherche, filtres par semestre/cycle/promotion/enseignant et actions.',
                    imageHighlights: [
                        {
                            left: '22.8%',
                            top: '20.9%',
                            width: '62.4%',
                            height: '4.2%',
                            label: 'Recherche',
                        },
                        {
                            left: '22.9%',
                            top: '29.0%',
                            width: '7.1%',
                            height: '3.6%',
                            label: 'Semestre',
                            labelLeft: '-0.2rem',
                            labelTop: '2.5rem',
                        },
                        {
                            left: '39.4%',
                            top: '28.9%',
                            width: '9.6%',
                            height: '3.8%',
                            label: 'Cycles',
                            labelTop: '2.5rem',
                        },
                        {
                            left: '55.9%',
                            top: '28.9%',
                            width: '9.5%',
                            height: '3.8%',
                            label: 'Promotions',
                            labelLeft: '-0.2rem',
                            labelTop: '2.5rem',
                        },
                        {
                            left: '72.5%',
                            top: '28.9%',
                            width: '9.3%',
                            height: '3.8%',
                            label: 'Enseignants',
                            labelLeft: '-0.2rem',
                            labelTop: '2.5rem',
                        },
                        {
                            left: '86.1%',
                            top: '20.8%',
                            width: '8.8%',
                            height: '4.5%',
                            label: 'Selection',
                            labelLeft: '-0.2rem',
                        },
                        {
                            left: '89.2%',
                            top: '28.5%',
                            width: '6.2%',
                            height: '4.3%',
                            label: 'Reset filtres',
                            labelLeft: '-0.4rem',
                            labelTop: '2.5rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer une matiere par nom.
                        </>,
                        <>
                            <strong>Semestre</strong>: basculer entre <em>Tous</em>, <em>S1</em> et <em>S2</em>.
                        </>,
                        <>
                            <strong>Cycles</strong>, <strong>Promotions</strong> et <strong>Enseignants</strong>:
                            affiner progressivement la liste selon le besoin.
                        </>,
                        <>
                            <strong>Selectionner</strong>: activer la suppression multiple.
                        </>,
                        <>
                            <strong>Reset filtres</strong>: revenir a la vue complete.
                        </>,
                    ],
                },
            ],
        },
    ],
    tips: [
        'Maintenir des libelles de matieres stables pour eviter les doublons entre promotions.',
        'Verifier la coherence des volumes avant validation pour limiter les erreurs de planification.',
        'Controler la repartition TD/TP par enseignant pour garder une charge realiste.',
    ],
}

