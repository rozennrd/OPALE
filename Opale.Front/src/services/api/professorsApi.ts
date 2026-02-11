import { apiClient } from '../base/ApiClient'

export interface TeacherApi {
    id: string
    firstName: string
    lastName: string
}

export async function getProfsData(): Promise<TeacherApi[]> {
    const res = await apiClient.get<TeacherApi[]>('/getProfsData')
    if (!res.success) {
        throw new Error(res.error?.message ?? 'Failed to fetch teachers')
    }
    return res.data ?? []
}
