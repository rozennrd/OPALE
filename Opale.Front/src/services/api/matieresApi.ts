// src/services/api/matieresApi.ts
import { apiClient } from '../base/ApiClient'
import { Matiere } from '../../models/Matiere'
import { BackendMatiere } from './matieresApiTransformers'
import { ApiResponse } from '../base/types'

export interface BackendMatiereUpdateRequest {
    id: string
    nom: string
    volume_horaire: number
    id_promo: string              // UUID promo
    id_specialite?: string | null
    semestre: number
    nb_partiels: number
    nb_eval_intermediaire?: number | null
    heures_td?: number | null
    heures_tp?: number | null
}


export async function getMatiereById(id: string): Promise<Matiere> {
    const res = await apiClient.get<Matiere>(`/getMatiereByID?id=${encodeURIComponent(id)}`)
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to fetch matiere')
    }
    if (!res.data) throw new Error('Matiere not found')
    return res.data
}

export async function addMatiere(payload: Partial<Matiere>) {
    const res = await apiClient.post('/addMatiere', payload)
    if (!res.success) throw new Error(res.error?.message ?? 'Failed to add matiere')
    return res.data
}

export async function updateMatiere(
    payload: BackendMatiereUpdateRequest
): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updateMatiere', payload)
}

export async function deleteMatiere(id: string) {
    const res = await apiClient.delete(`/deleteMatiere?id=${encodeURIComponent(id)}`)
    if (!res.success) throw new Error(res.error?.message ?? 'Failed to delete matiere')
    return res.data
}

export async function getMatieres(): Promise<BackendMatiere[]> {
    const res = await apiClient.get<BackendMatiere[]>('/getMatieres')

    if (!res.success) {
        console.error('[API][getMatieres] error:', res.error)
        throw new Error(res.error?.message ?? 'Failed to fetch matieres')
    }

    return res.data ?? []
}
