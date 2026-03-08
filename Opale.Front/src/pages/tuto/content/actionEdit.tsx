import type { TutorialContent } from '../types'
/* eslint-disable react/no-unescaped-entities */

export const actionEditTutorialContent: TutorialContent = {
    objective:
        'Modifier un Ã©lÃ©ment existant depuis la liste.',
    expectedResult:
        "La fiche dÃ©tail est ouverte en mode Ã©dition.",
    steps: [
        <>
            Sur les pages <strong>Ã‰vÃ©nements</strong>, <strong>Enseignants</strong>,{' '}
            <strong>Salles</strong> et <strong>MatiÃ¨res</strong>, cliquer sur la carte ou la ligne de
            l'Ã©lÃ©ment Ã  modifier.
        </>,
        <>
            La fiche dÃ©tail s'ouvre et permet de modifier les informations.
        </>,
    ],
    tips: [
        "Si le mode SÃ©lectionner est actif, cliquer sur l'Ã©lÃ©ment sÃ©lectionne au lieu d'ouvrir la fiche.",
        "DÃ©sactive le mode SÃ©lectionner pour Ã©diter.",
    ],
}
