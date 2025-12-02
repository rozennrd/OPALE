// Promotions API service for managing promotion data

import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

// Backend promotion data types (from BobPlanning back)
export interface BackendPromotion {
  id: number
  nom: string
  effectifs: number
  id_cycle: number | null
  date_start: string
  date_end: string
}

export interface PromotionCreateRequest {
  nom: string
  effectifs: number
  id_cycle?: number | null
  date_start: string
  date_end: string
}

export interface PromotionUpdateRequest {
  id: number
  nom: string
  effectifs: number
  date_start: string
  date_end: string
}

export interface PromotionDeleteRequest {
  id: number
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
    // Backend expects query parameters for this endpoint
    const queryParams = new URLSearchParams({
      nom: promotion.nom,
      effectifs: promotion.effectifs.toString(),
      date_start: promotion.date_start,
      date_end: promotion.date_end,
    })

    if (promotion.id_cycle !== null && promotion.id_cycle !== undefined) {
      queryParams.append('id_cycle', promotion.id_cycle.toString())
    }

    return apiClient.post<{ message: string; insertedId: number }>(`/addPromotion?${queryParams}`)
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
  async deletePromotion(id: number): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams({ id: id.toString() })
    return apiClient.delete<{ message: string }>(`/deletePromotion?${queryParams}`)
  }
}

// Singleton instance
export const promotionsApi = new PromotionsApi()

// Export class for custom instances if needed
export { PromotionsApi }
