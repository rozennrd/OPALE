import type { TutorialContent } from '../types'

export const eventsTutorialContent: TutorialContent = {
    objective: 'Gerer les evenements planifies ou exceptionnels qui impactent la planification.',
    expectedResult:
        'Les evenements sont correctement enregistres et pris en compte dans les emplois du temps.',
    steps: [
        'Acceder a la page Evenements et filtrer la periode de travail.',
        'Creer un evenement en choisissant le bon type et les bonnes dates.',
        'Associer la promotion ou les ressources impactees.',
        'Verifier les chevauchements signales et corriger si besoin.',
        'Confirmer la creation puis suivre l evenement dans la vue de liste.',
    ],
    tips: [
        'Utiliser des libelles explicites pour distinguer rapidement les evenements.',
        'En cas de doute, verifier les conflits avant validation finale.',
    ],
}
