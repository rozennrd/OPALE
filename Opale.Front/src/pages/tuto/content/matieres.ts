import type { TutorialContent } from '../types'

export const matieresTutorialContent: TutorialContent = {
    objective: 'Maintenir le catalogue des matieres utilisees dans les maquettes et plannings.',
    expectedResult: 'Les matieres sont a jour et directement reutilisables dans les affectations.',
    steps: [
        'Acceder a la page Matieres puis filtrer le perimetre cible.',
        'Creer ou editer une matiere avec ses attributs essentiels.',
        'Associer les informations utiles a la planification.',
        'Verifier la coherence des libelles et des donnees saisies.',
        'Valider les changements et controler la disponibilite en liste.',
    ],
    tips: [
        'Eviter les doublons de nom en definissant une nomenclature commune.',
        'Revoir les matieres inactives avant chaque nouveau semestre.',
    ],
}
