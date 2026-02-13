// hooks/promotions/usePromotionEditing.ts
import { useState, useEffect } from 'react'
import { Constraints, Cycle, GroupSpecialtyItem } from '../../models'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'
import { usePromotionSync } from './usePromotionSync'
import { usePromotionConstraints } from "./usePromotionConstraints"
import { transformBackendPromotionToFrontend } from '../../services/api/promotionsApiTransformers'

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

    /**
     * Detect changes between editing state and saved snapshot
     * Uses structuredClone comparison for better performance than JSON.stringify
     */
    useEffect(() => {
        if (!editingPromo || !savedSnapshot) {
            setHasChanges(false)
            return
        }

        // Deep equality check using JSON (can be replaced with a deep equality lib if needed)
        const hasActualChanges = JSON.stringify(editingPromo) !== JSON.stringify(savedSnapshot)
        setHasChanges(hasActualChanges)
    }, [editingPromo, savedSnapshot])

    /**
     * Opens promotion for editing by fetching fresh data from backend
     * Uses backend as single source of truth instead of mixing with cycles state
     */
    const openEditPromotion = async (cycleId: string, promoId: string): Promise<void> => {
        setIsLoading(true)

        try {
            // Fetch full details from backend (single source of truth)
            const { promotion, events } = await fetchPromotionDetails(promoId)

            // Transform backend data to frontend format
            const frontendPromo = transformBackendPromotionToFrontend(promotion)
            const eventsAsConstraints = convertEventsToConstraints(events)

            // Create editing state from fresh backend data
            const normalized: EditingPromotion = {
                cycleId, // Only metadata we need from cycles
                promoId: promotion!.id,
                name: frontendPromo.label || '',
                students: frontendPromo.students ?? 0,
                startDate: frontendPromo.startDate || '',
                endDate: frontendPromo.endDate || '',
                groups: frontendPromo.groups || [],
                specialties: frontendPromo.specialties || [],
                constraints: {
                    ...createEmptyConstraints(),
                    ...eventsAsConstraints,
                },
            }

            // Save both editing state and snapshot
            setEditingPromo(normalized)
            setSavedSnapshot(structuredClone(normalized)) // Better than JSON parse/stringify
            setHasChanges(false)
            console.log("promotion reloaded successfully")
        } catch (error) {
            console.error('Error opening promotion:', error)
            // TODO: Show error to user via toast/notification
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

    /**
     * Adds a new group and redistributes students evenly
     */
    const addGroup = (): void => {
        if (!editingPromo) return

        const newGroup: GroupSpecialtyItem = {
            idPromo: `new-group-${newGroupCounter}`,
            nom: `Groupe ${editingPromo.groups.length + 1}`,
            effectifs: 0,
        }

        setNewGroupCounter(prev => prev + 1)

        // Distribute students evenly across all groups
        const distributedGroups = distributeEvenly(
            editingPromo.students,
            [...editingPromo.groups, newGroup]
        )

        setEditingPromo(prev =>
            prev ? { ...prev, groups: distributedGroups } : prev
        )
    }

    /**
     * Removes a group at the specified index
     */
    const removeGroup = (index: number): void => {
        if (!editingPromo) return

        const updatedGroups = editingPromo.groups.filter((_, i) => i !== index)

        setEditingPromo(prev =>
            prev ? { ...prev, groups: updatedGroups } : prev
        )
    }

    /**
     * Updates a specific field in a group
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

        setEditingPromo(prev =>
            prev ? { ...prev, groups: updatedGroups } : prev
        )
    }

    const markFormAsUntouched = () => {
        setSavedSnapshot(editingPromo)
        setHasChanges(false)
    }

    return {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        markFormAsUntouched,
        addGroup,
        removeGroup,
        handleGroupChange,
        hasChanges,
        isLoading,
    }
}