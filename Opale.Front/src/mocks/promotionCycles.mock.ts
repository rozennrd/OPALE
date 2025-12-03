// src/mocks/promotionCycles.mock.ts
import { Cycle } from '../models'
import { makePromotions } from '../utils/promoUtils'

interface DefaultCycleSeed {
    id: string
    name: string
    years: number
}

// 💾 Données de test (extraites de usePromotionCycles)
export const DEFAULT_CYCLES_SEED: DefaultCycleSeed[] = [
    { id: 'cycle-adi',   name: 'ADI',   years: 2 },
    { id: 'cycle-sir',   name: 'SIR',   years: 2 },
    { id: 'cycle-isen',  name: 'ISEN',  years: 3 },
    { id: 'cycle-fisen', name: 'FISEN', years: 3 },
]

// 🧪 Construction des cycles de mock avec leurs promotions
export const buildMockCycles = (): Cycle[] =>
    DEFAULT_CYCLES_SEED.map(c => ({
        id: c.id,
        name: c.name,
        promotions: makePromotions(c.name, c.years),
    }))