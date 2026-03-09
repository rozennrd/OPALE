import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import confirmationAddScreenshot from '../../../assets/tuto/action-common/action-common-confirmation-add.png'
import confirmationUpdateScreenshot from '../../../assets/tuto/action-common/action-common-confirmation-update.png'
import confirmationQuitWithoutAddScreenshot from '../../../assets/tuto/action-common/action-common-confirmation-quit_without_add.png'
import confirmationQuitWithoutSaveScreenshot from '../../../assets/tuto/action-common/action-common-confirmation-quit_without_save.png'
import profAddScreenshot from '../../../assets/tuto/prof/page-prof-add.png'
import profUpdateScreenshot from '../../../assets/tuto/prof/page-prof-update.png'

export const actionCancelSaveTutorialContent: TutorialContent = {
    objective:
        'Annuler, créer ou enregistrer une fiche en création ou modification.',
    expectedResult:
        'Les changements sont soit enregistrés, soit abandonnés proprement.',
    steps: [],
    stepSections: [
        {
            title: 'Annuler en création',
            steps: [
                {
                    text: (
                        <>
                            Sur une <strong>carte de détail</strong> en création, cliquer sur la{' '}
                            <strong>croix</strong> en haut à droite ou appuyer sur{' '}
                            <strong>Escape</strong>.
                        </>
                    ),
                    imageSrc: profAddScreenshot,
                    imageAlt: 'Carte de détail en création',
                    imageCaption: 'Fermeture de la carte de création.',
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '76.5%',
                        top: '18%',
                        width: '3%',
                        height: '4.5%',
                        label: 'Fermer',
                    },
                    subSteps: [
                        <>
                            <strong>Cas 1</strong> : si aucune modification, la carte se ferme
                            automatiquement.
                        </>,
                        {
                            text: (
                                <>
                                    <strong>Cas 2</strong> : si des modifications ont été faites, un pop-up de
                                    confirmation s'affiche.
                                </>
                            ),
                            subSteps: [
                                <>
                                    <strong>Cas 2.1</strong> : cliquer sur la <strong>croix</strong> en haut à
                                    droite ou appuyer sur <strong>Escape</strong> revient sur la carte de détail
                                    avec les modifications toujours affichées.
                                </>,
                                {
                                    text: (
                                        <>
                                            <strong>Cas 2.2</strong> : cliquer sur <strong>Fermer sans créer</strong>{' '}
                                            ferme la carte de détail sans créer l'élément.
                                        </>
                                    ),
                                    imageSrc: confirmationQuitWithoutAddScreenshot,
                                    imageAlt: 'Bouton Fermer sans créer',
                                    imageCaption: 'Fermeture sans création.',
                                    imageHighlight: {
                                        left: '41.3%',
                                        top: '55%',
                                        width: '5.5%',
                                        height: '4%',
                                        label: 'Fermer sans créer',
                                    },
                                },
                                {
                                    text: (
                                        <>
                                            <strong>Cas 2.3</strong> : cliquer sur <strong>Fermer et créer</strong>{' '}
                                            ferme la carte de détail et crée l'élément.
                                        </>
                                    ),
                                    imageSrc: confirmationQuitWithoutAddScreenshot,
                                    imageAlt: 'Bouton Fermer et créer',
                                    imageCaption: 'Fermeture avec création.',
                                    imageHighlight: {
                                        left: '46.5%',
                                        top: '55%',
                                        width: '5%',
                                        height: '4%',
                                        label: 'Fermer et créer',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Annuler en modification',
            steps: [
                {
                    text: (
                        <>
                            Sur une <strong>carte de détail</strong> en modification, cliquer sur la{' '}
                            <strong>croix</strong> en haut à droite ou appuyer sur{' '}
                            <strong>Escape</strong>.
                        </>
                    ),
                    imageSrc: profUpdateScreenshot,
                    imageAlt: 'Carte de détail en modification',
                    imageCaption: 'Fermeture de la carte de modification.',
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '76.5%',
                        top: '18%',
                        width: '3%',
                        height: '4.5%',
                        label: 'Fermer',
                    },
                    subSteps: [
                        <>
                            <strong>Cas 1</strong> : si aucune modification, la carte se ferme
                            automatiquement.
                        </>,
                        {
                            text: (
                                <>
                                    <strong>Cas 2</strong> : si des modifications ont été faites, un pop-up de
                                    confirmation s'affiche.
                                </>
                            ),
                            subSteps: [
                                <>
                                    <strong>Cas 2.1</strong> : cliquer sur la <strong>croix</strong> en haut à
                                    droite ou appuyer sur <strong>Escape</strong> revient sur la carte de détail
                                    avec les modifications toujours affichées.
                                </>,
                                {
                                    text: (
                                        <>
                                            <strong>Cas 2.2</strong> : cliquer sur <strong>Fermer sans enregistrer</strong>{' '}
                                            ferme la carte de détail sans enregistrer l'élément.
                                        </>
                                    ),
                                    imageSrc: confirmationQuitWithoutSaveScreenshot,
                                    imageAlt: 'Bouton Fermer sans enregistrer',
                                    imageCaption: 'Fermeture sans enregistrement.',
                                    imageHighlight: {
                                        left: '40%',
                                        top: '56%',
                                        width: '8%',
                                        height: '4%',
                                        label: 'Fermer sans enregistrer',
                                    },
                                },
                                {
                                    text: (
                                        <>
                                            <strong>Cas 2.3</strong> : cliquer sur <strong>Enregistrer et fermer</strong>{' '}
                                            ferme la carte de détail et enregistre l'élément.
                                        </>
                                    ),
                                    imageSrc: confirmationQuitWithoutSaveScreenshot,
                                    imageAlt: 'Bouton Enregistrer et fermer',
                                    imageCaption: 'Fermeture avec enregistrement.',
                                    imageHighlight: {
                                        left: '48%',
                                        top: '56%',
                                        width: '9%',
                                        height: '4%',
                                        label: 'Enregistrer et fermer',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            title: 'Créer',
            steps: [
                {
                    text: (
                        <>
                            Sur une <strong>carte de détail</strong> en création, cliquer sur le bouton{' '}
                            <strong>Créer</strong>. Cela ouvre un pop-up de confirmation.
                        </>
                    ),
                    imageSrc: profAddScreenshot,
                    imageAlt: 'Bouton Créer sur la carte de création',
                    imageCaption: 'Le bouton Créer ouvre la confirmation.',
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '72.5%',
                        top: '73%',
                        width: '4%',
                        height: '4%',
                        label: 'Créer',
                    },
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Cas 1.1</strong> : cliquer sur la <strong>croix</strong> en haut à
                                    droite, sur <strong>Escape</strong> ou sur <strong>Annuler</strong> revient sur
                                    la carte de détail avec les modifications toujours affichées.
                                </>
                            ),
                            imageSrc: confirmationAddScreenshot,
                            imageAlt: 'Bouton Annuler sur confirmation de création',
                            imageCaption: 'Retour à la carte de détail sans créer.',
                            imageHighlight: {
                                left: '46%',
                                top: '52%',
                                width: '6%',
                                height: '4.5%',
                                label: 'Annuler',
                            },
                        },
                        {
                            text: (
                                <>
                                    <strong>Cas 1.2</strong> : cliquer sur <strong>Créer</strong> ferme la carte de
                                    détail et crée l'élément.
                                </>
                            ),
                            imageSrc: confirmationAddScreenshot,
                            imageAlt: 'Bouton Créer sur confirmation de création',
                            imageCaption: 'Validation de la création.',
                            imageHighlight: {
                                left: '54%',
                                top: '52%',
                                width: '6%',
                                height: '4.5%',
                                label: 'Créer',
                            },
                        },
                    ],
                },
            ],
        },
        {
            title: 'Enregistrer',
            steps: [
                {
                    text: (
                        <>
                            Sur une <strong>carte de détail</strong> en modification, cliquer sur le bouton{' '}
                            <strong>Enregistrer</strong>. Cela ouvre un pop-up de confirmation.
                        </>
                    ),
                    imageSrc: profAddScreenshot,
                    imageAlt: 'Bouton Enregistrer sur la carte de modification',
                    imageCaption: 'Le bouton Enregistrer ouvre la confirmation.',
                    imagePlacement: 'beforeSubSteps',
                    imageHighlight: {
                        left: '73.5%',
                        top: '73%',
                        width: '4.5%',
                        height: '4%',
                        label: 'Enregistrer',
                    },
                    subSteps: [
                        {
                            text: (
                                <>
                                    <strong>Cas 1.1</strong> : cliquer sur la <strong>croix</strong> en haut à
                                    droite, sur <strong>Escape</strong> ou sur <strong>Annuler</strong> revient sur
                                    la carte de détail avec les modifications toujours affichées.
                                </>
                            ),
                            imageSrc: confirmationUpdateScreenshot,
                            imageAlt: 'Bouton Annuler sur confirmation de modification',
                            imageCaption: 'Retour à la carte de détail sans enregistrer.',
                            imageHighlight: {
                                left: '46%',
                                top: '53%',
                                width: '4%',
                                height: '3.5%',
                                label: 'Annuler',
                            },
                        },
                        {
                            text: (
                                <>
                                    <strong>Cas 1.2</strong> : cliquer sur <strong>Enregistrer</strong> ferme la
                                    carte de détail et enregistre l'élément.
                                </>
                            ),
                            imageSrc: confirmationUpdateScreenshot,
                            imageAlt: 'Bouton Enregistrer sur confirmation de modification',
                            imageCaption: 'Validation de la modification.',
                            imageHighlight: {
                                left: '49.5%',
                                top: '53%',
                                width: '4.5%',
                                height: '3.5%',
                                label: 'Enregistrer',
                            },
                        },
                    ],
                },
            ],
        },
    ],
    tips: [
        "Une confirmation peut s'afficher si des modifications ne sont pas sauvegardées.",
        "Les libellés peuvent varier selon la page (Créer, Enregistrer).",
        "Le bouton Annuler n'est pas toujours présent selon la page.",
    ],
}

