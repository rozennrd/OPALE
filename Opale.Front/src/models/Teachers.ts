export type TeachingMode = 'DISTANCIEL' | 'HYBRIDE' | 'PRESENTIEL'

export interface TeacherSubject {
    name: string        // ex: "Maths"
    promo: string       // ex: "AP 3"
}

export interface TeacherAvailabilityPeriod {
    id: string          // identifiant interne, ex: "period-1"
    label: string       // libellé affiché, ex: "Période 1" ou "Jan–Mars"
    availability: string // 10 caractères "0"/"1"
}

export interface Teacher {
    id: string
    firstName: string
    lastName: string
    phone: string
    email: string
    mode: TeachingMode
    subjects: TeacherSubject[]

    /**
     * Legacy simple availability (sans périodes).
     * On l'utilise comme fallback si aucune période n'est définie.
     */
    availability?: string

    /**
     * Nouvelles disponibilités par périodes.
     */
    availabilityPeriods?: TeacherAvailabilityPeriod[]
}