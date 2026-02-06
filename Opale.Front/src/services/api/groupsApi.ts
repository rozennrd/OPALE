import { ApiResponse } from '../base/types'
import { apiClient } from '../base/ApiClient'

export interface BackendGroup {
  id: string
  id_promo: string
  nom: string
  effectifs: number
}

export interface GroupCreateRequest {
  id_promo: string
  nom: string
  effectifs: number
}

export interface GroupUpdateRequest {
  id: string
  id_promo: string
  nom: string
  effectifs: number
}

export class GroupsApi {
  /**
   * Récupère tous les groupes
   */
  async getGroups(): Promise<ApiResponse<BackendGroup[]>> {
    return apiClient.get<BackendGroup[]>('/getGroups')
  }

  /**
   * Récupère un groupe par son ID
   */
  async getGroupById(id: string | number): Promise<ApiResponse<BackendGroup>> {
    const queryParams = new URLSearchParams({ id: id.toString() })
    return apiClient.get<BackendGroup>(`/getGroupById?${queryParams}`)
  }

  /**
   * Ajoute un nouveau groupe
   */
  async addGroup(group: GroupCreateRequest): Promise<ApiResponse<{ message: string; insertedId: number }>> {
    return apiClient.post<{ message: string; insertedId: number }>('/addGroup', group)
  }

  /**
   * Met à jour un groupe existant
   */
  async updateGroup(group: GroupUpdateRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updateGroup', group)
  }

  /**
   * Supprime un groupe par son ID
   */
  async deleteGroup(id: number): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams({ id: id.toString() })
    return apiClient.delete<{ message: string }>(`/deleteGroup?${queryParams}`)
  }
}
