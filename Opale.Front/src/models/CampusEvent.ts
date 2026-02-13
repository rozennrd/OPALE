// src/models/CampusEvent.ts

export type EventSource = 'JUNIA' | 'EXTERNE'

export type EventType =
    | 'JOURNEE_PO'
    | 'EXAMEN'
    | 'CONFERENCE'
    | 'FORUM'
    | 'SALON'
    | 'AUTRE'

export interface CampusEvent {
    id: string
    /** Nom de l’événement */
    name: string
    /** Date au format ISO (ex: "2025-03-12") */
    date: string
    /** Lieu / campus / ville */
    location: string
    /** Origine de l’événement : JUNIA ou externe */
    source: EventSource
    /** Type d’événement (pour le filtre + badge) */
    type: EventType
}