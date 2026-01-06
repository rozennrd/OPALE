// Cycles API service for managing cycle data

import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

// Backend cycle data types (from BobPlanning back)
export interface BackendCycle {
  id: string
  nom: string
  type: string
}

export interface BackendCycleType {
  type: string
}

export interface CycleCreateRequest {
  nom: string
  type: string
}

export interface CycleUpdateRequest {
  id: string
  nom: string
  type: string
}

class CyclesApi {
  /**
   * Get all cycles
   */
  async getCycles(): Promise<ApiResponse<BackendCycle[]>> {
    return apiClient.get<BackendCycle[]>('/getCycles')
  }

  /**
   * Get cycle by ID
   */
  async getCycleById(id: number): Promise<ApiResponse<BackendCycle[]>> {
    const queryParams = new URLSearchParams({ id: id.toString() })
    return apiClient.get<BackendCycle[]>(`/getCycleById?${queryParams}`)
  }

  /**
   * Get available cycle types
   */
  async getCycleTypes(): Promise<ApiResponse<BackendCycleType[]>> {
    return apiClient.get<BackendCycleType[]>('/getCycleTypes')
  }

  /**
   * Add a new cycle
   */
  async addCycle(cycle: CycleCreateRequest): Promise<ApiResponse<{ message: string; insertedId: string }>> {
    return apiClient.post<{ message: string; insertedId: string }>('/addCycle', cycle)
  }

  /**
   * Update an existing cycle
   */
  async updateCycle(cycle: CycleUpdateRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updateCycle', cycle)
  }

  /**
   * Delete a cycle
   */
  async deleteCycle(id: string): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams({ id: id })
    return apiClient.delete<{ message: string }>(`/deleteCycle?${queryParams}`)
  }
}

// Singleton instance
export const cyclesApi = new CyclesApi()

// Export class for custom instances if needed
export { CyclesApi }
