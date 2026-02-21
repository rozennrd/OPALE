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
    showMacro: boolean
    showMicro: boolean
    concernedCycleIds: string[]
    concernedPromotionIds: string[]
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
        showMacro: event.showMacro ?? true,
        showMicro: event.showMicro ?? false,
        concernedCycleIds: [...(event.concernedCycleIds ?? [])],
        concernedPromotionIds: [...(event.concernedPromotionIds ?? [])],
    }
}

export const useEventDetail = (event: CampusEvent) => {
    const [draft, setDraft] = useState<EventDraft>(() => buildInitialDraft(event))
    const [snapshot, setSnapshot] = useState<EventDraft>(() =>
        buildInitialDraft(event),
    )
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        const initial = buildInitialDraft(event)
        setDraft(initial)
        setSnapshot(initial)
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
            if (field === 'source' && value === 'EXTERNE') {
                return {
                    ...prev,
                    source: value,
                    concernedCycleIds: [],
                    concernedPromotionIds: [],
                }
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

    const handleSave = (): EventDraft => {
        const saved = {
            ...draft,
            concernedCycleIds: [...draft.concernedCycleIds],
            concernedPromotionIds: [...draft.concernedPromotionIds],
        }

        setSnapshot(saved)
        setHasChanges(false)

        return saved
    }

    return {
        draft,
        hasChanges,
        updateField,
        updateFields,
        handleSave,
    }
}
