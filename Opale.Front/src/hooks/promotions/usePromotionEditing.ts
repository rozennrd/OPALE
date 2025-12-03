// src/hooks/promotions/usePromotionEditing.ts
import { useEffect, useState } from 'react'
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

    // ✅ snapshot "dernière sauvegarde"
    const [savedSnapshot, setSavedSnapshot] = useState<EditingPromotion | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

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

        const normalized: EditingPromotion = {
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

        setEditingPromo(normalized)
        setSavedSnapshot(normalized)
        setHasChanges(false)
    }

    const closeEditPromotion = (): void => {
        setEditingPromo(null)
        setSavedSnapshot(null)
        setHasChanges(false)
    }

    // ✅ recalcul de hasChanges par rapport au snapshot
    useEffect(() => {
        if (!editingPromo || !savedSnapshot) {
            setHasChanges(false)
            return
        }

        const current = JSON.stringify(editingPromo)
        const base = JSON.stringify(savedSnapshot)

        setHasChanges(current !== base)
    }, [editingPromo, savedSnapshot])

    const handleEditFieldChange = (field: string, value: any): void => {
        setEditingPromo(prev => (prev ? { ...prev, [field]: value } : prev))
    }

    /**
     * Sauvegarde de la promotion :
     * - Met à jour cycles
     * - NE FERME PLUS la modale (l'utilisateur choisit ensuite de fermer)
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

        // ✅ après sauvegarde, on met à jour le snapshot et on remet hasChanges à false
        setSavedSnapshot(editingPromo)
        setHasChanges(false)
    }

    // Groupes / spécialités : inchangé
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
        hasChanges, // 👈 important pour PromoEditDialog
    }
}