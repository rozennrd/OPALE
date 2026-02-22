import type { TutorialContent } from '../types'

export const microTutorialContent: TutorialContent = {
    objective: 'Decliner le planning macro en planification fine exploitable au quotidien.',
    expectedResult: 'Le planning micro est renseigne avec des affectations detaillees et controlables.',
    steps: [
        'Charger la base macro validee comme point de depart.',
        'Affecter precisement les ressources sur les seances a planifier.',
        'Verifier les collisions horaires et les indisponibilites.',
        'Ajuster les evenements ponctuels qui impactent la semaine.',
        'Valider puis publier la version micro finalisee.',
    ],
    tips: [
        'Appliquer les corrections en lots courts pour limiter les effets de bord.',
        'Verifier les sections les plus contraintes en priorite.',
    ],
}
