// src/hooks/promotions/usePromotionCycles.js
import { useState, useEffect } from 'react'
import {
    uid,
    makePromotions,
    hasPromoMismatch,
} from '../../utils/promoUtils'

const DEFAULT = [
    { id: 'cycle-adi',   name: 'ADI',   years: 2 },
    { id: 'cycle-sir',   name: 'SIR',   years: 2 },
    { id: 'cycle-isen',  name: 'ISEN',  years: 3 },
    { id: 'cycle-fisen', name: 'FISEN', years: 3 },
]

export function usePromotionCycles() {
    const [cycles, setCycles] = useState(() =>
        DEFAULT.map(c => ({
            id: c.id,
            name: c.name,
            promotions: makePromotions(c.name, c.years),
        }))
    )

    // Ajout d’un cycle
    const addCycle = () => {
        const name = (window.prompt('Nom du cycle (diplôme) ?', 'Nouveau cycle') || '').trim()
        if (!name) return

        let years = Number(window.prompt('Nombre d’années (1 à 6) ?', '3'))
        if (!Number.isFinite(years)) years = 3
        years = Math.max(1, Math.min(6, years))

        const newCycle = {
            id: uid('cycle'),
            name,
            promotions: makePromotions(name, years),
        }

        setCycles(prev => {
            const next = [...prev, newCycle]
            console.log('[CYCLES] add', newCycle)
            return next
        })
    }

    const removeCycle = (cycleId) => {
        setCycles(prev => {
            const next = prev.filter(c => c.id !== cycleId)
            console.log('[CYCLES] remove', cycleId)
            return next
        })
    }

    const renameCycle = (cycleId, name) => {
        setCycles(prev => prev.map(c => {
            if (c.id !== cycleId) return c
            const renamed = {
                ...c,
                name,
                promotions: c.promotions.map((p, i) => ({
                    ...p,
                    label: `${name} ${i + 1}`,
                })),
            }
            console.log('[CYCLES] rename', { cycleId, name })
            return renamed
        }))
    }

    const removePromotion = (cycleId, promoId) => {
        setCycles(prev =>
            prev.map(c =>
                c.id === cycleId
                    ? { ...c, promotions: c.promotions.filter(p => p.id !== promoId) }
                    : c
            )
        )
    }

    // Flag global d’incohérence (stocké en localStorage)
    useEffect(() => {
        const anyMismatch = cycles.some(cycle =>
            (cycle.promotions || []).some(promo => hasPromoMismatch(promo))
        )

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('opale:promosMismatch', anyMismatch ? '1' : '0')
        }
    }, [cycles])

    return {
        cycles,
        setCycles,
        addCycle,
        removeCycle,
        renameCycle,
        removePromotion,
    }
}