// hooks/promotions/usePromotionSync.ts
import { GroupSpecialtyItem, Constraints, DateRange } from "../../models"
import { Event } from "../../models/Event"
import { GroupsApi } from "../../services/api/groupsApi.ts"
import { SpecialtiesApi } from "../../services/api/specialtiesApi.ts"
import { promotionsApi } from "../../services/api/promotionsApi.ts"
import { EditingPromotion } from "./usePromotionEditing.ts"
import { eventsApi } from "../../services/api/eventsApi.ts"
import { constraintEventTypes } from "../../constants/constraintEventTypes.ts"
import { EventType } from "../../models/EventTypes.ts"

interface GroupSyncResult {
    tempId: string
    id: string
    idPromo: string
    nom: string
    effectifs: number
}

interface SpecialtySyncResult {
    tempId: string
    id: string
    idPromo: string
    nom: string
    effectifs: number
}

// Map constraint types to event types
const constraintToEventTypeMap: Record<string, EventType> = {
    vacances: 'Fermeture',
    entreprise: 'Entreprise',
    stages: 'Stage',
    international: 'Mobilite',
    partiels: 'Examen',
    rattrapages: 'Rattrapage'
}

// Map event types to constraint types
const eventTypeToConstraintMap: Partial<Record<EventType, keyof Constraints>> = {
    'Fermeture': 'vacances',
    'Entreprise': 'entreprise',
    'Stage': 'stages',
    'Mobilite': 'international',
    'Examen': 'partiels',
    'Rattrapage': 'rattrapages'
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

            // Flatten the Record<string, Event[]> to Event[]
            const eventsData = eventsResponse.data || {}
            const flattenedEvents: Event[] = Object.values(eventsData).flat()

            return {
                promotion: promoResponse.data,
                events: flattenedEvents
            }
        } catch (error) {
            console.error('Error fetching promotion details:', error)
            throw new Error('Failed to load promotion details')
        }
    }

    /**
     * Converts constraints to Event objects for API
     */
    const constraintsToEvents = (
        constraints: Constraints,
        promoId: string
    ): Array<Omit<Event, 'id'> & { id?: string }> => {
        const events: Array<Omit<Event, 'id'> & { id?: string }> = []

        Object.entries(constraints).forEach(([constraintType, dateRanges]) => {
            const eventType = constraintToEventTypeMap[constraintType]
            if (!eventType) return

            dateRanges.forEach((range: DateRange) => {
                events.push({
                    id: range.id?.startsWith('ctr-') ? undefined : range.id,
                    type: eventType,
                    nom: `${eventType} - ${range.start} to ${range.end}`,
                    datetime_start: `${range.start}T00:00:00`,
                    datetime_end: `${range.end}T23:59:59`,
                    show_macro: true,
                    show_micro: true,
                    is_blocking: false,
                    is_exceptional: false,
                    is_external: false
                })
            })
        })

        return events
    }

    /**
     * Syncs events with backend - creates new events, updates existing, deletes removed
     */
    const syncEvents = async (
        promoId: string,
        currentConstraints: Constraints,
        originalEvents: Event[]
    ): Promise<void> => {
        try {
            const currentEvents = constraintsToEvents(currentConstraints, promoId)

            // Separate new and existing events
            const newEvents = currentEvents.filter(e => !e.id)
            const updatedEvents = currentEvents.filter(e => e.id)

            // Find deleted events (in original but not in current)
            const currentEventIds = new Set(updatedEvents.map(e => e.id))
            const deletedEvents = originalEvents.filter(oe => !currentEventIds.has(oe.id))

            // Create new events
            if (newEvents.length > 0) {
                console.log(`Creating ${newEvents.length} new events`)
                for (const newEvent of newEvents) {
                    await eventsApi.createEvent(newEvent)
                }
            }

            // Update existing events
            for (const event of updatedEvents) {
                const originalEvent = originalEvents.find(oe => oe.id === event.id)
                if (originalEvent && (
                    originalEvent.datetime_start !== event.datetime_start ||
                    originalEvent.datetime_end !== event.datetime_end ||
                    originalEvent.nom !== event.nom
                )) {
                    console.log(`Updating event ${event.id}`)
                    await eventsApi.updateEvent(event as Event)
                }
            }

            // Delete removed events
            for (const event of deletedEvents) {
                console.log(`Deleting event ${event.id}`)
                await eventsApi.deleteEvent(event.id)
            }

        } catch (error) {
            console.error('Error syncing events:', error)
            throw new Error('Failed to sync events with backend')
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
                        tempId: group.idPromo,
                        id: response.data.insertedId.toString(),
                        idPromo: promoId,
                        nom: group.nom,
                        effectifs: group.effectifs
                    }
                } catch (error) {
                    console.error(`Failed to create group "${group.nom}":`, error)
                    return null
                }
            })

            const createdGroupsResults = await Promise.all(createdGroupsPromises)
            const createdGroups = createdGroupsResults.filter((g): g is GroupSyncResult => g !== null)

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
                    }
                })
            )

            // Map groups to their created versions
            return groups.map(g => {
                if (g.idPromo.startsWith('new-group-')) {
                    const created = createdGroups.find(cg => cg.tempId === g.idPromo)
                    if (created) {
                        return {
                            id: created.id,
                            idPromo: created.idPromo,
                            nom: created.nom,
                            effectifs: created.effectifs
                        }
                    }
                    return g
                }
                return g
            })
        } catch (error) {
            console.error('Error syncing groups:', error)
            throw new Error('Failed to sync groups with backend')
        }
    }

    /**
     * Syncs specialties with backend - creates new specialties and updates existing ones
     * Returns specialties with real IDs from backend
     */
    const syncSpecialties = async (
        promoId: string,
        specialties: GroupSpecialtyItem[]
    ): Promise<GroupSpecialtyItem[]> => {
        const specialtiesApi = new SpecialtiesApi()

        const newSpecialties = specialties.filter(s => s.idPromo.startsWith('new-specialty-'))
        const existingSpecialties = specialties.filter(s => !s.idPromo.startsWith('new-specialty-'))

        try {
            // Create new specialties with proper error handling
            const createdSpecialtiesPromises = newSpecialties.map(async (specialty): Promise<SpecialtySyncResult | null> => {
                try {
                    const response = await specialtiesApi.addSpecialty({
                        id_promo: promoId,
                        id_groupe: null, // Not linked to a group for now
                        nom: specialty.nom,
                        effectifs: specialty.effectifs
                    })

                    if (!response.data?.insertedId) {
                        throw new Error('No insertedId returned from backend')
                    }

                    return {
                        tempId: specialty.idPromo,
                        id: response.data.insertedId.toString(),
                        idPromo: promoId,
                        nom: specialty.nom,
                        effectifs: specialty.effectifs
                    }
                } catch (error) {
                    console.error(`Failed to create specialty "${specialty.nom}":`, error)
                    return null
                }
            })

            const createdSpecialtiesResults = await Promise.all(createdSpecialtiesPromises)
            const createdSpecialties = createdSpecialtiesResults.filter((s): s is SpecialtySyncResult => s !== null)

            if (createdSpecialties.length !== newSpecialties.length) {
                console.warn(`${newSpecialties.length - createdSpecialties.length} specialty(s) failed to create`)
            }

            // Update existing specialties
            await Promise.all(
                existingSpecialties.map(async (specialty) => {
                    try {
                        await specialtiesApi.updateSpecialty({
                            id: specialty.id!.toString(),
                            id_promo: promoId,
                            id_groupe: null,
                            nom: specialty.nom,
                            effectifs: specialty.effectifs
                        })
                    } catch (error) {
                        console.error(`Failed to update specialty "${specialty.nom}":`, error)
                    }
                })
            )

            // Map specialties to their created versions
            return specialties.map(s => {
                if (s.idPromo.startsWith('new-specialty-')) {
                    const created = createdSpecialties.find(cs => cs.tempId === s.idPromo)
                    if (created) {
                        return {
                            id: created.id,
                            idPromo: created.idPromo,
                            nom: created.nom,
                            effectifs: created.effectifs
                        }
                    }
                    return s
                }
                return s
            })
        } catch (error) {
            console.error('Error syncing specialties:', error)
            throw new Error('Failed to sync specialties with backend')
        }
    }

    /**
     * Saves promotion data to backend, including syncing groups, specialties and events
     * Returns updated promotion with real IDs
     */
    const savePromotion = async (
        promo: EditingPromotion,
        originalEvents: Event[] = []
    ): Promise<EditingPromotion> => {
        try {
            // Sync groups
            const syncedGroups = await syncGroups(promo.promoId, promo.groups)

            // Sync specialties
            const syncedSpecialties = await syncSpecialties(promo.promoId, promo.specialties)

            // Sync events (constraints)
            await syncEvents(promo.promoId, promo.constraints, originalEvents)

            // Update promotion metadata
            await promotionsApi.updatePromotion({
                id: promo.promoId,
                nom: promo.name,
                effectifs: promo.students,
                date_start: promo.startDate,
                date_end: promo.endDate,
            })

            // Return promotion with synced data
            return {
                ...promo,
                groups: syncedGroups,
                specialties: syncedSpecialties
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
