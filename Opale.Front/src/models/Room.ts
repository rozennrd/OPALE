// src/models/Room.ts

export type RoomType =
    | 'Cours'
    | 'Informatique'
    | 'Projet'
    | 'Rassemblement'
    | 'Reunion'
    | 'Associatif'
    | 'Electronique'
    | 'Fablab'
    | 'Reseau'

export interface Room {
    id: string

    /** Code court, ex : "J109" */
    name: string

    /** Nom complet optionnel, ex : "J109_ClassLab" */
    fullName?: string

    /** Type principal pour l’icône / badge */
    mainType: RoomType

    /** Types disponibles pour la salle */
    types: RoomType[]

    /** Étage de la salle */
    floor: number

    /** Nombre de places */
    capacity: number

    /** Disponibilite globale de la salle */
    isAvailable: boolean

    /** Commentaires libres */
    description?: string
}
