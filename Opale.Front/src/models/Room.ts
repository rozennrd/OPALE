// src/models/Room.ts

export type RoomType = 'TD' | 'TP_ELECTRONIQUE' | 'TP_NUMERIQUE' | 'PROJET' | 'AUTRE'

export interface Room {
    id: string

    /** Code court, ex : "J109" */
    name: string

    /** Nom complet optionnel, ex : "J109_ClassLab" */
    fullName?: string

    /** Étages 0, 1, 2 */
    floor: 0 | 1 | 2

    /** Type principal pour l’icône / badge */
    mainType: RoomType

    /** Types disponibles pour la salle */
    types: RoomType[]

    /** Commentaires libres */
    description?: string
}