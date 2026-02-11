// src/services/api/matieresApi.ts
import { apiClient } from '../base/ApiClient'
import { Matiere } from '../../models/Matiere'
import { BackendMatiere } from './matieresApiTransformers'

//export async function getMatieres(): Promise<Matiere[]> {
//    const res = await apiClient.get<Matiere[]>('/getMatieres')
//    if (!res.success) {
//        throw new Error(res.error?.message ?? 'Failed to fetch matieres')
//    }
//    return res.data ?? []
//}

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

export async function updateMatiere(payload: Partial<Matiere>) {
    const res = await apiClient.put('/updateMatiere', payload)
    if (!res.success) throw new Error(res.error?.message ?? 'Failed to update matiere')
    return res.data
}

export async function deleteMatiere(id: string) {
    const res = await apiClient.delete(`/deleteMatiere?id=${encodeURIComponent(id)}`)
    if (!res.success) throw new Error(res.error?.message ?? 'Failed to delete matiere')
    return res.data
}

export async function getMatieres(): Promise<BackendMatiere[]> {
    console.log('[API][getMatieres] calling /getMatieres')

    const res = await apiClient.get<BackendMatiere[]>('/getMatieres')

    console.log('[API][getMatieres] raw response:', res)

    if (!res.success) {
        console.error('[API][getMatieres] error:', res.error)
        throw new Error(res.error?.message ?? 'Failed to fetch matieres')
    }

    console.log('[API][getMatieres] data length:', res.data?.length)
    console.log('[API][getMatieres] first item:', res.data?.[0])

    return res.data ?? []
}
