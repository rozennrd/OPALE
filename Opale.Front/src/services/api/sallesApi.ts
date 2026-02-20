// src/services/api/sallesApi.ts
import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface Salle {
    id: string
    nom: string
    type: string
    capacite: number
    etage: number
    description?: string
}

export interface SalleCreateRequest {
    nom: string
    type: string
    capacite: number
    etage: number
    description?: string
}

export interface SalleUpdateRequest extends SalleCreateRequest {
    id: string
}

class SallesApi {
    async getAllSalles(): Promise<ApiResponse<Salle[]>> {
        return apiClient.get<Salle[]>('/getSallesData')
    }

    async createSalle(salle: SalleCreateRequest): Promise<ApiResponse<{ message: string; insertedId: string }>> {
        return apiClient.post<{ message: string; insertedId: string }>('/setSallesData', salle)
    }

    async updateSalle(salle: SalleUpdateRequest): Promise<ApiResponse<{ message: string }>> {
        return apiClient.put<{ message: string }>('/updateSalle', salle)
    }

    async deleteSalle(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<{ message: string }>(`/deleteSalle/${id}`)
    }


}

export const sallesApi = new SallesApi()
export { SallesApi }