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
    name: string
    /** Date utilisee pour le tri/affichage liste (ISO) */
    date: string
    startDate?: string
    endDate?: string
    location: string
    source: EventSource
    type: EventType
    description?: string
    showMacro?: boolean
    showMicro?: boolean
    concernedCycleIds?: string[]
    concernedPromotionIds?: string[]
}
