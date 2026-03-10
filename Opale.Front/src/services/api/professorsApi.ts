import { apiClient } from '../base/ApiClient'

export interface TeacherApi {
    id: string
    prenom: string
    nom: string
    email_perso: string
    email?: string
    telephone: string
    campus_origin?: string
    type?: 'Intervenant' | 'Permanent' | 'Invite'
    modalite_enseignement: 'Distanciel' | 'Hybride' | 'Présentiel'
    subjects: {
        name: string
        promo: string
    }[]
    availability?: string
    availabilityPeriods?: {
        id: string
        label: string
        availability: string
    }[]
}

export interface UpdateProfPayload {
    nom: string
    prenom: string
    email?: string
    email_perso?: string
    telephone?: string
    type: 'Permanent' | 'Intervenant' | 'Invite'
    modalite_enseignement?: 'Distanciel' | 'Hybride' | 'Présentiel'
    campus_origin?: 'Bordeaux' | 'Lille' | 'Chateauroux'
}

export interface AddProfResponse {
    success?: boolean
    message?: string
    insertedId?: string
}

export async function getProfsData(): Promise<TeacherApi[]> {
    const res = await apiClient.get<TeacherApi[]>('/getProfsData')
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to fetch teachers')
    }
    return res.data ?? []
}

export async function updateProf(id: string, payload: UpdateProfPayload): Promise<void> {
    const res = await apiClient.put<{ success?: boolean; message?: string }>(
        `/updateProf/${id}`,
        payload,
    )
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to update teacher')
    }
}

export async function addProf(payload: UpdateProfPayload): Promise<string> {
    const res = await apiClient.post<AddProfResponse>('/addProf', payload)
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to create teacher')
    }

    const insertedId = res.data?.insertedId
    if (!insertedId) {
        throw new Error('Teacher created but insertedId is missing in response')
    }

    return insertedId
}

export async function deleteProf(id: string): Promise<void> {
    const res = await apiClient.delete<{ success?: boolean; message?: string }>(
        `/deleteProf/${encodeURIComponent(id)}`,
    )
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to delete teacher')
    }
}
