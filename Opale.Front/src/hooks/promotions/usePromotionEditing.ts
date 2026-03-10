// hooks/promotions/usePromotionEditing.ts
import { useState, useEffect } from 'react'
import {Constraints, Cycle, GroupSpecialtyItem} from '../../models'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'
import { usePromotionSync } from './usePromotionSync'
import { usePromotionConstraints } from "./usePromotionConstraints"
import { transformBackendPromotionToFrontend } from '../../services/api/promotionsApiTransformers'
import { Event } from '../../models/Event'

export interface EditingPromotion {
    cycleId: string
    promoId: string
    name: string
    students: number
    isApprentissage: boolean
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
    const [newSpecialtyCounter, setNewSpecialtyCounter] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [removedGroupIds, setRemovedGroupIds] = useState<string[]>([])
    const [removedSpecialtyIds, setRemovedSpecialtyIds] = useState<string[]>([])
    const [originalEvents, setOriginalEvents] = useState<Event[]>([])

    const { fetchPromotionDetails } = usePromotionSync()
    const { convertEventsToConstraints } = usePromotionConstraints(editingPromo, setEditingPromo)

    /**
     * Detect changes between editing state and saved snapshot
     */
    useEffect(() => {
        if (!editingPromo || !savedSnapshot) {
            setHasChanges(false)
            return
        }
        const hasActualChanges = JSON.stringify(editingPromo) !== JSON.stringify(savedSnapshot)
        setHasChanges(hasActualChanges)
    }, [editingPromo, savedSnapshot])

    /**
     * Opens promotion for editing by fetching fresh data from backend
     */
    const openEditPromotion = async (cycleId: string, promoId: string): Promise<void> => {
        setIsLoading(true)
        try {
            const { promotion, events } = await fetchPromotionDetails(promoId)
            if (!promotion) {
                throw new Error('Promotion not found')
            }
            const frontendPromo = transformBackendPromotionToFrontend(promotion)
            const eventsAsConstraints = convertEventsToConstraints(events)

            const normalized: EditingPromotion = {
                cycleId,
                promoId: promotion.id,
                name: frontendPromo.label || '',
                students: frontendPromo.students ?? 0,
                startDate: frontendPromo.startDate || '',
                endDate: frontendPromo.endDate || '',
                isApprentissage: frontendPromo.isApprentissage,
                groups: frontendPromo.groups || [],
                specialties: frontendPromo.specialties || [],
                constraints: {
                    ...createEmptyConstraints(),
                    ...eventsAsConstraints,
                },
            }

            setEditingPromo(normalized)
            setSavedSnapshot(structuredClone(normalized))
            setHasChanges(false)
            setRemovedGroupIds([])
            setRemovedSpecialtyIds([])
            setOriginalEvents(events)
        } catch (error) {
            console.error('Error opening promotion:', error)
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Closes the editing dialog and resets state
     */
    const closeEditPromotion = (): void => {
        setEditingPromo(null)
        setSavedSnapshot(null)
        setHasChanges(false)
        setRemovedGroupIds([])
        setRemovedSpecialtyIds([])
    }

    /**
     * Updates a field in the editing promotion
     */
    const handleEditFieldChange = (field: string, value: string | number): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            return {
                ...prev,
                [field]: field === 'students' ? Number(value) || 0 : value
            }
        })
    }

    // ============ GROUP FUNCTIONS ============

    /**
     * Adds a new group
     */
    const addGroup = (): void => {
        if (!editingPromo) return

        const newGroup: GroupSpecialtyItem = {
            idPromo: `new-group-${newGroupCounter}`,
            nom: `Groupe ${editingPromo.groups.length + 1}`,
            effectifs: 0,
        }

        setNewGroupCounter(prev => prev + 1)

        const distributedGroups = distributeEvenly(
            editingPromo.students,
            [...editingPromo.groups, newGroup]
        )

        setEditingPromo(prev =>
            prev ? { ...prev, groups: distributedGroups } : prev
        )
    }

    /**
     * Removes a group
     */
    const removeGroup = (index: number): void => {
        if (!editingPromo) return
        const groupToRemove = editingPromo.groups[index]
        if (groupToRemove?.id) {
            setRemovedGroupIds(prev =>
                prev.includes(String(groupToRemove.id)) ? prev : [...prev, String(groupToRemove.id)]
            )
        }
        const updatedGroups = editingPromo.groups.filter((_, i) => i !== index)
        setEditingPromo(prev => prev ? { ...prev, groups: updatedGroups } : prev)
    }

    /**
     * Updates a group field
     */
    const handleGroupChange = (index: number, field: string, value: string | number): void => {
        if (!editingPromo) return

        const updatedGroups = editingPromo.groups.map((g, i) => {
            if (i !== index) return g
            return {
                ...g,
                [field]: field === 'effectifs' ? (Number(value) || 0) : value
            }
        })

        setEditingPromo(prev => prev ? { ...prev, groups: updatedGroups } : prev)
    }

    // ============ SPECIALTY FUNCTIONS ============

    /**
     * Adds a new specialty
     */
    const addSpecialty = (): void => {
        if (!editingPromo) return

        const newSpecialty: GroupSpecialtyItem = {
            idPromo: `new-specialty-${newSpecialtyCounter}`,
            nom: `Spécialité ${editingPromo.specialties.length + 1}`,
            effectifs: 0,
        }

        setNewSpecialtyCounter(prev => prev + 1)

        setEditingPromo(prev =>
            prev ? { ...prev, specialties: [...prev.specialties, newSpecialty] } : prev
        )
    }

    /**
     * Removes a specialty
     */
    const removeSpecialty = (index: number): void => {
        if (!editingPromo) return
        const specialtyToRemove = editingPromo.specialties[index]
        if (specialtyToRemove?.id) {
            setRemovedSpecialtyIds(prev =>
                prev.includes(String(specialtyToRemove.id)) ? prev : [...prev, String(specialtyToRemove.id)]
            )
        }
        const updatedSpecialties = editingPromo.specialties.filter((_, i) => i !== index)
        setEditingPromo(prev => prev ? { ...prev, specialties: updatedSpecialties } : prev)
    }

    /**
     * Updates a specialty field
     */
    const handleSpecialtyChange = (index: number, field: string, value: string | number): void => {
        if (!editingPromo) return

        const updatedSpecialties = editingPromo.specialties.map((s, i) => {
            if (i !== index) return s
            return {
                ...s,
                [field]: field === 'effectifs' ? (Number(value) || 0) : value
            }
        })

        setEditingPromo(prev => prev ? { ...prev, specialties: updatedSpecialties } : prev)
    }

    const markFormAsUntouched = (updatedPromo: EditingPromotion) => {
        setEditingPromo(updatedPromo)
        setSavedSnapshot(updatedPromo)
        setHasChanges(false)
        setRemovedGroupIds([])
        setRemovedSpecialtyIds([])
        setOriginalEvents([])
    }

    return {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        markFormAsUntouched,
        // Groups
        addGroup,
        removeGroup,
        handleGroupChange,
        // Specialties
        addSpecialty,
        removeSpecialty,
        handleSpecialtyChange,
        hasChanges,
        isLoading,
        removedGroupIds,
        removedSpecialtyIds,
        originalEvents,
    }
}