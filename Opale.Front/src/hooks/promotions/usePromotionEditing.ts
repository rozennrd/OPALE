// src/hooks/promotions/usePromotionEditing.ts
import { useState } from 'react'
import { Cycle, GroupSpecialtyItem, Constraints } from '../../models'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'

export interface EditingPromotion {
    cycleId: string
    promoId: string
    name: string
    students: number
    startDate: string
    endDate: string
    groups: GroupSpecialtyItem[]
    specialties: GroupSpecialtyItem[]
    constraints: Constraints
}

export function usePromotionEditing(
    cycles: Cycle[],
    setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>
) {
    const [editingPromo, setEditingPromo] = useState<EditingPromotion | null>(null)

    // ✅ snapshot initial pour détecter les changements
    const [initialPromo, setInitialPromo] = useState<EditingPromotion | null>(null)

    const normalizeList = (
        rawList: GroupSpecialtyItem[] | undefined,
        prefix: string
    ): GroupSpecialtyItem[] =>
        (rawList || []).map(item =>
            typeof item === 'string'
                ? { id: `${prefix}-${item}`, name: item, students: 0 }
                : {
                    id: item.id || `${prefix}-${item.name || 'item'}`,
                    name: item.name || '',
                    students: item.students ?? 0,
                }
        )

    const openEditPromotion = (cycleId: string, promoId: string): void => {
        const cycle = cycles.find(c => c.id === cycleId)
        const promo = cycle?.promotions.find(p => p.id === promoId)
        if (!cycle || !promo) return

        const draft: EditingPromotion = {
            cycleId,
            promoId,
            name: promo.label || '',
            students: promo.students ?? 0,
            startDate: promo.startDate || '',
            endDate: promo.endDate || '',
            groups: normalizeList(promo.groups, 'grp'),
            specialties: normalizeList(promo.specialties, 'spec'),
            constraints: {
                ...createEmptyConstraints(),
                ...(promo.constraints || {}),
            },
        }

        setEditingPromo(draft)
        // ✅ snapshot initial pour comparaison ultérieure
        setInitialPromo(draft)
    }

    const closeEditPromotion = (): void => {
        setEditingPromo(null)
        setInitialPromo(null)
    }

    const handleEditFieldChange = (field: string, value: any): void => {
        setEditingPromo(prev => (prev ? { ...prev, [field]: value } : prev))
    }

    /**
     * Sauvegarde de la promotion
     */
    const handleSavePromotion = (): void => {
        if (!editingPromo) return

        setCycles(prev =>
            prev.map(c => {
                if (c.id !== editingPromo.cycleId) return c
                return {
                    ...c,
                    promotions: c.promotions.map(p => {
                        if (p.id !== editingPromo.promoId) return p
                        const updated = {
                            ...p,
                            label: editingPromo.name,
                            students: Number(editingPromo.students) || 0,
                            startDate: editingPromo.startDate,
                            endDate: editingPromo.endDate,
                            groups: editingPromo.groups || [],
                            specialties: editingPromo.specialties || [],
                            constraints:
                                editingPromo.constraints || createEmptyConstraints(),
                        }
                        console.log('[PROMO] updated', updated)
                        return updated
                    }),
                }
            })
        )

        setEditingPromo(null)
        setInitialPromo(null)
    }

    // Groupes
    const addGroup = (): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const current = prev.groups || []
            const next = [
                ...current,
                {
                    id: `grp-${current.length + 1}`,
                    name: `Groupe ${current.length + 1}`,
                    students: 0,
                },
            ]
            const distributed = distributeEvenly(prev.students, next)
            console.log('[GROUPS] add', distributed)
            return { ...prev, groups: distributed }
        })
    }

    const removeGroup = (index: number): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const groups = prev.groups.filter((_, i) => i !== index)
            return { ...prev, groups }
        })
    }

    const handleGroupChange = (index: number, field: string, value: any): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const groups = prev.groups.map((g, i) =>
                i === index
                    ? {
                        ...g,
                        [field]: field === 'students' ? (Number(value) || 0) : value,
                    }
                    : g
            )
            return { ...prev, groups }
        })
    }

    // Spécialités
    const addSpecialty = (): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const current = prev.specialties || []
            const next = [
                ...current,
                {
                    id: `spec-${current.length + 1}`,
                    name: `Spécialité ${current.length + 1}`,
                    students: 0,
                },
            ]
            const distributed = distributeEvenly(prev.students, next)
            console.log('[SPECIALTIES] add', distributed)
            return { ...prev, specialties: distributed }
        })
    }

    const removeSpecialty = (index: number): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const specialties = prev.specialties.filter((_, i) => i !== index)
            return { ...prev, specialties }
        })
    }

    const handleSpecialtyChange = (index: number, field: string, value: any): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const specialties = prev.specialties.map((s, i) =>
                i === index
                    ? {
                        ...s,
                        [field]: field === 'students' ? (Number(value) || 0) : value,
                    }
                    : s
            )
            return { ...prev, specialties }
        })
    }

    // 🔍 comparaison simple via JSON (suffisant ici)
    const hasChanges =
        editingPromo && initialPromo
            ? JSON.stringify(editingPromo) !== JSON.stringify(initialPromo)
            : false

    return {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        handleSavePromotion,
        addGroup,
        removeGroup,
        handleGroupChange,
        addSpecialty,
        removeSpecialty,
        handleSpecialtyChange,
        // ✅ exposer pour la modale
        hasChanges,
    }
}