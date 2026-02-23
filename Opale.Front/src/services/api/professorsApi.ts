import { apiClient } from '../base/ApiClient'

export interface TeacherApi {
    id: string
    prenom: string
    nom: string
    phone: string
    email_perso: string
    email?: string
    campus_origin?: string
    type?: 'Intervenant' | 'Permanent' | 'Invite'
    mode: 'DISTANCIEL' | 'HYBRIDE' | 'PRESENTIEL'
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

export async function getProfsData(): Promise<TeacherApi[]> {
    const res = await apiClient.get<TeacherApi[]>('/getProfsData')
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to fetch teachers')
    }
    return res.data ?? []
}
