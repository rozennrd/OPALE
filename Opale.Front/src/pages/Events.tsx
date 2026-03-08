// src/pages/Events.tsx
import { useMemo, useState, useEffect, useRef } from 'react'
import EventsToolbar, {
    TargetFilter,
    TypeFilter,
} from '../components/events/EventsToolbar'
import EventCard from '../components/events/EventCard'
import EventDetailCard from '../components/events/EventDetailCard'
import { eventsApi } from '../services/api/eventsApi'
import { localisationsApi, Localisation } from '../services/api/localisationsApi'
import { sallesApi, Salle } from '../services/api/sallesApi'
import { CampusEvent } from '../models/CampusEvent'
import { Event } from '../models/Event'
import SectionHeader from '../components/common/SectionHeader'
import { useEvents } from '../hooks/events/useEvent'
import SelectionToolbar from '../components/common/SelectionToolbar'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'
import { usePromotionCycles } from '../hooks/promotions/usePromotionCycles'
import {EventType} from "../models/EventTypes.ts";

interface MonthGroup {
    key: string
    label: string
    events: CampusEvent[]
}
type SaveResult =
    | { success: true; error?: undefined }
    | { success: false; error: string }


// Mapper pour convertir Event (backend) en CampusEvent (frontend)
function mapEventToCampusEvent(event: Event, location = ''): CampusEvent {
    // Keep full ISO datetime for datetime-local input compatibility
    const startDate = event.datetime_start || ''
    const endDate = event.datetime_end || startDate

    return {
        id: event.id,
        name: event.nom,
        startDate: startDate,
        endDate: endDate,
        location,
        source: event.is_external ? 'EXTERNE' as const : 'JUNIA' as const,
        type: event.type,
        concernedPromotionIds: [...(event.concerne?.promotions ?? [])],
        concernedCycleIds: [],
    }
}

export const eventPageTypes: EventType[] = [
    'Forum',
    'JPO',
    'Salon',
    'Examen',
    'Conference',
    'Autre',
]

function buildLocationFromEvent(
    eventId: string,
    localisations: Localisation[],
    salles: Salle[],
): string {
    const eventSalles = localisations
        .filter((loc) => loc.id_event === eventId)
        .map((loc) => salles.find((salle) => salle.id === loc.id_salle))
        .filter((salle): salle is Salle => Boolean(salle))

    return Array.from(
        new Set(eventSalles.map((salle) => salle.nom_complet ?? salle.nom)),
    ).join(', ')
}

const DEFAULT_EVENT_FILTERS: {
    searchValue: string
    dateFrom: string
    dateTo: string
    target: TargetFilter
    type: TypeFilter
} = {
    searchValue: '',
    dateFrom: '',
    dateTo: '',
    target: 'ALL',
    type: 'ALL',
}

function getMonthKey(dateStr: string): string {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(dateStr: string): string {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const label = d.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    })
    return label.charAt(0).toUpperCase() + label.slice(1)
}

const parseDateParts = (value: string): { y: number; m: number; d: number } | null => {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return { y, m, d }
}

const getStartOfDay = (value: string): number | null => {
    const parts = parseDateParts(value)
    if (!parts) return null
    return new Date(parts.y, parts.m - 1, parts.d, 0, 0, 0, 0).getTime()
}

const getEndOfDay = (value: string): number | null => {
    const parts = parseDateParts(value)
    if (!parts) return null
    return new Date(parts.y, parts.m - 1, parts.d, 23, 59, 59, 999).getTime()
}


/**
 * Assure qu'on a toujours startDate/endDate exploitables côté liste.
 * (utile si certains retours API ont un champ optionnel ou vide)
 */
const normalizeEventForList = (event: CampusEvent): CampusEvent => {
    const startDate = event.startDate ?? ''
    const endDate = event.endDate ?? startDate

    return {
        ...event,
        startDate,
        endDate,
        // champs optionnels éventuels : on garde ce que le modèle expose
        show_macro: event.show_macro ?? true,
        show_micro: event.show_micro ?? false,
        concernedCycleIds: [...(event.concernedCycleIds ?? [])],
        concernedPromotionIds: [...(event.concernedPromotionIds ?? [])],
    }
}

