import { useEffect, useMemo, useState } from 'react'
import { CampusEvent, EventSource, EventType } from '../../models/CampusEvent'

export type EventDraft = {
    id: string
    name: string
    location: string
    type: EventType
    source: EventSource
    startDate: string
    endDate: string
    num_semaine?: number
    description: string
    show_macro: boolean
    show_micro: boolean
    concernedCycleIds: string[]
    concernedPromotionIds: string[]
    selectedSalleIds: string[]
    is_blocking: boolean
    is_exceptional: boolean
    is_external: boolean
}

type SaveResult =
    | { success: true; error?: undefined }
    | { success: false; error: string }

const buildInitialDraft = (event: CampusEvent): EventDraft => {
    const startDate = event.startDate ?? ''
    const endDate = event.endDate ?? startDate

    return {
        id: event.id,
        name: event.name ?? '',
        location: event.location ?? '',
        type: event.type,
        source: event.source,
        startDate,
        endDate,
        num_semaine: event.num_semaine ?? (startDate ? getWeekNumber(startDate) : undefined),
        description: event.description ?? '',
        show_macro: event.show_macro ?? true,
        show_micro: event.show_micro ?? false,
        concernedCycleIds: [...(event.concernedCycleIds ?? [])],
        concernedPromotionIds: [...(event.concernedPromotionIds ?? [])],
        selectedSalleIds: [],
        is_blocking: event.is_blocking ?? true,
        is_exceptional: event.is_exceptional ?? false,
        is_external: event.show_macro ?? false,
    }
}

function getWeekNumber(isoDatetime: string): number | undefined {
    const d = new Date(isoDatetime)
    if (Number.isNaN(d.getTime())) return undefined

    // ISO 8601: semaine commence lundi, semaine 1 = celle avec le 1er jeudi
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayOfWeek = date.getUTCDay() || 7 // dimanche = 7
    date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export const useEventDetail = (
    event: CampusEvent,
    onSave: (
        event: Partial<CampusEvent>,
        salleIds: string[],
    ) => Promise<{ success: boolean; error?: string }>,
) => {
    const [draft, setDraft] = useState<EventDraft>(() => buildInitialDraft(event))
    const [snapshot, setSnapshot] = useState<EventDraft>(() =>
        buildInitialDraft(event),
    )
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)

    const normalizeForCompare = (value: EventDraft) => {
        const { selectedSalleIds, ...rest } = value
        return rest
    }

    useEffect(() => {
        const initial = buildInitialDraft(event)
        setSnapshot(initial)
        setDraft((prev) => (prev.id === event.id ? prev : initial))
        setHasChanges(false)
        console.log('built initial draft for event ' + event)
    }, [event])

    useEffect(() => {
        const current = JSON.stringify(normalizeForCompare(draft))
        const base = JSON.stringify(normalizeForCompare(snapshot))
        setHasChanges(current !== base)

    }, [draft, snapshot])

    const updateField = <K extends keyof EventDraft>(
        field: K,
        value: EventDraft[K],
    ) => {
        setDraft((prev) => {
            if (field === 'source' && value === 'EXTERNE') {
                return {
                    ...prev,
                    source: value,
                    concernedCycleIds: [],
                    concernedPromotionIds: [],
                }
            }

            if (field === 'startDate' && typeof value === 'string') {
                return {
                    ...prev,
                    startDate: value,
                    num_semaine: value ? getWeekNumber(value) : undefined,
                } as EventDraft
            }

            return {
                ...prev,
                [field]: value,
            }
        })
    }

    const updateFields = (patch: Partial<EventDraft>) => {
        setDraft((prev) => ({
            ...prev,
            ...patch,
        }))
    }

    const toggleSalle = (salleId: string) => {
        setDraft((prev) => ({
            ...prev,
            selectedSalleIds: prev.selectedSalleIds.includes(salleId)
                ? prev.selectedSalleIds.filter((id) => id !== salleId)
                : [...prev.selectedSalleIds, salleId],
        }))
    }

    const commitDraft = (): EventDraft => {
        const saved: EventDraft = {
            ...draft,
            concernedCycleIds: [...draft.concernedCycleIds],
            concernedPromotionIds: [...draft.concernedPromotionIds],
            selectedSalleIds: [...draft.selectedSalleIds],
        }

        setSnapshot(saved)
        setHasChanges(false)
        return saved
    }

    const payloadForSave = useMemo((): Partial<CampusEvent> => {
        return {
            id: draft.id,
            name: draft.name,
            location: draft.location,
            startDate: draft.startDate,
            endDate: draft.endDate,
            num_semaine: draft.num_semaine,
            type: draft.type,
            source: draft.source,
            description: draft.description,
            show_macro: draft.show_macro,
            show_micro: draft.show_micro,
            concernedCycleIds: [...draft.concernedCycleIds],
            concernedPromotionIds: [...draft.concernedPromotionIds],
        }
    }, [draft])

    const handleSave= async (): Promise<SaveResult> => {

        setSaving(true)

        const result = await onSave(payloadForSave, draft.selectedSalleIds)

        setSaving(false)

        if (result.success) {
            commitDraft()
            return { success: true }
        }

        return { success: false, error: result.error ?? 'Erreur inconnue.' }
    }

    return {
        draft,
        hasChanges,
        saving,
        updateField,
        updateFields,
        toggleSalle,
        commitDraft,
        handleSave,

    }
}
