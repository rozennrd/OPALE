import type { TutorialContent } from '../types'

export const macroTutorialContent: TutorialContent = {
    objective: 'Construire un planning macro realiste sur la periode cible.',
    expectedResult:
        'Un planning macro coherent est genere et pret a servir de base pour le micro.',
    steps: [
        'Verifier que les promotions, matieres, enseignants et salles sont a jour.',
        'Definir ou controler les contraintes globales de planning.',
        'Lancer la generation macro depuis le module de planification.',
        'Relire les alertes et ajuster les donnees si des conflits sont signales.',
        'Valider le scenario retenu et enregistrer la version de reference.',
    ],
    tips: [
        'Travailler d abord sur un perimetre reduit avant de lancer un calcul complet.',
        'Conserver une version valide avant chaque regeneration importante.',
    ],
}
