// Promotions API service for managing promotion data

import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

// Backend promotion data types (from BobPlanning back)
export interface BackendPromotion {
  id: string
  nom: string
  effectifs: number
  id_cycle: string
  date_start: string
  date_end: string
  type: string
  groups: Array<{ id: string; nom: string; effectifs: number }>
  specialties: Array<{ id: string; nom: string; effectifs: number }>
}

export interface PromotionCreateRequest {
  nom: string
  effectifs: number
  id_cycle?: string
  date_start: string
  date_end: string
}

export interface PromotionUpdateRequest {
  id: string
  nom: string
  effectifs: number
  id_cycle?: string
  date_start: string
  date_end: string
}

export interface PromotionDeleteRequest {
  id: string
}

class PromotionsApi {
  /**
   * Get all promotions
   */
  async getPromotions(): Promise<ApiResponse<BackendPromotion[]>> {
    return apiClient.get<BackendPromotion[]>('/getPromotions')
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: number): Promise<ApiResponse<BackendPromotion[]>> {
    const queryParams = new URLSearchParams({ id: id.toString() })
    return apiClient.get<BackendPromotion[]>(`/getPromoById?${queryParams}`)
  }

  /**
   * Add a new promotion
   */
  async addPromotion(promotion: PromotionCreateRequest): Promise<ApiResponse<{ message: string; insertedId: number }>> {
    return apiClient.post<{ message: string; insertedId: number }>('/addPromotion', promotion)
  }

  /**
   * Update an existing promotion
   */
  async updatePromotion(promotion: PromotionUpdateRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updatePromotion', promotion)
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(id: string): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams({ id: id })
    return apiClient.delete<{ message: string }>(`/deletePromotion?${queryParams}`)
  }
}

// Singleton instance
export const promotionsApi = new PromotionsApi()

// Export class for custom instances if needed
export { PromotionsApi }
