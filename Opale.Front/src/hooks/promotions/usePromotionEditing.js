// src/hooks/promotions/usePromotionEditing.js
import { useState } from 'react'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'

export function usePromotionEditing(cycles, setCycles) {
    const [editingPromo, setEditingPromo] = useState(null)

    const normalizeList = (rawList, prefix) =>
        (rawList || []).map(item =>
            typeof item === 'string'
                ? { id: `${prefix}-${item}`, name: item, students: 0 }
                : {
                    id: item.id || `${prefix}-${item.name || 'item'}`,
                    name: item.name || '',
                    students: item.students ?? 0,
                }
        )

    const openEditPromotion = (cycleId, promoId) => {
        const cycle = cycles.find(c => c.id === cycleId)
        const promo = cycle?.promotions.find(p => p.id === promoId)
        if (!cycle || !promo) return

        setEditingPromo({
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
        })
    }

    const closeEditPromotion = () => setEditingPromo(null)

    const handleEditFieldChange = (field, value) => {
        setEditingPromo(prev => (prev ? { ...prev, [field]: value } : prev))
    }

    const handleSavePromotion = (event) => {
        event.preventDefault()
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
                            constraints: editingPromo.constraints || createEmptyConstraints(),
                        }
                        console.log('[PROMO] updated', updated)
                        return updated
                    }),
                }
            })
        )

        setEditingPromo(null)
    }

    // Groupes
    const addGroup = () => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const current = prev.groups || []
            const next = [...current, {
                id: `grp-${current.length + 1}`,
                name: `Groupe ${current.length + 1}`,
                students: 0,
            }]
            const distributed = distributeEvenly(prev.students, next)
            console.log('[GROUPS] add', distributed)
            return { ...prev, groups: distributed }
        })
    }

    const removeGroup = (index) => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const groups = prev.groups.filter((_, i) => i !== index)
            return { ...prev, groups }
        })
    }

    const handleGroupChange = (index, field, value) => {
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
    const addSpecialty = () => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const current = prev.specialties || []
            const next = [...current, {
                id: `spec-${current.length + 1}`,
                name: `Spécialité ${current.length + 1}`,
                students: 0,
            }]
            const distributed = distributeEvenly(prev.students, next)
            console.log('[SPECIALTIES] add', distributed)
            return { ...prev, specialties: distributed }
        })
    }

    const removeSpecialty = (index) => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const specialties = prev.specialties.filter((_, i) => i !== index)
            return { ...prev, specialties }
        })
    }

    const handleSpecialtyChange = (index, field, value) => {
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
    }
}