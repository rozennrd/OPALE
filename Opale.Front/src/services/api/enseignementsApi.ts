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
    console.log('[API][getEnseignements] calling /getEnseignements')
    return apiClient.get<BackendEnseignement[]>('/getEnseignements')
}

// ⚠️ Ton endpoint “ByID” : on ne sait pas si c’est by id enseignement, ou by id matière.
// Je te le mets “by enseignement id” (le plus standard).
export async function getEnseignementByID(id: string): Promise<ApiResponse<BackendEnseignement[]>> {
    console.log('[API][getEnseignementByID] calling /getEnseignementByID id=', id)
    return apiClient.get<BackendEnseignement[]>(`/getEnseignementByID?id=${encodeURIComponent(id)}`)
}

export async function addEnseignement(
    payload: EnseignementCreateRequest
): Promise<ApiResponse<{ message: string; insertedId?: string }>> {
    console.log('[API][addEnseignement] payload ->', payload)
    return apiClient.post<{ message: string; insertedId?: string }>('/addEnseignement', payload)
}

export async function updateEnseignement(
    payload: EnseignementUpdateRequest
): Promise<ApiResponse<{ message: string }>> {
    console.log('[API][updateEnseignement] payload ->', payload)
    return apiClient.put<{ message: string }>('/updateEnseignement', payload)
}

export async function deleteEnseignement(id: string): Promise<ApiResponse<{ message: string }>> {
    console.log('[API][deleteEnseignement] id ->', id)
    return apiClient.delete<{ message: string }>(`/deleteEnseignement?id=${encodeURIComponent(id)}`)
}
