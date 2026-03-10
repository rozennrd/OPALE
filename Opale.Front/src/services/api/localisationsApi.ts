// src/services/api/localisationsApi.ts
import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface Localisation {
    id: string
    id_salle: string
    id_event: string
}

export interface LocalisationCreateRequest {
    id_salle: string
    id_event: string
}

class LocalisationsApi {
    async getAllLocalisations(): Promise<ApiResponse<Localisation[]>> {
        return apiClient.get<Localisation[]>('/getAllLocalisations')
    }

    async getLocalisationsByEvent(eventId: string): Promise<ApiResponse<Localisation[]>> {
        return apiClient.get<Localisation[]>(`/getLocalisationsByEvent/${eventId}`)
    }

    async getLocalisationsBySalle(salleId: string): Promise<ApiResponse<Localisation[]>> {
        return apiClient.get<Localisation[]>(`/getLocalisationsBySalle/${salleId}`)
    }

    async addLocalisation(data: LocalisationCreateRequest): Promise<ApiResponse<{ message: string; data: Localisation }>> {
        return apiClient.post<{ message: string; data: Localisation }>('/addLocalisation', data)
    }

    async updateLocalisation(id: string, data: LocalisationCreateRequest): Promise<ApiResponse<{ message: string }>> {
        return apiClient.put<{ message: string }>(`/updateLocalisation/${id}`, data)
    }

    async deleteLocalisation(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<{ message: string }>(`/deleteLocalisation/${id}`)
    }

    async deleteLocalisationsByEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<{ message: string }>(`/deleteLocalisationsByEvent/${eventId}`)
    }

    async deleteLocalisationsBySalle(salleId: string): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<{ message: string }>(`/deleteLocalisationsBySalle/${salleId}`)
    }
}

export const localisationsApi = new LocalisationsApi()