import { useEffect, useState } from 'react'
import { CampusEvent, EventType } from '../../models/CampusEvent'

type EventDraft = {
    id: string
    name: string
    location: string
    type: EventType
    source: 'JUNIA' | 'EXTERNE'
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
    return {
        id: event.id,
        name: event.name,
        location: event.location,
        type: event.type,
        source: event.source,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description ?? '',
        num_semaine: event.num_semaine ?? getWeekNumber(event.startDate),
        show_macro: event.show_macro ?? true,
        show_micro: event.show_micro ?? true,
        is_blocking: event.is_blocking ?? false,
        is_exceptional: event.is_exceptional ?? true,
        is_external: event.is_external ?? false,
        selectedSalleIds: []
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

            return updated
        })
    }

    const toggleSalle = (salleId: string) => {
        setDraft(prev => ({
            ...prev,
            selectedSalleIds: prev.selectedSalleIds.includes(salleId)
                ? prev.selectedSalleIds.filter((id) => id !== salleId)
                : [...prev.selectedSalleIds, salleId],
        }))
    }

    const handleSave = async () => {
        if (!onSave) {
            console.log('[EVENTS] Enregistrer les données événement (mock)')
            console.log({ originalEvent: event, updatedEvent: draft })
            setSnapshot(draft)
            setHasChanges(false)
            return { success: true }
        }

        setSaving(true)

        const eventData: Partial<CampusEvent> = {
            id: draft.id,
            name: draft.name,
            startDate: draft.startDate,
            endDate: draft.endDate,
            type: draft.type,
            source: draft.source,
            description: draft.description,
            num_semaine: draft.num_semaine,
            show_macro: draft.show_macro,
            show_micro: draft.show_micro,
            is_blocking: draft.is_blocking,
            is_exceptional: draft.is_exceptional,
            is_external: draft.is_external || draft.source === 'EXTERNE',
        }

        const result = await onSave(eventData, draft.selectedSalleIds)
        setSaving(false)

        if (result.success) {
            setSnapshot(draft)
            setHasChanges(false)
        }

        return result
    }

    return {
        draft,
        hasChanges,
        saving,
        updateField,
        toggleSalle,
        handleSave,
    }
}