export default function Events() {
    const {
        salles,
        createEvent,
        updateEvent,
        deleteEvents,
    } = useEvents()

    const [eventsState, setEventsState] = useState<CampusEvent[]>([])
    const hasLocalEditsRef = useRef(false)


    const [searchValue, setSearchValue] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [target, setTarget] = useState<TargetFilter>('ALL')
    const [type, setType] = useState<TypeFilter>('ALL')

    const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
    const [detailMode, setDetailMode] = useState<'edit' | 'create'>('edit')
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})

    // State pour les événements depuis l'API
    const [events, setEvents] = useState<CampusEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        if (!hasLocalEditsRef.current) {
            setEventsState((events ?? []).map(normalizeEventForList))
        }
    }, [events])
    // Charger les événements au montage du composant
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                const [eventsResponse, localisationsResponse, sallesResponse] =
                    await Promise.all([
                        eventsApi.getEventsMacro(),
                        localisationsApi.getAllLocalisations(),
                        sallesApi.getAllSalles(),
                    ])

                if (eventsResponse.data) {
                    const localisations = localisationsResponse.data ?? []
                    const allSalles = sallesResponse.data ?? []

                    // Mapper les événements du backend vers CampusEvent
                    const mappedEvents = eventsResponse.data
                        .map((event) =>
                            mapEventToCampusEvent(
                                event,
                                buildLocationFromEvent(
                                    event.id,
                                    localisations,
                                    allSalles,
                                ),
                            ),
                        )
                        .filter((e) => eventPageTypes.includes(e.type))
                    setEvents(mappedEvents)
                }
            } catch (err) {
                console.error('Erreur lors du chargement des événements:', err)
                setError('Erreur lors du chargement des événements')
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const { cycles: promotionCycles } = usePromotionCycles()

    const {
        selectionMode,
        selectedIds: selectedEventIds,
        selectedIdsSet: selectedEventIdsSet,
        selectedCount: selectedEventCount,
        toggleSelectionMode: toggleEventSelectionMode,
        toggleSelection: toggleEventSelection,
        selectAll: selectAllEvents,
        clearSelection: clearEventSelection,
        disableSelectionMode: disableEventSelectionMode,
        pruneSelection: pruneEventSelection,
    } = useSelectionState({
        onEnterSelectionMode: () => {
            setSelectedEvent(null)
            setDetailMode('edit')
        },
    })

    const filteredEvents = useMemo(() => {
        let items = [...eventsState]

        items.sort(
            (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )

        if (searchValue.trim()) {
            const q = searchValue.trim().toLowerCase()
            items = items.filter(
                (evt) =>
                    evt.name.toLowerCase().includes(q) ||
                    evt.description?.toLowerCase().includes(q),
            )
        }

        if (dateFrom) {
            const min = getStartOfDay(dateFrom)
            if (min !== null) {
                items = items.filter(
                    (evt) => new Date(evt.startDate).getTime() >= min,
                )
            }
        }

        if (dateTo) {
            const max = getEndOfDay(dateTo)
            if (max !== null) {
                items = items.filter(
                    (evt) => new Date(evt.startDate).getTime() <= max,
                )
            }
        }

        if (target === 'JUNIA') {
            items = items.filter((evt) => evt.source === 'JUNIA')
        } else if (target === 'EXTERNE') {
            items = items.filter((evt) => evt.source === 'EXTERNE')
        }

        if (type !== 'ALL') {
            items = items.filter((evt) => evt.type === type)
        }

        return items
    }, [eventsState, searchValue, dateFrom, dateTo, target, type])

    const { hasActiveFilters, resetFilters: handleResetFilters } =
        useToolbarFilters({
            values: { searchValue, dateFrom, dateTo, target, type },
            defaults: DEFAULT_EVENT_FILTERS,
            onReset: () => {
                setSearchValue(DEFAULT_EVENT_FILTERS.searchValue)
                setDateFrom(DEFAULT_EVENT_FILTERS.dateFrom)
                setDateTo(DEFAULT_EVENT_FILTERS.dateTo)
                setTarget(DEFAULT_EVENT_FILTERS.target)
                setType(DEFAULT_EVENT_FILTERS.type)
            },
        })

    const visibleEventIds = useMemo(
        () => filteredEvents.map((event) => event.id),
        [filteredEvents],
    )

    const monthGroups = useMemo(() => {
        const groups: MonthGroup[] = []
        const byKey = new Map<string, MonthGroup>()

        for (const evt of filteredEvents) {
            const key = getMonthKey(evt.startDate)
            const label = getMonthLabel(evt.startDate)

            if (!byKey.has(key)) {
                const group: MonthGroup = { key, label, events: [] }
                byKey.set(key, group)
                groups.push(group)
            }
            byKey.get(key)!.events.push(evt)
        }

        return groups
    }, [filteredEvents])

    const removeEventsByIds = async (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        hasLocalEditsRef.current = true

        const deleteResult = await deleteEvents(Array.from(idsSet))
        if (!deleteResult.success) {
            console.error('[EVENTS] Delete failed:', deleteResult.error)
        }

        const actuallyDeletedIds =
            'deletedIds' in deleteResult && deleteResult.deletedIds.length > 0
                ? new Set(deleteResult.deletedIds)
                : idsSet

        setEventsState((prev) =>
            prev.filter((e) => !actuallyDeletedIds.has(e.id)),
        )
        pruneEventSelection(Array.from(actuallyDeletedIds))

        setSelectedEvent((prev) => {
            if (!prev) return prev
            return actuallyDeletedIds.has(prev.id) ? null : prev
        })
    }

    const toggleMonth = (key: string) => {
        setOpenMonths((prev) => ({
            ...prev,
            [key]: !(prev[key] ?? true),
        }))
    }

    const handleSelectEvent = (evt: CampusEvent) => {
        setDetailMode('edit')
        setSelectedEvent(evt)
    }

    const handleCreateRequested = () => {
        const now = new Date()
        const start = now.toISOString()
        const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString()

        const newEvent: CampusEvent = normalizeEventForList({
            id: 'new-event',
            name: '',
            startDate: start,
            endDate: end,
            location: '',
            type: 'Autre',
            source: 'JUNIA',
            description: '',
            show_macro: true,
            show_micro: false,
            concernedCycleIds: [],
            concernedPromotionIds: [],
        })

        setDetailMode('create')
        setSelectedEvent(newEvent)
    }

    const handleSaveEvent = async (
        event: Partial<CampusEvent>,
        salleIds: string[],
    ): Promise<SaveResult> => {
        if (!selectedEvent) {
            return {
                success: false,
                error: "Aucun événement sélectionné.",
            }
        }

        const isCreate = detailMode === 'create' || event.id === 'new-event'

        hasLocalEditsRef.current = true

        const nextEvent: CampusEvent = normalizeEventForList({
            ...selectedEvent,
            ...event,
            startDate: event.startDate ?? selectedEvent.startDate,
            endDate: event.endDate ?? selectedEvent.endDate,
        })

        setEventsState((prev) => {
            if (isCreate) return [...prev, nextEvent]
            return prev.map((e) => (e.id === nextEvent.id ? nextEvent : e))
        })

        setSelectedEvent(nextEvent)
        setDetailMode('edit')

        const apiRes = isCreate
            ? await createEvent(event, salleIds)
            : await updateEvent(nextEvent.id, event, salleIds)

        const res: SaveResult = apiRes ?? {
            success: false,
            error: 'Erreur lors de la sauvegarde.',
        }

        if (!res.success) {
            console.error('[EVENTS] Save failed:', res.error)
            return res
        }

        if (isCreate && apiRes && 'insertedId' in apiRes) {
            const insertedId = (apiRes as { insertedId?: string }).insertedId
            if (!insertedId) return res

            const createdEventId = insertedId

            setEventsState((prev) =>
                prev.map((evt) =>
                    evt.id === selectedEvent.id
                        ? {
                              ...evt,
                              id: createdEventId,
                          }
                        : evt,
                ),
            )

            setSelectedEvent((prev) =>
                prev && prev.id === selectedEvent.id
                    ? {
                          ...prev,
                          id: createdEventId,
                      }
                    : prev,
            )

            setDetailMode('edit')
        }

        return res
    }

    const handleDeleteSingleEvent = async (eventId: string) => {
        await removeEventsByIds([eventId])
        setDetailMode('edit')
    }

    const handleDeleteSelected = async () => {
        await removeEventsByIds(selectedEventIds)
        disableEventSelectionMode()
    }

    if (loading) {
        return (
            <div className="page-loading">
                <p>Chargement des événements...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-error">
                <p>Erreur: {error}</p>
            </div>
        )
    }

    return (
        <>
            <h1 className="page-title">Événements</h1>
            <p className="page-sub">
                Vue consolidée des événements Junia et externes.
            </p>

            <div className="events-page">
                <div className="events-page-body">
                    <EventsToolbar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        dateFrom={dateFrom}
                        onDateFromChange={setDateFrom}
                        dateTo={dateTo}
                        onDateToChange={setDateTo}
                        target={target}
                        onTargetChange={setTarget}
                        type={type}
                        onTypeChange={setType}
                        onCreateRequested={handleCreateRequested}
                        selectionMode={selectionMode}
                        selectedCount={selectedEventCount}
                        onToggleSelectionMode={toggleEventSelectionMode}
                        onResetFilters={handleResetFilters}
                        hasActiveFilters={hasActiveFilters}
                    />

                    {selectionMode && (
                        <SelectionToolbar
                            totalCount={visibleEventIds.length}
                            selectedCount={selectedEventCount}
                            onSelectAll={() => selectAllEvents(visibleEventIds)}
                            onClearSelection={clearEventSelection}
                            onDeleteSelected={handleDeleteSelected}
                            confirmTitle="Supprimer les événements sélectionnés"
                            confirmMessage={`Vous allez supprimer ${selectedEventIds.length} événement${selectedEventIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                        />
                    )}

                    <div className="events-list-wrapper">
                        {monthGroups.length > 0 ? (
                            <div className="events-list">
                                {monthGroups.map((group) => {
                                    const isOpen = openMonths[group.key] ?? true

                                    return (
                                        <section
                                            key={group.key}
                                            className="events-month-group"
                                        >
                                            <SectionHeader
                                                title={group.label}
                                                isOpen={isOpen}
                                                onToggle={() => toggleMonth(group.key)}
                                                wrapperClassName="events-month-header"
                                            />

                                            {isOpen && (
                                                <div className="events-month-group-cards">
                                                    {group.events.map((event) => (
                                                        <EventCard
                                                            key={event.id}
                                                            event={event}
                                                            onSelect={handleSelectEvent}
                                                            selectionMode={selectionMode}
                                                            selected={selectedEventIdsSet.has(
                                                                event.id,
                                                            )}
                                                            onToggleSelect={
                                                                toggleEventSelection
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="events-empty-state">
                                Aucun événement ne correspond aux filtres
                                sélectionnés.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <EventDetailCard
                    event={selectedEvent}
                    cycles={promotionCycles}
                    salles={salles}
                    mode={detailMode}
                    onSave={handleSaveEvent}
                    onClose={() => {
                        setSelectedEvent(null)
                        setDetailMode('edit')
                    }}
                    onDelete={
                        detailMode === 'create'
                            ? undefined
                            : () => handleDeleteSingleEvent(selectedEvent.id)
                    }
                />
            )}
        </>
    )
}
