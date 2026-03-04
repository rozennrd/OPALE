// src/services/api/enseignementsApi.ts
import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface BackendEnseignement {
    id: string
    id_matiere: string
    id_prof: string
    heures_td: number
    heures_tp: number
    heures_projet?: number
    heures_elearning?: number
    heures_autre?: number
}

export interface EnseignementCreateRequest {
    id_matiere: string
    id_prof: string
    heures_td?: number
    heures_tp?: number
    heures_projet?: number
    heures_elearning?: number
    heures_autre?: number
}

export interface EnseignementUpdateRequest {
    id: string
    id_matiere: string
    id_prof: string
    heures_td?: number
    heures_tp?: number
    heures_projet?: number
    heures_elearning?: number
    heures_autre?: number
}

export async function getEnseignements(): Promise<ApiResponse<BackendEnseignement[]>> {
    return apiClient.get<BackendEnseignement[]>('/getEnseignements')
}

export async function getEnseignementByID(id: string): Promise<ApiResponse<BackendEnseignement[]>> {
    return apiClient.get<BackendEnseignement[]>(`/getEnseignementByID?id=${encodeURIComponent(id)}`)
}

export async function addEnseignement(
    payload: EnseignementCreateRequest
): Promise<ApiResponse<{ message: string; insertedId?: string }>> {
    return apiClient.post<{ message: string; insertedId?: string }>('/addEnseignement', payload)
}

export async function updateEnseignement(
    payload: EnseignementUpdateRequest
): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updateEnseignement', payload)
}

export async function deleteEnseignement(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/deleteEnseignement?id=${encodeURIComponent(id)}`)
}
