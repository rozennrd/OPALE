// src/models/Teacher.ts

export type TeachingMode = 'DISTANCIEL' | 'HYBRIDE' | 'PRESENTIEL'

export interface Teacher {
    id: string
    firstName: string
    lastName: string
    phone: string
    mode: TeachingMode
}