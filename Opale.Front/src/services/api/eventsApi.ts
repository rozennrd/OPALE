// Events API service for managing event data

import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

// Event types matching backend
export type TypeEvent =
    | 'Cours'
    | 'Entreprise'
    | 'Examen'
    | 'Reunion'
    | 'Fermeture'
    | 'Soutenance'
    | 'JPO'
    | 'Stage'
    | 'Mobilite'
    | 'PFE'
    | 'Rattrapage'
    | 'Conference'
    | 'Rentrée'
    | 'Réunion parents'
    | 'Journée Immersion'
    | 'Concours'
    | 'Salon'
    | 'Fin des cours'
    | 'Autre'

// Backend event data types
export interface BackendEvent {
    id: string
    type: TypeEvent
    nom: string
    description?: string
    num_semaine?: number
    datetime_start: string
    datetime_end: string
    show_macro: boolean
    show_micro: boolean
    is_blocking: boolean
    is_exceptional: boolean
    is_external: boolean
    concerne?: {
        groups?: string[]
        specialties?: string[]
        promotions?: string[]
    }
}

// Requests
export interface EventCreateRequest {
    type: TypeEvent
    nom: string
    description?: string
    num_semaine?: number
    datetime_start: string
    datetime_end: string
    show_macro?: boolean
    show_micro?: boolean
    is_blocking?: boolean
    is_exceptional?: boolean
    is_external?: boolean
}

export interface EventUpdateRequest {
    type: TypeEvent
    nom: string
    num_semaine?: number
    description?: string
    datetime_start: string
    datetime_end: string
    show_macro?: boolean
    show_micro?: boolean
    is_blocking?: boolean
    is_exceptional?: boolean
    is_external?: boolean
}

export interface EventsByPromoAndTypesRequest {
    idPromo: string
    types: TypeEvent[]
}

export interface EventsByPromoAndTypesResponse {
    [key: string]: BackendEvent[]
}

class EventsApi {
    /**
     * Get all events
     */
    async getAllEvents(): Promise<ApiResponse<BackendEvent[]>> {
        return apiClient.get<BackendEvent[]>('/getAllEvents')
    }

    /**
     * Get event by ID
     */
    async getEventById(id: string): Promise<ApiResponse<BackendEvent>> {
        return apiClient.get<BackendEvent>(`/getEventById/${id}`)
    }

    /**
     * Get exceptional events
     */
    async getExceptionalEvents(): Promise<ApiResponse<BackendEvent[]>> {
        return apiClient.get<BackendEvent[]>('/getExceptionalEvents')
    }

    /**
     * Get events with show_macro = true
     */
    async getEventsMacro(): Promise<ApiResponse<BackendEvent[]>> {
        return apiClient.get<BackendEvent[]>('/getEventsMacro')
    }

    /**
     * Get events by promotion ID and types
     */
    async getEventsByPromoAndTypes(
        request: EventsByPromoAndTypesRequest
    ): Promise<ApiResponse<EventsByPromoAndTypesResponse>> {
        return apiClient.post<EventsByPromoAndTypesResponse>(
            '/getEventByPromo',
            request
        )
    }

    /**
     * Get events by promotion ID and types (alias for getEventsByPromoAndTypes)
     * Convenience method used by promotion editing hooks
     */
    async getEventPromo(
        idPromo: string,
        types: TypeEvent[]
    ): Promise<ApiResponse<EventsByPromoAndTypesResponse>> {
        return this.getEventsByPromoAndTypes({ idPromo, types })
    }

    /**
     * Add a new event
     */
    async addEvent(
        event: EventCreateRequest
    ): Promise<ApiResponse<{ success: boolean; message: string; insertedId: string }>> {
        return apiClient.post<{ success: boolean; message: string; insertedId: string }>(
            '/addEvent',
            event
        )
    }

    /**
     * Update an existing event
     */
    async updateEvent(
        id: string,
        event: EventUpdateRequest
    ): Promise<ApiResponse<{ success: boolean; message: string }>> {
        return apiClient.put<{ success: boolean; message: string }>(
            `/updateEvent/${id}`,
            event
        )
    }

    /**
     * Delete an event
     */
    async deleteEvent(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
        return apiClient.delete<{ success: boolean; message: string }>(
            `/deleteEvent/${id}`
        )
    }
}

// Singleton instance
export const eventsApi = new EventsApi()

// Export class for custom instances if needed
export { EventsApi }
