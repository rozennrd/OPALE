// src/hooks/promotions/usePromotionConstraints.ts
import { useCallback } from 'react'
import { Constraints, DateRange } from '../../models'
import { uid } from '../../utils/promoUtils'
import { EditingPromotion } from './usePromotionEditing'
import {eventsApi} from "../../services/api/eventsApi.ts";
import {constraintEventTypes} from "../../constants/constraintEventTypes.ts";
import { eventsApi } from '../../services/api/eventsApi'
import { EventType } from '../../models/EventTypes'
import {BackendPromotion} from "../../services/api/promotionsApi.ts";
import {Event} from '../../models/Event.ts'
type ConstraintType = keyof Constraints

export const createEmptyConstraints = (): Constraints => ({
    vacances: [],
    entreprise: [],
    stages: [],
    international: [],
    partiels: [],
    rattrapages: [],
})

// @ts-ignore
export function usePromotionConstraints(
    editingPromo: EditingPromotion | null,
    setEditingPromo: React.Dispatch<React.SetStateAction<EditingPromotion | null>>
) {
    const eventToConstraintMap: Partial<Record<EventType, keyof Constraints>> = {
        'Fermeture': 'vacances',
        'Entreprise': 'entreprise',
        'Stage': 'stages',
        'Mobilite': 'international',
        'Examen': 'partiels',
        'Rattrapage': 'rattrapages'
    }

    const handleAddConstraint = useCallback((type: ConstraintType): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const list = base[type] || []

            const newRange = {
                id: uid(`ctr-${type}`),
                start: '',
                end: '',
            }

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: [...list, newRange],
                },
            }
        })
    }, [setEditingPromo])

    const handleRemoveConstraint = useCallback((type: ConstraintType, id: string): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const list = base[type] || []

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: list.filter((r: DateRange) => r.id !== id),
                },
            }
        })
    }, [setEditingPromo])

    const handleUpdateConstraintRange = useCallback((type: ConstraintType, id: string, field: string, value: string): void => {
        setEditingPromo(prev => {
            if (!prev) return prev
            const base = prev.constraints || createEmptyConstraints()
            const ranges = base[type] || []

            const updated = ranges.map((r: DateRange) =>
                r.id === id ? { ...r, [field]: value } : r
            )

            return {
                ...prev,
                constraints: {
                    ...base,
                    [type]: updated,
                },
            }
        })
    }, [setEditingPromo])

    const convertEventsToConstraints(events :Event[] ) {

        const constraints: Constraints = createEmptyConstraints()
        // Process each event type
        for (const eventType of constraintEventTypes) {
            const constraintType = eventToConstraintMap[eventType]
            if (constraintType) {
                constraints[constraintType] = events.map(event => ({
                    id: event.id,
                    start: event.datetime_start,
                    end: event.datetime_end
                }))
            }
        }
        return constraints

    }

    /**
     * Fetch events for a promotion and convert them to constraints format
     */
    const fetchEventsAsConstraints = async (promoId: string): Promise<Constraints> => {
        try {
            // Define the event types we want to fetch for constraints

            const response = await eventsApi.getEventPromo(promoId, constraintEventTypes)

            if (!response.data) {
                return createEmptyConstraints()
            }
            return convertEventsToConstraints(response.data)
        } catch (error) {
            console.error('Error fetching events as constraints:', error)
            return createEmptyConstraints()
        }
    }

    return {
        handleAddConstraint,
        handleRemoveConstraint,
        handleUpdateConstraintRange,
        convertEventsToConstraints,
        fetchEventsAsConstraints
    }
}