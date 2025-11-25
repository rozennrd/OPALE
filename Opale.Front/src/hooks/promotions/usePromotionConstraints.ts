// src/hooks/promotions/usePromotionConstraints.ts
import { useCallback } from 'react'
import { Constraints, DateRange } from '../../models'
import { uid } from '../../utils/promoUtils'
import { EditingPromotion } from './usePromotionEditing'

type ConstraintType = keyof Constraints

export const createEmptyConstraints = (): Constraints => ({
    vacances: [],
    entreprise: [],
    stages: [],
    international: [],
    partiels: [],
    rattrapages: [],
})

export function usePromotionConstraints(
    editingPromo: EditingPromotion | null,
    setEditingPromo: React.Dispatch<React.SetStateAction<EditingPromotion | null>>
) {
    const handleAddConstraint = useCallback((type: ConstraintType): void => {
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

    const handleRemoveConstraint = useCallback((type: ConstraintType, id: string): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const list = base[type] || []

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: list.filter((r: DateRange) => r.id !== id),
                },
            }
        })
    }, [setEditingPromo])

    const handleUpdateConstraintRange = useCallback((type: ConstraintType, id: string, field: string, value: string): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const ranges = base[type] || []

            const updated = ranges.map((r: DateRange) =>
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
