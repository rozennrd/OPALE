// src/models/Matiere.ts

/**
 * Représentation d'une matière (mock front).
 *
 * Note: `id_promo` et `id_specialite` restent des `string` (pas de contrainte UUID)
 * pour être compatibles avec des mocks statiques.
 */
export interface Matiere {
    id: string
    nom: string
    volume_horaire: number
    id_promo: string // Label de la promo, pas l'UUID
    promo_id?: string // UUID original de la promo
    id_specialite?: string | null // Label de la spécialité, pas l'UUID
    semestre: number
    nb_partiels: number
    nb_eval_intermediaire?: number
    heures_td: number
    heures_tp?: number
    heures_projet?: number
    heures_elearning?: number
    heures_autre?: number
}