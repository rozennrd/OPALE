import { useEffect, useState } from 'react'
import { CampusEvent, EventSource, EventType } from '../../models/CampusEvent'

export type EventDraft = {
    id: string
    name: string
    location: string
    type: EventType
    source: EventSource
    startDate: string
    endDate: string
    description: string
    num_semaine?: number
    show_macro: boolean
    show_micro: boolean
    is_blocking: boolean
    is_exceptional: boolean
    is_external: boolean
    selectedSalleIds: string[]
    concernedCycleIds: string[]
    concernedPromotionIds: string[]
}

function getWeekNumber(isoDatetime: string): number | undefined {
    const d = new Date(isoDatetime)
    if (Number.isNaN(d.getTime())) return undefined

    // Algorithme ISO 8601 : semaine commence le lundi
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayOfWeek = date.getUTCDay() || 7 // dimanche = 7
    date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const buildInitialDraft = (event: CampusEvent): EventDraft => {
    const fallbackDate = event.startDate ?? event.date ?? ''
    
    return {
        id: event.id,
        name: event.name ?? '',
        location: event.location ?? '',
        type: event.type,
        source: event.source,
        startDate: event.startDate ?? fallbackDate,
        endDate: event.endDate ?? event.date ?? fallbackDate,
        description: event.description ?? '',
        num_semaine: event.num_semaine ?? getWeekNumber(event.startDate),
        show_macro: event.show_macro ?? true,
        show_micro: event.show_micro ?? true,
        is_blocking: event.is_blocking ?? false,
        is_exceptional: event.is_exceptional ?? true,
        is_external: event.is_external ?? false,
        selectedSalleIds: [],
        concernedCycleIds: [...(event.concernedCycleIds ?? [])],
        concernedPromotionIds: [...(event.concernedPromotionIds ?? [])],
    }
}

export const useEventDetail = (
    event: CampusEvent,
    onSave?: (event: Partial<CampusEvent>, salleIds: string[]) => Promise<{ success: boolean; error?: string }>
) => {
    const [draft, setDraft] = useState<EventDraft>(() => buildInitialDraft(event))
    const [snapshot, setSnapshot] = useState<EventDraft>(() => buildInitialDraft(event))
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const initial = buildInitialDraft(event)
        setSnapshot(initial)
        setDraft((prev) => (prev.id === event.id ? prev : initial))
        setHasChanges(false)
    }, [event])

    useEffect(() => {
        const current = JSON.stringify(draft)
        const base = JSON.stringify(snapshot)
        setHasChanges(current !== base)
    }, [draft, snapshot])

    const updateField = <K extends keyof EventDraft>(
        field: K,
        value: EventDraft[K],
    ) => {
        setDraft((prev) => {
            const updated = { ...prev, [field]: value }

            // Recalcule automatiquement le numéro de semaine quand startDate change
            if (field === 'startDate' && typeof value === 'string') {
                updated.num_semaine = getWeekNumber(value)
            }
          
            if (field === 'source' && value === 'EXTERNE') {
                return {
                    updated.concernedCycleIds = []
                    updated.concernedPromotionIds = []
                }
            }

            return updated
        })
    }

    /* const toggleSalle = (salleId: string) => {
        setDraft(prev => ({
            ...prev,
            selectedSalleIds: prev.selectedSalleIds.includes(salleId)
                ? prev.selectedSalleIds.filter((id) => id !== salleId)
                : [...prev.selectedSalleIds, salleId],
        }))
    } */

    const updateFields = (patch: Partial<EventDraft>) => {
        setDraft((prev) => ({
            ...prev,
            ...patch,
        }))
    }

    const handleSave = async () => {
        const savedDraft = {
            ...draft,
            concernedCycleIds: [...draft.concernedCycleIds],
            concernedPromotionIds: [...draft.concernedPromotionIds],
        }
        
        if (!onSave) {
            setSnapshot(savedDraft)
            setHasChanges(false)
            return { success: true }
        }

        setSaving(true)

        const eventData: Partial<CampusEvent> = {
            id: savedDraft.id,
            name: savedDraft.name,
            startDate: savedDraft.startDate,
            endDate: savedDraft.endDate,
            type: savedDraft.type,
            source: savedDraft.source,
            description: savedDraft.description,
            num_semaine: savedDraft.num_semaine,
            show_macro: savedDraft.show_macro,
            show_micro: savedDraft.show_micro,
            is_blocking: savedDraft.is_blocking,
            is_exceptional: savedDraft.is_exceptional,
            is_external: savedDraft.is_external || savedDraft.source === 'EXTERNE',
            concernedCycleIds: savedDraft.concernedCycleIds,
            concernedPromotionIds: savedDraft.concernedPromotionIds,
        }

        const result = await onSave(eventData, savedDraft.selectedSalleIds)
        setSaving(false)

        if (result.success) {
            setSnapshot(savedDraft)
            setHasChanges(false)
        }

        return result
    }

    return {
        draft,
        hasChanges,
        saving,
        updateField,
        // toggleSalle,
        updateFields,
        handleSave,
    }
}
