// usePromotionSync.ts
import {GroupSpecialtyItem} from "../../models";
import {GroupsApi} from "../../services/api/groupsApi.ts";
import {promotionsApi} from "../../services/api/promotionsApi.ts";
import {EditingPromotion} from "./usePromotionEditing.ts";
import {eventsApi} from "../../services/api/eventsApi.ts";
import {constraintEventTypes} from "../../constants/constraintEventTypes.ts";
// usePromotionSync.ts
export const usePromotionSync = () => {
    const fetchPromotionDetails = async (promoId: string) => {
        const [promoResponse, eventsResponse] = await Promise.all([
            promotionsApi.getPromotionById(promoId),
            eventsApi.getEventPromo(promoId, constraintEventTypes)
        ])

        return {
            promotion: promoResponse.data,
            events: eventsResponse.data || []
        }
    }

    const syncGroups = async (
        promoId: string,
        groups: GroupSpecialtyItem[]
    ): Promise<GroupSpecialtyItem[]> => {
        const groupsApi = new GroupsApi()

        const newGroups = groups.filter(g =>
            g.idPromo.startsWith('new-group-')
        )

        const existingGroups = groups.filter(g =>
            !g.idPromo.startsWith('new-group-')
        )

        try {
            // Create new groups
            const createdGroups = await Promise.all(
                newGroups.map(async (group) => {
                    try {
                        const response = await groupsApi.addGroup({
                            id_promo: promoId,
                            nom: group.name,
                            effectifs: group.students

                        })
                        return {
                            id: response.data!.insertedId.toString(),
                            idPromo: promoId,
                            name: group.name,
                            students: group.students
                        }
                    } catch (e) {
                        console.log(e)
                    }

                })
            )

            // Update existing groups
            await Promise.all(
                existingGroups.map(group =>
                    groupsApi.updateGroup({
                        id: group.idPromo.toString(),
                        id_promo: promoId,
                        nom: group.name,
                        effectifs: group.students
                    })
                )
            )

            console.log(createdGroups)
            // Return merged groups with real IDs
            return groups.map(g => {
                // If it's a new group that was just created, use the created version with real ID
                const createdGroup = createdGroups.find(cg => cg.name === g.name && cg.students === g.students)
                return createdGroup || g
            })
        } catch (error) {
            console.error('Error syncing groups:', error)
            throw error // Re-throw to let caller handle
        }

    }

    const savePromotion = async (promo: EditingPromotion): Promise<EditingPromotion> => {
        const syncedGroups = await syncGroups(promo.promoId, promo.groups)

        await promotionsApi.updatePromotion({
            id: promo.promoId,
            nom: promo.name,
            effectifs: promo.students,
            date_start: promo.startDate,
            date_end: promo.endDate,
        })

        return {
            ...promo,
            groups: syncedGroups
        }
    }

    return { savePromotion, fetchPromotionDetails }
}