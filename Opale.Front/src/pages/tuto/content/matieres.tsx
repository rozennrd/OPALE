import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import screenPageMatiereScreenshot from '../../../assets/tuto/matiere/screen-page-matiere.png'
import screenPageMatiereSuppressionScreenshot from '../../../assets/tuto/matiere/screen-page-matiere-suppression.png'
import screenPopupMatiereModifScreenshot from '../../../assets/tuto/matiere/screen-pop-up-matiere-modif.png'

export const matieresTutorialContent: TutorialContent = {
    objective:
        'Administrer les matiÃ¨res de chaque promotion pour garantir une base pÃ©dagogique fiable pour les plannings.',
    expectedResult:
        'Les matiÃ¨res sont correctement structurÃ©es par promotion, avec des volumes cohÃ©rents et des affectations enseignants maÃ®trisÃ©es.',
    steps: [],
    stepSections: [
        {
            title: 'Comprendre la structure de la page',
            steps: [
                {
                    text: (
                        <>
                            La page MatiÃ¨res affiche l'ensemble des matiÃ¨res dans une vue consolidÃ©e par
                            <strong> promotion</strong>. Ces matiÃ¨res sont <strong>rÃ©cupÃ©rÃ©es</strong> et{' '}
                            <strong>remplies automatiquement</strong> lors de l'import d'une maquette.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: 'Vue gÃ©nÃ©rale de la page MatiÃ¨res dans OPALE',
                    imageCaption:
                        'Vue gÃ©nÃ©rale avec toolbar de recherche/filtres et liste des matiÃ¨res par promotion.',
                },
                <>
                    La toolbar en haut centralise la <strong>recherche</strong>, les <strong>filtres</strong>, la{' '}
                    <strong>crÃ©ation</strong> et la <strong>suppression en mode sÃ©lection</strong>.
                </>,
                <>
                    Les matiÃ¨res sont regroupÃ©es en <strong>catÃ©gories par promotion</strong> (ex: AP3, AP4, AP5,
                    etc.).
                </>,
                <>
                    Chaque carte matiÃ¨re prÃ©sente le <strong>nom</strong>, les <strong>volumes horaires</strong>{' '}
                    (h total, TD, TP) et le <strong>semestre</strong>.
                </>,
                <>
                    La cÃ©ation d'une matiÃ¨re est <strong>en cours d'implÃ©mentation</strong>. Elle se fera via le <strong>bouton de la
                    toolbar</strong> et permettra de crÃ©er une matiÃ¨re si elle n'a pas Ã©tÃ© dÃ©tectÃ©e lors de
                    l'import de la maquette.
                </>,
            ],
        },
        {
            title: 'CrÃ©er une matiÃ¨re',
            steps: [
                <>
                    Le bouton de crÃ©ation dans la toolbar est <strong>prÃ©sent</strong> mais{' '}
                    <strong>non fonctionnel</strong> : la fonctionnalitÃ© n'est pas encore dÃ©veloppÃ©e.
                </>,
                <>
                    Le but est de pouvoir crÃ©er une matiÃ¨re dans le cas oÃ¹ elle n'aurait pas Ã©tÃ© dÃ©tectÃ©e lors
                    de l'import de la maquette.
                </>,
            ],
        },
        {
            title: 'Modifier une matiÃ¨re',
            steps: [
                {
                    text: (
                        <>
                            Cliquer sur la <strong>carte</strong> de la matiÃ¨re Ã  modifier pour ouvrir le
                            pop-up de dÃ©tail matiÃ¨re.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: "AccÃ¨s Ã  la modification d'une matiÃ¨re",
                    imageCaption: 'La carte matiÃ¨re ouvre le formulaire de modification.',
                    imageHighlight: {
                        left: '21.8%',
                        top: '43.9%',
                        width: '14.6%',
                        height: '9.6%',
                        label: 'MatiÃ¨re Ã  modifier',
                        labelLeft: '-0.1rem',
                    },
                },
                {
                    text: (
                        <>
                            Le pop-up <strong>DÃ©tail matiÃ¨re</strong> est structurÃ© en deux colonnes :
                            <strong> Ã  gauche</strong> les informations de la matiÃ¨re, <strong> Ã  droite</strong>{' '}
                            l'attribution des enseignants.
                        </>
                    ),
                },
                {
                    text: (
                        <>
                            Mettre Ã  jour les informations dans le pop-up <strong>DÃ©tail matiÃ¨re</strong>.
                        </>
                    ),
                    imageSrc: screenPopupMatiereModifScreenshot,
                    imageAlt: "Pop-up de modification d'une matiÃ¨re",
                    imageCaption:
                        "Le pop-up permet d'ajuster les volumes et les affectations enseignants.",
                    subSteps: [
                        <>
                            <strong>Champs modifiables</strong>:
                            <ul>
                                <li>
                                    <strong>Nom de la matiÃ¨re</strong>
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
                            Le nombre d'Ã©preuves total et le dÃ©tail des types d'Ã©preveus est affichÃ©.
                        </>,
                        <>
                            Un <strong>warning</strong> indique le nombre d'heures <strong>restantes</strong> Ã 
                            attribuer. Il disparaÃ®t lorsqu'il ne reste plus rien Ã  attribuer.
                        </>,
                    ],
                },
                {
                    text: (
                        <>
                            Cliquer sur <strong>Supprimer</strong> ou <strong>Enregistrer</strong> selon le
                            rÃ©sultat souhaitÃ©.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Supprimer</strong>: supprime la matiÃ¨re affichÃ©e Ã  l'Ã©cran. Cette
                                    action ouvre un pop-up de confirmation.
                                    <br />
                                    <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                                </>
                            ),
                            subSteps: [
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut Ã 
                                    droite ou <strong>Escape</strong> annule la suppression et renvoie sur la{' '}
                                    <strong>carte de dÃ©tail de modification</strong> en conservant les
                                    informations saisies.
                                </>,
                                <>
                                    Cliquer sur <strong>Supprimer</strong> supprime dÃ©finitivement la matiÃ¨re.
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
                                    <strong>Annuler ou enregistrer/crÃ©er</strong>.
                                </>
                            ),
                            subSteps: [
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut Ã 
                                    droite ou <strong>Escape</strong> renvoie sur la{' '}
                                    <strong>carte de dÃ©tail de modification</strong> en conservant les
                                    informations saisies.
                                </>,
                                <>
                                    Cliquer sur <strong>Enregistrer</strong> enregistre la matiÃ¨re et ferme le
                                    pop-up de modification.
                                </>,
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Modifier la rÃ©partition du volume horaire',
            steps: [
                <>
                    Les volumes sont extraits de la maquette avec les rÃ¨gles suivantes :
                    <br />
                    <ul>
                        <li>
                            <strong>Volume total (h)</strong> = premiÃ¨re valeur non nulle parmi{' '}
                            <strong>Nb heures planifiÃ©es</strong>, <strong>Nb heures Ã©tudiant</strong> ou{' '}
                            <strong>Nb heures encadrÃ©es</strong>. Si aucun total n'est renseignÃ©, il est
                            calculÃ© Ã  partir de la somme des dÃ©tails (<strong>cours magistral</strong>,{' '}
                            <strong>cours interactif</strong>, <strong>TD</strong>, <strong>TP</strong>,{' '}
                            <strong>projet</strong>, <strong>e-learning</strong>,{' '}
                            <strong>visites / confÃ©rences</strong>, <strong>auto-gÃ©rÃ©</strong>).
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
                <>
                    Pour modifier le volume horaire total ou le nombre d'heures par type, cliquer dans le champ
                    et saisir la nouvelle valeur.
                </>,
                <>
                    Si la somme des heures <strong>TD</strong> et <strong>TP</strong> dÃ©passe le{' '}
                    <strong>volume total</strong>, le type modifiÃ© est automatiquement ajustÃ© au maximum autorisÃ©
                    pour respecter le total.
                </>,
            ],
        },
        {
            title: 'Attribuer des heures Ã  un enseignant',
            steps: [
                <>
                    Depuis la <strong>carte de dÃ©tail</strong> (en mode modification, et plus tard en mode
                    crÃ©ation). Les enseignants dÃ©jÃ  attribuÃ©s Ã  la matiÃ¨re depuis la page Enseignants sont
                    affichÃ©s.
                    <br />
                    <em>Note</em> : voir le tuto <strong>Attribuer des matiÃ¨res Ã  un enseignant</strong>.
                </>,
                <>
                    Si l'enseignant voulu n'est pas affichÃ©, cliquer sur <strong>+ Ajouter</strong>.
                </>,
                <>
                    Cliquer sur le champ du type de cours voulu et attribuer le nombre d'heures souhaitÃ©. Si la
                    valeur est supÃ©rieure Ã  <strong>0</strong>, le label du type de cours passe en{' '}
                    <strong>vert</strong>.
                </>,
                <>
                    Si la somme des heures par type dÃ©passe le volume total, ou si un type dÃ©passe son volume
                    prÃ©vu, le champ modifiÃ© est automatiquement ajustÃ© au maximum autorisÃ©. Si aucun volume
                    n'est prÃ©vu pour un type de cours, le champ n'est pas saisissable.
                </>,
                <>
                    Pour supprimer un enseignant, cliquer sur le bouton <strong>-</strong> Ã  cÃ´tÃ© de son nom.
                </>,
                <>
                    En bas Ã  gauche, un <strong>warning</strong> indique le nombre d'heures restantes Ã  attribuer.
                    Il disparaÃ®t quand il ne reste plus rien Ã  attribuer. Un second warning temporaire peut
                    apparaÃ®tre si un dÃ©passement est dÃ©tectÃ© (environ <strong>2 secondes</strong>).
                </>,
            ],
        },
        {
            title: 'Supprimer une matiÃ¨re',
            steps: [
                {
                    text: (
                        <>
                            La suppression des matiÃ¨res se fait en <strong>mode sÃ©lection</strong> depuis la
                            toolbar, ou depuis la <strong>carte de dÃ©tail</strong> d'une matiÃ¨re en modification.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Supprimer</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereSuppressionScreenshot,
                    imageAlt: 'Suppression de matiÃ¨res en mode sÃ©lection',
                    imageCaption:
                        'Le mode sÃ©lection permet une suppression multiple avec compteur des Ã©lÃ©ments sÃ©lectionnÃ©s.',
                },
            ],
        },
        {
            title: "Utiliser la barre d'outils",
            steps: [
                {
                    text: (
                        <>
                            La barre d'outils permet d'utiliser la <strong>recherche</strong> et les{' '}
                            <strong>filtres</strong> pour retrouver rapidement une matiÃ¨re.
                            <br />
                            <em>Action commune</em> : voir le tuto <strong>Rechercher et filtrer</strong>.
                        </>
                    ),
                    imageSrc: screenPageMatiereScreenshot,
                    imageAlt: "Barre d'outils de la page MatiÃ¨res",
                    imageCaption: 'Toolbar de recherche, filtres et actions.',
                },
            ],
        },
    ],
    tips: [
        'Maintenir des libellÃ©s de matiÃ¨res stables pour Ã©viter les doublons entre promotions.',
        'VÃ©rifier la cohÃ©rence des volumes avant validation pour limiter les erreurs de planification.',
        'ContrÃ´ler la rÃ©partition TD/TP par enseignant pour garder une charge rÃ©aliste.',
    ],
}



