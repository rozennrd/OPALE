import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */
import confirmationDeleteScreenshot from '../../../assets/tuto/action-common/action-common-confirmation-delete.png'
import multiDeleteScreenshot from '../../../assets/tuto/action-common/action-common-multi-delete.png'
import eventPageScreenshot from '../../../assets/tuto/event/page-event-junia.png'
import profUpdateScreenshot from '../../../assets/tuto/prof/page-prof-update.png'

export const actionDeleteSelectionTutorialContent: TutorialContent = {
    objective:
        'Supprimer un ou plusieurs éléments.',
    expectedResult:
        'Les éléments ciblés sont supprimés.',
    steps: [],
    stepSections: [
        {
            title: 'Suppression en multisélection',
            steps: [
                {
                    text: (
                        <>
                            Dans la toolbar, cliquer sur <strong>Sélectionner</strong>.
                        </>
                    ),
                    imageSrc: eventPageScreenshot,
                    imageAlt: 'Bouton Sélectionner dans la toolbar',
                    imageCaption: 'Activation du mode sélection.',
                    imageHighlight: {
                        left: '61.0%',
                        top: '21.3%',
                        width: '9.3%',
                        height: '5.8%',
                        label: 'Sélectionner',
                    },
                },
                {
                    text: (
                        <>
                            Sélectionner les éléments à supprimer.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    Le bouton <strong>Sélectionner</strong> dans la toolbar est remplacé par le
                                    bouton <strong>Quitter sélection</strong>. Cliquer dessus permet de sortir du
                                    mode sélection. Même si des éléments sont encore sélectionnés, on quitte bien
                                    la sélection.
                                </>
                            ),
                            imageSrc: multiDeleteScreenshot,
                            imageAlt: 'Bouton Quitter sélection',
                            imageCaption: 'Quitter le mode sélection.',
                            imageHighlight: {
                                left: '59.2%',
                                top: '21.3%',
                                width: '11.1%',
                                height: '6.0%',
                                label: 'Quitter sélection',
                            },
                        },
                        {
                            text: (
                                <>
                                    Le bouton <strong>Tout sélectionner</strong> permet de sélectionner tous les
                                    éléments de la page.
                                </>
                            ),
                            imageSrc: multiDeleteScreenshot,
                            imageAlt: 'Bouton Tout sélectionner',
                            imageCaption: 'Sélectionner tous les éléments.',
                            imageHighlight: {
                                left: '69.4%',
                                top: '37.2%',
                                width: '10.9%',
                                height: '5.9%',
                                label: 'Tout sélectionner',
                            },
                        },
                        {
                            text: (
                                <>
                                    Le bouton <strong>Effacer</strong> permet de déselectionner les éléments.
                                </>
                            ),
                            imageSrc: multiDeleteScreenshot,
                            imageAlt: 'Bouton Effacer',
                            imageCaption: 'Effacer la sélection.',
                            imageHighlight: {
                                left: '79.8%',
                                top: '37.2%',
                                width: '5.9%',
                                height: '5.9%',
                                label: 'Effacer',
                            },
                        },
                        {
                            text: (
                                <>
                                    Le bouton <strong>Supprimer</strong> supprime la sélection.
                                    <br />
                                    <em>Note</em> : un compteur est affiché sur le bouton Supprimer, il indique le
                                    nombre d'éléments sélectionnés.
                                </>
                            ),
                            imageSrc: multiDeleteScreenshot,
                            imageAlt: 'Bouton Supprimer (n)',
                            imageCaption: 'Supprimer les éléments sélectionnés.',
                            imageHighlight: {
                                left: '85.2%',
                                top: '37.2%',
                                width: '9.6%',
                                height: '5.9%',
                                label: 'Supprimer (n)',
                            },
                        },
                    ],
                },
                {
                    text: (
                        <>
                            Un pop-up de confirmation apparaît.
                        </>
                    ),
                    subSteps: [
                        {
                            text: (
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite
                                    ou la touche <strong>Escape</strong> ferme le pop-up de confirmation et revient
                                    sur la sélection en cours.
                                </>
                            ),
                        },
                        {
                            text: (
                                <>
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement la sélection.
                                </>
                            ),
                        },
                    ],
                },
            ],
        },
        {
            title: 'Suppression depuis une carte de détail',
            steps: [
                {
                    text: (
                        <>
                            Sur une <strong>carte de détail</strong> en modification, cliquer sur
                            <strong> Supprimer</strong>.
                        </>
                    ),
                    imageSrc: profUpdateScreenshot,
                    imageAlt: 'Bouton Supprimer sur la carte de détail',
                    imageCaption: 'Suppression depuis la fiche de détail.',
                    imageHighlight: {
                        left: '65.35%',
                        top: '72.4%',
                        width: '6.5%',
                        height: '7.1%',
                        label: 'Supprimer',
                    },
                },
                {
                    text: (
                        <>
                            Un pop-up de confirmation apparaît.
                        </>
                    ),
                    imageSrc: confirmationDeleteScreenshot,
                    imageAlt: 'Pop-up de confirmation de suppression',
                    imageCaption: 'Confirmation avant suppression.',
                    imageHighlight: {
                        left: '49.9%',
                        top: '52.9%',
                        width: '7.0%',
                        height: '6.5%',
                        label: 'Supprimer',
                    },
                    subSteps: [
                        {
                            text: (
                                <>
                                    Cliquer sur <strong>Annuler</strong>, la <strong>croix</strong> en haut à droite
                                    ou la touche <strong>Escape</strong> ferme le pop-up de confirmation et revient
                                    sur la carte de détail.
                                </>
                            ),
                            imageSrc: confirmationDeleteScreenshot,
                            imageAlt: 'Bouton Annuler',
                            imageCaption: 'Annuler la suppression.',
                            imageHighlight: {
                                left: '44.0%',
                                top: '52.9%',
                                width: '6.5%',
                                height: '6.5%',
                                label: 'Annuler',
                            },
                        },
                        {
                            text: (
                                <>
                                    Cliquer sur <strong>Supprimer</strong> supprime définitivement l'élément de la
                                    carte de détail ouverte et ferme la carte.
                                </>
                            ),
                        },
                    ],
                },
            ],
        },
    ],
    tips: [
        'Disponible sur : Événements, Enseignants, Salles, Matières.',
        "Le compteur (n) indique le nombre d'éléments sélectionnés.",
        'Désactiver le mode sélection pour revenir à la consultation.',
    ],
}
