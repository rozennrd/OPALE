// src/hooks/promotions/usePromotionConstraints.js
import { useCallback } from 'react'
import { uid } from '../../utils/promoUtils'

export const createEmptyConstraints = () => ({
    vacances: [],
    entreprise: [],
    stages: [],
    international: [],
    partiels: [],
    rattrapages: [],
})

export function usePromotionConstraints(editingPromo, setEditingPromo) {
    const handleAddConstraint = useCallback((type) => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const list = base[type] || []

            const newRange = {
                id: uid(`ctr-${type}`),
                start: '',
                end: '',
            }

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: [...list, newRange],
                },
            }
        })
    }, [setEditingPromo])

    const handleRemoveConstraint = useCallback((type, id) => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const list = base[type] || []

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: list.filter(r => r.id !== id),
                },
            }
        })
    }, [setEditingPromo])

    const handleUpdateConstraintRange = useCallback((type, id, field, value) => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const ranges = base[type] || []

            const updated = ranges.map(r =>
                r.id === id ? { ...r, [field]: value } : r
            )

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: updated,
                },
            }
        })
    }, [setEditingPromo])

    return {
        handleAddConstraint,
        handleRemoveConstraint,
        handleUpdateConstraintRange,
    }
}