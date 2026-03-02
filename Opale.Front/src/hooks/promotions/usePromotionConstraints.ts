// src/hooks/promotions/usePromotionConstraints.ts
import { useCallback } from 'react'
import { Constraints, DateRange } from '../../models'
import { uid } from '../../utils/promoUtils'
import { EditingPromotion } from './usePromotionEditing'
import {constraintEventTypes} from "../../constants/constraintEventTypes.ts";
import { eventsApi } from '../../services/api/eventsApi'
import { EventType } from '../../models/EventTypes'
import {Event} from '../../models/Event.ts'
type ConstraintType = keyof Constraints

// ============ VALIDATION FUNCTIONS ============

/**
 * Check if a date is within the promotion period
 */
export const isDateWithinPromotionPeriod = (
    dateStr: string,
    promoStart: string,
    promoEnd: string
): boolean => {
    if (!dateStr || !promoStart || !promoEnd) return true // Allow empty dates
    
    const date = new Date(dateStr)
    const start = new Date(promoStart)
    const end = new Date(promoEnd)
    
    return date >= start && date <= end
}

/**
 * Check if a constraint date range is within the promotion period
 */
export const isConstraintWithinPromotionPeriod = (
    startDate: string,
    endDate: string,
    promoStart: string,
    promoEnd: string
): boolean => {
    if (!startDate || !endDate || !promoStart || !promoEnd) return true
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const promoStartDate = new Date(promoStart)
    const promoEndDate = new Date(promoEnd)
    
    // Both start and end must be within promotion period
    return start >= promoStartDate && start <= promoEndDate &&
           end >= promoStartDate && end <= promoEndDate
}

/**
 * Get constraint types that have dates outside the promotion period
 */
export const getOutOfPeriodConstraintTypes = (
    constraints: Constraints,
    promoStart: string,
    promoEnd: string
): ConstraintType[] => {
    if (!promoStart || !promoEnd) return []
    
    const outOfPeriod: ConstraintType[] = []
    const constraintTypes = Object.keys(constraints) as ConstraintType[]
    
    for (const type of constraintTypes) {
        const ranges = constraints[type] || []
        for (const range of ranges) {
            if (range.start && range.end) {
                if (!isConstraintWithinPromotionPeriod(range.start, range.end, promoStart, promoEnd)) {
                    if (!outOfPeriod.includes(type)) {
                        outOfPeriod.push(type)
                    }
                }
            }
        }
    }
    
    return outOfPeriod
}

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
    }, [setEditingPromo]);

    // Helper to format ISO datetime to YYYY-MM-DD for DateRange
    const formatDate = (datetime: string | Date): string => {
        if (!datetime) return ''
        const date = new Date(datetime)
        if (isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
    }

    const convertEventsToConstraints= (events :Event[] ) => {

        const constraints: Constraints = createEmptyConstraints()
        // Process each event type
        for (const eventType of constraintEventTypes) {
            const constraintType = eventToConstraintMap[eventType]
            if (constraintType) {
                // Filter events by this specific type before mapping
                const eventsOfType = events.filter(event => event.type === eventType)
                constraints[constraintType] = eventsOfType.map(event => ({
                    id: event.id,
                    start: formatDate(event.datetime_start),
                    end: formatDate(event.datetime_end)
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
            
            // Flatten the Record<string, Event[]> to Event[]
            const allEvents = Object.values(response.data).flat()
            return convertEventsToConstraints(allEvents)
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
