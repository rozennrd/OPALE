// src/services/api/matieresApiTransformers.ts
import { Matiere } from '../../models/Matiere'

// Ce que renvoie ton back (vu dans Postman)
export interface BackendMatiere {
    id: string
    nom: string
    volume_horaire: number | null
    id_promo: string | null // UUID
    id_specialite: string | null
    semestre: number | null
    nb_partiels: number | null
    nb_eval_intermediaire: number | null
    heures_td: number | null
    heures_tp: number | null
}

/**
 * Transform backend -> frontend
 * - Remplace id_promo UUID par le label ("ADI 1") grâce à promoLabelById
 * - Convertit les null en 0/undefined pour respecter le modèle front
 */
export const transformBackendMatiereToFrontend = (
    backend: BackendMatiere,
    promoLabelById: Map<string, string>
): Matiere => {
    const promoId = backend.id_promo ?? ''
    const promoLabel = promoLabelById.get(promoId) ?? promoId // fallback UUID si non trouvé

    return {
        id: backend.id,
        nom: backend.nom ?? '—',
        volume_horaire: backend.volume_horaire ?? 0,
        id_promo: promoLabel,
        promo_id: backend.id_promo ?? undefined,
        id_specialite: backend.id_specialite ?? undefined,
        semestre: backend.semestre ?? 0,
        nb_partiels: backend.nb_partiels ?? 0,
        nb_eval_intermediaire:
            backend.nb_eval_intermediaire === null ? undefined : backend.nb_eval_intermediaire ?? undefined,
        heures_td: backend.heures_td ?? 0,
        heures_tp: backend.heures_tp === null ? undefined : backend.heures_tp ?? undefined,
    }
}
