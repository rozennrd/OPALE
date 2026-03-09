import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageMatiereScreenshot from '../../../assets/tuto/matiere/screen-page-matiere.png'
import screenPageMatiereSuppressionScreenshot from '../../../assets/tuto/matiere/screen-page-matiere-suppression.png'
import screenPopupMatiereModifScreenshot from '../../../assets/tuto/matiere/screen-pop-up-matiere-modif.png'

export const matieresTutorialContent: TutorialContent = {
    objective:
        'Administrer les matières de chaque promotion pour garantir une base pédagogique fiable pour les plannings.',
    expectedResult:
        'Les matières sont correctement structurées par promotion, avec des volumes cohérents et des affectations enseignants maîtrisées.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page Matières affiche l'ensemble des matières dans une vue consolidée par
                            <strong> promotion</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Vue générale de la page Matières dans OPALE',
                    imageCaption:
                        'Vue générale avec toolbar de recherche/filtres et liste des matières par promotion.',
                },
                <>
                    Les matières sont regroupées en <strong>catégories par promotion</strong> (ex: ADI 1,
                    ADI 2, CIR 1, etc.).
                </>,
                <>
                    Chaque carte matière présente le <strong>nom</strong>, les <strong>volumes horaires</strong>{' '}
                    (h total, TD, TP) et le <strong>semestre</strong>.
                </>,
                <>
                    La toolbar permet de <strong>rechercher</strong>, <strong>filtrer</strong>, activer le mode
                    <strong> suppression</strong>, puis revenir à la vue complète.
                </>,
                <>
                    La création d'une matière suit le même principe que Salles (zone + pointillée), mais
                    ce flux est <strong>en cours d'implémentation</strong>.
                </>,
            ],
        },
        {
            title: 'Créer une matière',
            steps: [
                <>
                    <strong>Étape 1</strong>: cliquer sur la zone d'ajout <strong>+</strong> (encadrement
                    pointillé) pour ouvrir le pop-up de création.
                </>,
                <>
                    <strong>Étape 2</strong>: compléter le formulaire de création. Les champs attendus sont les
                    <strong> mêmes que dans la modification</strong>.
                </>,
                {
                    text: (
                        <>
                            Les champs à renseigner pour la création sont les suivants (même logique que la
                            section Modifier une matière).
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Nom de la matière</strong>.
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
                            répartir les heures <strong>TD</strong> et <strong>TP</strong> par enseignant.
                        </>,
                        <>
                            Vérifier la cohérence globale: la répartition des heures enseignants doit rester
                            compatible avec les volumes de la matière.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            <strong>Étape 3</strong>: cliquer sur <strong>Annuler</strong> ou{' '}
                            <strong>Enregistrer</strong> pour finaliser.
                        </>
                    ),
                    subSteps: [
                        <>
                            <strong>Annuler</strong>: ferme le pop-up <em>sans création</em>.
                        </>,
                        <>
                            <strong>Enregistrer</strong>: valide la nouvelle matière dans la promotion cible.
                        </>,
                    ],
                },
                <>
                    <strong>Note</strong>: le flux de création n'est pas encore implémenté, il n'y a donc pas
                    de capture associée pour cette sous-section.
                </>,
            ],
        },
        {
            title: 'Supprimer une matière',
            steps: [
                {
                    text: (
                        <>
                            <strong>Étape 1.1</strong>: cliquer sur <strong>Sélectionner</strong> dans la toolbar
                            pour activer le mode suppression.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Activation du mode suppression sur la page Matières',
                    imageCaption: 'Le bouton Sélectionner active les actions de suppression en lot.',
                    imageHighlight: {
                        left: '86.1%',
                        top: '20.8%',
                        width: '8.8%',
                        height: '4.5%',
                        label: 'Mode sélection',
                        labelLeft: '-0.3rem',
                    },
                },
                {
                    text: (
                        <>
                            Cocher une ou plusieurs matières, puis cliquer sur <strong>Supprimer (n)</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereSuppressionScreenshot,
                    imageAlt: 'Suppression de matières en mode sélection',
                    imageCaption:
                        'Le mode sélection permet une suppression multiple avec compteur des éléments sélectionnés.',
                    imageHighlights: [
                        {
                            left: '85.5%',
                            top: '20.6%',
                            width: '9.8%',
                            height: '5.6%',
                            label: 'Sélection active',
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
                            Le compteur <strong>(n)</strong> indique le nombre de matières sélectionnées.
                        </>,
                        <>
                            Utiliser <strong>Tout sélectionner</strong> ou <strong>Effacer</strong> pour ajuster
                            rapidement la sélection.
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
                        left: '21.8%',
                        top: '43.9%',
                        width: '14.6%',
                        height: '9.6%',
                        label: 'Matière à modifier',
                        labelLeft: '-0.1rem',
                    },
                },
                {
                    text: (
                        <>
                            Mettre à jour les informations dans le pop-up <strong>Détail matière</strong>.
                        </>
                    ),
                    imageSrc: screenPopupMatiereModifScreenshot,
                    imageAlt: "Pop-up de modification d'une matière",
                    imageCaption:
                        "Le pop-up permet d'ajuster les volumes et les affectations enseignants.",
                    subSteps: [
                        <>
                            <strong>Informations</strong>: modifier le nom de la matière, le volume total,
                            le volume TD et le volume TP.
                        </>,
                        <>
                            Vérifier que les volumes restent cohérents entre eux (ex: volume total compatible
                            avec TD + TP selon la règle appliquée par l'équipe).
                        </>,
                        <>
                            <strong>Enseignants</strong>: utiliser <strong>+ Ajouter</strong> pour associer un
                            enseignant à la matière.
                        </>,
                        <>
                            Pour chaque enseignant associé, répartir les heures <strong>TD</strong> et{' '}
                            <strong>TP</strong> afin d'obtenir une distribution claire des charges.
                        </>,
                        <>
                            Le bouton <strong>Supprimer</strong> permet de retirer la matière selon les règles
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
                            <strong>Enregistrer</strong>: applique les changements sur la matière.
                        </>,
                    ],
                },
            ],
        },
        {
            title: "Utiliser la barre d'outils",
            steps: [
                {
                    text: (
                        <>
                            La barre d'outils centralise la <strong>recherche</strong>, les{' '}
                            <strong>filtres multi-critères</strong> et les <strong>actions de sélection</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: "Barre d'outils de la page Matières",
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
                            label: 'Sélection',
                            labelLeft: '-0.2rem',
                        },
                        {
                            left: '89.2%',
                            top: '28.5%',
                            width: '6.2%',
                            height: '4.3%',
                            label: 'Réinitialiser les filtres',
                            labelLeft: '-0.4rem',
                            labelTop: '2.5rem',
                        },
                    ],
                    subSteps: [
                        <>
                            <strong>Recherche textuelle</strong>: filtrer une matière par nom.
                        </>,
                        <>
                            <strong>Semestre</strong>: basculer entre <em>Tous</em>, <em>S1</em> et <em>S2</em>.
                        </>,
                        <>
                            <strong>Cycles</strong>, <strong>Promotions</strong> et <strong>Enseignants</strong>:
                            affiner progressivement la liste selon le besoin.
                        </>,
                        <>
                            <strong>Sélectionner</strong>: activer la suppression multiple.
                        </>,
                        <>
                            <strong>Réinitialiser les filtres</strong>: revenir à la vue complète.
                        </>,
                    ],
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
