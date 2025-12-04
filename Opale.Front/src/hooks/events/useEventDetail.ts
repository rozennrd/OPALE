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
}

const buildInitialDraft = (event: CampusEvent): EventDraft => {
    const anyEvent = event as any

    return {
        id: event.id,
        name: event.name,
        location: event.location,
        type: event.type,
        source: event.source,
        startDate: anyEvent.startDate ?? event.date ?? '',
        endDate: anyEvent.endDate ?? event.date ?? '',
        description: anyEvent.description ?? '',
    }
}

export const useEventDetail = (event: CampusEvent) => {
    const [draft, setDraft] = useState<EventDraft>(() => buildInitialDraft(event))
    const [snapshot, setSnapshot] = useState<EventDraft>(() =>
        buildInitialDraft(event),
    )
    const [hasChanges, setHasChanges] = useState(false)

    // Reset complet quand on change d’événement
    useEffect(() => {
        const initial = buildInitialDraft(event)
        setDraft(initial)
        setSnapshot(initial)
        setHasChanges(false)
    }, [event])

    // Détection des changements par rapport au snapshot
    useEffect(() => {
        const current = JSON.stringify(draft)
        const base = JSON.stringify(snapshot)
        setHasChanges(current !== base)
    }, [draft, snapshot])

    const updateField = <K extends keyof EventDraft>(
        field: K,
        value: EventDraft[K],
    ) => {
        setDraft((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSave = () => {
        console.log('[EVENTS] Enregistrer les données événement (mock)')
        console.log({
            originalEvent: event,
            updatedEvent: draft,
        })

        setSnapshot(draft)
        setHasChanges(false)
    }

    return {
        draft,
        hasChanges,
        updateField,
        handleSave,
    }
}