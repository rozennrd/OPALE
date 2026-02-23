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
    /** Nom de l'événement */
    name: string
    /** Datetime de début ISO (ex: "2025-03-12T09:00:00.000Z") */
    startDate: string
    /** Datetime de fin ISO (ex: "2025-03-12T11:00:00.000Z") */
    endDate: string
    /** Lieu calculé depuis les salles associées */
    location: string
    /** Origine de l'événement */
    source: EventSource
    /** Type d'événement */
    type: EventType
    /** Description optionnelle */
    description?: string
    /** Numéro de semaine */
    num_semaine?: number
    /** Afficher en vue macro */
    show_macro?: boolean
    /** Afficher en vue micro */
    show_micro?: boolean
    /** Événement bloquant */
    is_blocking?: boolean
    /** Événement exceptionnel */
    is_exceptional?: boolean
    /** Événement externe */
    is_external?: boolean
    /** Liste de cycles concernés par l'event **/
    concernedCycleIds?: string[]
    /** Liste de promo concernés par l'event **/
    concernedPromotionIds?: string[]
}
