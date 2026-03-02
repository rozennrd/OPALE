// src/services/api/sallesApi.ts
import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface Salle {
    id: string
    nom: string
    nom_complet?: string | null
    type_principal: string
    types_secondaires?: string[] | null
    capacite: number
    etage: number
    utilisable: boolean
    description?: string | null
}

export interface SalleCreateRequest {
    nom: string
    nom_complet?: string | null
    type_principal: string
    types_secondaires?: string[] | null
    capacite: number
    etage: number
    utilisable: boolean
    description?: string | null
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
        return apiClient.post<{ message: string }>('/updateSalle', salle)
    }

    async deleteSalle(id: string): Promise<ApiResponse<{ message: string }>> {
        return apiClient.delete<{ message: string }>(`/deleteSalle?id=${encodeURIComponent(id)}`)
    }


}

export const sallesApi = new SallesApi()
export { SallesApi }