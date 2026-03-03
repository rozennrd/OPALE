import { apiClient } from '../base/ApiClient'
import { ApiResponse } from '../base/types'

export interface DisponibiliteApi {
    id: string
    id_prof: string
    num_semaine: number
    dispo_micro: string | null
}

export interface AddDisponibilitePayload {
    id_prof: string
    num_semaine: number
    dispo_micro?: string | null
}

export interface UpdateDisponibilitePayload extends AddDisponibilitePayload {
    id: string
}

export async function getDisponibilites(): Promise<ApiResponse<DisponibiliteApi[]>> {
    return apiClient.get<DisponibiliteApi[]>('/getDisponibilites')
}

export async function getDisponibiliteById(
    id: string,
): Promise<ApiResponse<DisponibiliteApi>> {
    return apiClient.get<DisponibiliteApi>(
        `/getDisponibiliteById?id=${encodeURIComponent(id)}`,
    )
}

export async function addDisponibilite(
    payload: AddDisponibilitePayload,
): Promise<ApiResponse<{ message: string; insertedId?: string }>> {
    return apiClient.post<{ message: string; insertedId?: string }>(
        '/addDisponibilite',
        payload,
    )
}

export async function updateDisponibilite(
    payload: UpdateDisponibilitePayload,
): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>('/updateDisponibilite', payload)
}

export async function deleteDisponibilite(
    id: string,
): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(
        `/deleteDisponibilite?id=${encodeURIComponent(id)}`,
    )
}
