import { ApiResponse } from '../base/types'
import { apiClient } from '../base/ApiClient'

export interface BackendSpecialty {
  id: string
  id_groupe: string | null
  id_promo: string
  nom: string
  effectifs: number
}

export interface SpecialtyCreateRequest {
  id_promo: string
  id_groupe?: string | null
  nom: string
  effectifs: number
}

export interface SpecialtyUpdateRequest {
  id: string
  id_promo: string
  id_groupe?: string | null
  nom: string
  effectifs: number
}

export class SpecialtiesApi {
  /**
   * Récupère toutes les spécialités
   */
  async getSpecialties(): Promise<ApiResponse<BackendSpecialty[]>> {
    return apiClient.get<BackendSpecialty[]>('/getSpecialites')
  }

  /**
   * Récupère une spécialité par son ID
   */
  async getSpecialtyById(id: string | number): Promise<ApiResponse<BackendSpecialty>> {
    return apiClient.get<BackendSpecialty>(`/getSpecialiteByID/${id}`)
  }

  /**
   * Ajoute une nouvelle spécialité
   */
  async addSpecialty(specialty: SpecialtyCreateRequest): Promise<ApiResponse<{ message: string; insertedId: string }>> {
    return apiClient.post<{ message: string; insertedId: string }>('/addSpecialite', specialty)
  }

  /**
   * Met à jour une spécialité existante
   */
  async updateSpecialty(specialty: SpecialtyUpdateRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/updateSpecialite/${specialty.id}`, specialty)
  }

  /**
   * Supprime une spécialité par son ID
   */
  async deleteSpecialty(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/deleteSpecialite/${id}`)
  }
}

// Singleton instance
export const specialtiesApi = new SpecialtiesApi()
