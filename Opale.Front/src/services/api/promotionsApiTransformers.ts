// Data transformers for promotion API

import { BackendPromotion, PromotionCreateRequest, PromotionUpdateRequest } from './promotionsApi'
import { BackendCycle } from './cyclesApi'
import { Promotion, Cycle } from '../../models'

// Transform backend promotion to frontend promotion model
export const transformBackendPromotionToFrontend = (backend: BackendPromotion): Promotion => ({
  id: backend.id.toString(),
  label: backend.nom,
  students: backend.effectifs,
  startDate: backend.date_start,
  endDate: backend.date_end,
  groups: (backend.groups || []).map(g => ({
    id: g.id,
    idPromo: g.id_promo,
    nom: g.nom,
    effectifs: g.effectifs
  })),
  specialties: (backend.specialties || []).map(s => ({
    id: s.id,
    idPromo: s.id_promo,
    nom: s.nom,
    effectifs: s.effectifs
  })),
  constraints: {
    vacances: [],
    entreprise: [],
    stages: [],
    international: [],
    partiels: [],
    rattrapages: [],
  },
})

// Transform frontend promotion to backend promotion model for creation
export const transformFrontendPromotionToBackendCreate = (
  frontend: Promotion,
  cycleId?: string
): PromotionCreateRequest => ({
  nom: frontend.label,
  effectifs: frontend.students,
  id_cycle: cycleId,
  date_start: frontend.startDate,
  date_end: frontend.endDate,
})

// Transform frontend promotion to backend promotion model for update
export const transformFrontendPromotionToBackendUpdate = (
  frontend: Promotion
): PromotionUpdateRequest => ({
  id: frontend.id,
  nom: frontend.label,
  effectifs: frontend.students,
  date_start: frontend.startDate,
  date_end: frontend.endDate,
})

// Transform backend cycle to frontend cycle model
export const transformBackendCycleToFrontend = (
  backend: BackendCycle,
  promotions: Promotion[] = []
): Cycle => ({
  id: backend.id.toString(),
  name: backend.nom,
  promotions,
})
