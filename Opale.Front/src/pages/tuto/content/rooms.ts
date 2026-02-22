import type { TutorialContent } from '../types'

export const roomsTutorialContent: TutorialContent = {
    objective: 'Configurer les salles et leurs caracteristiques pour des affectations precises.',
    expectedResult:
        'Chaque salle est correctement typee et disponible pour les besoins de planification.',
    steps: [
        'Entrer sur la page Salles puis afficher la zone a mettre a jour.',
        'Ajouter ou modifier une salle avec ses informations principales.',
        'Renseigner le type de salle et les attributs utiles.',
        'Controler les conflits de disponibilite ou de compatibilite.',
        'Sauvegarder puis valider la presence de la salle dans la grille.',
    ],
    tips: [
        'Utiliser une convention de nommage claire par batiment et numero.',
        'Verifier regulierement les types de salles critiques pour les TP.',
    ],
}
