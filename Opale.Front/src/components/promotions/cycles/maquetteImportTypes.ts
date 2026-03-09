export interface DetectedSpecialtyItem {
    key: string
    promotionCode: string
    promotionId: string | null
    promotionLabel: string | null
    detectedLabel: string
    normalized: string
}

export interface SpecialtyDraft {
    id?: string
    tempId?: string
    idPromo: string
    nom: string
    effectifs: number
}

export interface FileSpecialtyMapping {
    confirmed: boolean
    mapping: Record<string, string | null>
}
