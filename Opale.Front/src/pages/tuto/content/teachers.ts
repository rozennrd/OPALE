import type { TutorialContent } from '../types'

export const teachersTutorialContent: TutorialContent = {
    objective: 'Administrer les profils enseignants et leurs disponibilites pour la planification.',
    expectedResult:
        'Les fiches enseignants sont fiables et permettent des affectations sans incoherence.',
    steps: [
        'Ouvrir la page Enseignants et utiliser la recherche pour cibler une fiche.',
        'Creer ou editer les informations de profil de l enseignant.',
        'Renseigner le mode d intervention et les matieres associees.',
        'Verifier les informations de contact et les disponibilites.',
        'Enregistrer et controler la coherence de la carte enseignant.',
    ],
    tips: [
        'Uniformiser les noms et prenoms pour eviter les doublons.',
        'Mettre a jour les matieres avant les periodes de generation.',
    ],
}
