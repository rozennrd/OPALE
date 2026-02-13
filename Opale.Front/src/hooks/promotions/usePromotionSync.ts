// hooks/promotions/usePromotionSync.ts
import { GroupSpecialtyItem } from "../../models"
import { GroupsApi } from "../../services/api/groupsApi.ts"
import { promotionsApi } from "../../services/api/promotionsApi.ts"
import { EditingPromotion } from "./usePromotionEditing.ts"
import { eventsApi } from "../../services/api/eventsApi.ts"
import { constraintEventTypes } from "../../constants/constraintEventTypes.ts"

interface GroupSyncResult {
    tempId: string
    id: string
    idPromo: string
    nom: string
    effectifs: number
}

export const usePromotionSync = () => {
    /**
     * Fetches full promotion details and events from backend
     */
    const fetchPromotionDetails = async (promoId: string) => {
        try {
            const [promoResponse, eventsResponse] = await Promise.all([
                promotionsApi.getPromotionById(promoId),
                eventsApi.getEventPromo(promoId, constraintEventTypes)
            ])

            return {
                promotion: promoResponse.data,
                events: eventsResponse.data || []
            }
        } catch (error) {
            console.error('Error fetching promotion details:', error)
            throw new Error('Failed to load promotion details')
        }
    }

    /**
     * Syncs groups with backend - creates new groups and updates existing ones
     * Returns groups with real IDs from backend
     */
    const syncGroups = async (
        promoId: string,
        groups: GroupSpecialtyItem[]
    ): Promise<GroupSpecialtyItem[]> => {
        const groupsApi = new GroupsApi()

        const newGroups = groups.filter(g => g.idPromo.startsWith('new-group-'))
        const existingGroups = groups.filter(g => !g.idPromo.startsWith('new-group-'))

        try {
            // Create new groups with proper error handling
            const createdGroupsPromises = newGroups.map(async (group): Promise<GroupSyncResult | null> => {
                try {
                    const response = await groupsApi.addGroup({
                        id_promo: promoId,
                        nom: group.nom,
                        effectifs: group.effectifs
                    })

                    if (!response.data?.insertedId) {
                        throw new Error('No insertedId returned from backend')
                    }

                    return {
                        tempId: group.idPromo, // Keep temp ID for mapping
                        id: response.data.insertedId.toString(),
                        idPromo: promoId,
                        nom: group.nom,
                        effectifs: group.effectifs
                    }
                } catch (error) {
                    console.error(`Failed to create group "${group.nom}":`, error)
                    return null // Return null for failed creations
                }
            })

            const createdGroupsResults = await Promise.all(createdGroupsPromises)
            const createdGroups = createdGroupsResults.filter((g): g is GroupSyncResult => g !== null)

            // Check if any groups failed to create
            if (createdGroups.length !== newGroups.length) {
                console.warn(`${newGroups.length - createdGroups.length} group(s) failed to create`)
            }

            // Update existing groups
            await Promise.all(
                existingGroups.map(async (group) => {
                    try {
                        await groupsApi.updateGroup({
                            id: group.id!.toString(),
                            id_promo: promoId,
                            nom: group.nom,
                            effectifs: group.effectifs
                        })
                    } catch (error) {
                        console.error(`Failed to update group "${group.nom}":`, error)
                        // Don't throw - allow partial success
                    }
                })
            )

            // Map groups to their created versions (with real IDs) or keep original
            return groups.map(g => {
                if (g.idPromo.startsWith('new-group-')) {
                    // Find the created group by temp ID
                    const created = createdGroups.find(cg => cg.tempId === g.idPromo)
                    if (created) {
                        // Return group with real ID
                        return {
                            id: created.id,
                            idPromo: created.idPromo,
                            nom: created.nom,
                            effectifs: created.effectifs
                        }
                    }
                    // If creation failed, keep temp group (UI can handle this)
                    return g
                }
                // Return existing group as-is
                return g
            })
        } catch (error) {
            console.error('Error syncing groups:', error)
            throw new Error('Failed to sync groups with backend')
        }
    }

    /**
     * Saves promotion data to backend, including syncing groups
     * Returns updated promotion with real group IDs
     */
    const savePromotion = async (promo: EditingPromotion): Promise<EditingPromotion> => {
        try {
            // Sync groups first (creates new ones, updates existing)
            const syncedGroups = await syncGroups(promo.promoId, promo.groups)

            // Update promotion metadata
            await promotionsApi.updatePromotion({
                id: promo.promoId,
                nom: promo.name,
                effectifs: promo.students,
                date_start: promo.startDate,
                date_end: promo.endDate,
            })

            // Return promotion with synced groups
            return {
                ...promo,
                groups: syncedGroups
            }
        } catch (error) {
            console.error('Error saving promotion:', error)
            throw new Error('Failed to save promotion')
        }
    }

    return {
        savePromotion,
        fetchPromotionDetails
    }
}