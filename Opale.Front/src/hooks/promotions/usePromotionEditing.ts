// hooks/promotions/usePromotionEditing.ts
import { useState, useEffect } from 'react'
import {Constraints, Cycle, GroupSpecialtyItem} from '../../models'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'
import { usePromotionSync } from './usePromotionSync'
import {usePromotionConstraints} from "./usePromotionConstraints";

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

export function usePromotionEditing(cycles: Cycle[]) {
    const [editingPromo, setEditingPromo] = useState<EditingPromotion | null>(null)
    const [savedSnapshot, setSavedSnapshot] = useState<EditingPromotion | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [newGroupCounter, setNewGroupCounter] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const { fetchPromotionDetails } = usePromotionSync()
    const { convertEventsToConstraints } = usePromotionConstraints(editingPromo, setEditingPromo)

    // Detect changes
    useEffect(() => {
        if (!editingPromo || !savedSnapshot) {
            setHasChanges(false)
            return
        }
        setHasChanges(JSON.stringify(editingPromo) !== JSON.stringify(savedSnapshot))
    }, [editingPromo, savedSnapshot])

    const openEditPromotion = async (cycleId: string, promoId: string): Promise<void> => {
        const cycle = cycles.find(c => c.id === cycleId)
        const promo = cycle?.promotions.find(p => p.id === promoId)
        if (!cycle || !promo) return

        setIsLoading(true)

        try {
            // Fetch full details from backend
            const { promotion, events } = await fetchPromotionDetails(promoId)
            const eventsAsConstraints = convertEventsToConstraints(events)

            const normalized: EditingPromotion = {
                cycleId,
                promoId: promo.id,
                name: promo.label || '',
                students: promo.students ?? 0,
                startDate: promo.startDate || '',
                endDate: promo.endDate || '',
                groups: promotion?.groups || promo.groups || [],
                specialties: promotion?.specialties || promo.specialties || [],
                constraints: {
                    ...createEmptyConstraints(),
                    ...eventsAsConstraints,
                    ...(promo.constraints || {}),
                },
            }

            setEditingPromo(normalized)
            setSavedSnapshot(normalized)
            setHasChanges(false)
        } catch (error) {
            console.error('Error opening promotion:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const closeEditPromotion = (): void => {
        setEditingPromo(null)
        setSavedSnapshot(null)
        setHasChanges(false)
    }

    const handleEditFieldChange = (field: string, value: string | number): void => {
        setEditingPromo(prev =>
            prev ? {
                ...prev,
                [field]: field === 'students' ? Number(value) || 0 : value
            } : prev
        )
    }

    const addGroup = (): void => {
        if (!editingPromo) return

        const newGroup: GroupSpecialtyItem = {
            idPromo: `new-group-${newGroupCounter}`,
            name: `Groupe ${editingPromo.groups.length + 1}`,
            students: 0,
        }

        setNewGroupCounter(prev => prev + 1)

        const distributedGroups = distributeEvenly(
            editingPromo.students,
            [...editingPromo.groups, newGroup]
        )

        setEditingPromo(prev => prev ? { ...prev, groups: distributedGroups } : prev)
    }

    const removeGroup = (index: number): void => {
        if (!editingPromo) return
        const updatedGroups = editingPromo.groups.filter((_, i) => i !== index)
        setEditingPromo(prev => prev ? { ...prev, groups: updatedGroups } : prev)
    }

    const handleGroupChange = (index: number, field: string, value: string | number): void => {
        if (!editingPromo) return

        const groups = editingPromo.groups.map((g, i) =>
            i === index
                ? { ...g, [field]: field === 'students' ? (Number(value) || 0) : value }
                : g
        )

        setEditingPromo(prev => prev ? { ...prev, groups } : prev)
    }

    return {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        addGroup,
        removeGroup,
        handleGroupChange,
        hasChanges,
        isLoading,
    }
}