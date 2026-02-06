// src/hooks/promotions/usePromotionEditing.ts
import { useEffect, useState } from 'react'
import { Cycle, GroupSpecialtyItem, Constraints } from '../../models'
import { distributeEvenly } from '../../utils/promoUtils'
import { createEmptyConstraints } from './usePromotionConstraints'
import { promotionsApi } from '../../services/api/promotionsApi'
import { GroupsApi } from '../../services/api/groupsApi'

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
    const groupsApi = new GroupsApi()

    // snapshot "dernière sauvegarde"
    const [savedSnapshot, setSavedSnapshot] = useState<EditingPromotion | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    
    // Track new groups that need to be created on save
    const [newGroupCounter, setNewGroupCounter] = useState(0)

    const normalizeList = (
        rawList: GroupSpecialtyItem[] | undefined,
        prefix: string
    ): GroupSpecialtyItem[] =>
        (rawList || []).map(item =>
            typeof item === 'string'
                ? { idPromo: `${prefix}-${item}`, name: item, students: 0 }
                : {
                    idPromo: item.idPromo, // Use backend ID directly for existing groups
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
            promoId: promo.id,
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

    // recalcul de hasChanges par rapport au snapshot
    useEffect(() => {
        if (!editingPromo || !savedSnapshot) {
            setHasChanges(false)
            return
        }

        const current = JSON.stringify(editingPromo)
        const base = JSON.stringify(savedSnapshot)

        setHasChanges(current !== base)
    }, [editingPromo, savedSnapshot])

    const handleEditFieldChange = (field: string, value: string | number): void => {
        setEditingPromo(prev => (prev ? { ...prev, [field]: field === 'students' ? Number(value) || 0 : value } : prev))
    }

    /**
     * Sauvegarde de la promotion :
     * - Identifie les nouveaux groupes à créer
     * - Identifie les groupes modifiés à mettre à jour
     * - Appelle les APIs backend dans l'ordre approprié
     * - Met à jour cycles localement si succès
     * - NE FERME PLUS la modale (l'utilisateur choisit ensuite de fermer)
     */
    const handleSavePromotion = async (): Promise<void> => {
        if (!editingPromo) return

        try {
            // 1. Identifier les nouveaux groupes (avec ID temporaire) et les groupes modifiés
            const newGroups = editingPromo.groups.filter(g => 
                typeof g.idPromo === 'string' && g.idPromo.startsWith('new-group-')
            )
            
            const existingGroups = editingPromo.groups.filter(g => 
                typeof g.idPromo === 'number' || (typeof g.idPromo === 'string' && !g.idPromo.startsWith('new-group-'))
            )

            // 2. Créer les nouveaux groupes
            const createdGroups: GroupSpecialtyItem[] = []
            for (const newGroup of newGroups) {
                const groupData = {
                    id_promo: editingPromo.promoId,
                    nom: newGroup.name,
                    effectifs: newGroup.students
                }
                
                const response = await groupsApi.addGroup(groupData)
                if (response.data && response.data.insertedId) {
                    createdGroups.push({
                        idPromo: response.data.insertedId.toString(),
                        name: newGroup.name,
                        students: newGroup.students
                    })
                }
            }

            // 3. Mettre à jour les groupes existants modifiés
            for (const existingGroup of existingGroups) {
                const groupData = {
                    id: existingGroup.idPromo.toString(),
                    id_promo: editingPromo.promoId,
                    nom: existingGroup.name,
                    effectifs: existingGroup.students
                }
                
                await groupsApi.updateGroup(groupData)
            }

            // 4. Mettre à jour la promotion avec la liste complète des groupes
            // Use the current groups from editingPromo, not the filtered originals
            const currentGroups = editingPromo.groups
            const allGroups = currentGroups.map(g => {
                // If it's a new group that was just created, use the created version with real ID
                const createdGroup = createdGroups.find(cg => cg.name === g.name && cg.students === g.students)
                return createdGroup || g
            })
            
            await promotionsApi.updatePromotion({
                id: editingPromo.promoId,
                nom: editingPromo.name,
                effectifs: editingPromo.students,
                date_start: editingPromo.startDate,
                date_end: editingPromo.endDate,
            })

            // 5. Mettre à jour l'état local
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
                                groups: allGroups,
                                specialties: editingPromo.specialties || [],
                                constraints: editingPromo.constraints || createEmptyConstraints(),
                            }
                            console.log('[PROMO] updated', updated)
                            return updated
                        }),
                    }
                })
            )

            // 6. Mettre à jour le snapshot et hasChanges
            const updatedEditingPromo = {
                ...editingPromo,
                groups: allGroups
            }
            setEditingPromo(updatedEditingPromo)
            setSavedSnapshot(updatedEditingPromo)
            setHasChanges(false)
        } catch (error) {
            console.error('Error saving promotion:', error)
            throw error // Re-throw to let caller handle
        }
    }

    // Ajouter un groupe localement (sans appel backend)
    const addGroup = (): void => {
        if (!editingPromo) return
        
        const newGroupId = `new-group-${newGroupCounter}`
        setNewGroupCounter(prev => prev + 1)
        
        const newGroup: GroupSpecialtyItem = {
            idPromo: newGroupId,
            name: `Groupe ${editingPromo.groups.length + 1}`,
            students: 0,
        }

        // Ajouter le nouveau groupe et redistribuer les étudiants uniformément
        const currentGroups = editingPromo.groups || []
        const allGroups = [...currentGroups, newGroup]
        const distributedGroups = distributeEvenly(editingPromo.students, allGroups)

        setEditingPromo(prev => prev ? { ...prev, groups: distributedGroups } : prev)
    }

    const removeGroup = async (index: number): Promise<void> => {
        if (!editingPromo) return

        try {
            const groups = editingPromo.groups
            const groupToRemove = groups[index]
            
            if (!groupToRemove) return

            // Check if this is a new group (temporary ID) or existing group
            if (typeof groupToRemove.idPromo === 'string' && groupToRemove.idPromo.startsWith('new-group-')) {
                // This is a new group, just remove it locally
                const updatedGroups = groups.filter((_, i) => i !== index)
                setEditingPromo(prev => prev ? { ...prev, groups: updatedGroups } : prev)
            } else {
                // This is an existing group from backend, call the API
                await groupsApi.deleteGroup(parseInt(groupToRemove.idPromo.toString()))
                
                // Update local state
                const updatedGroups = groups.filter((_, i) => i !== index)
                setEditingPromo(prev => prev ? { ...prev, groups: updatedGroups } : prev)
            }
        } catch (error) {
            console.error('Error removing group:', error)
        }
    }

    const handleGroupChange = async (index: number, field: string, value: string | number): Promise<void> => {
        if (!editingPromo) return

        try {
            const groups = editingPromo.groups.map((g, i) =>
                i === index
                    ? {
                        ...g,
                        [field]: field === 'students' ? (Number(value) || 0) : value,
                    }
                    : g
            )

            // Update local state
            setEditingPromo(prev => prev ? { ...prev, groups } : prev)

            // Only call backend API for existing groups (not new groups with temporary IDs)
            const groupToUpdate = groups[index]
            if (groupToUpdate && typeof groupToUpdate.idPromo === 'string' && !groupToUpdate.idPromo.startsWith('new-group-')) {
                const groupData = {
                    id: groupToUpdate.idPromo,
                    id_promo: editingPromo.promoId,
                    nom: groupToUpdate.name,
                    effectifs: groupToUpdate.students
                }
                
                await groupsApi.updateGroup(groupData)
                console.log('[GROUPS] updated in backend', groupData)
            }
        } catch (error) {
            console.error('Error updating group:', error)
        }
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
        hasChanges, // 👈 important pour PromoEditDialog
    }
}
