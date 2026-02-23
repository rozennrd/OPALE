// src/pages/Events.tsx
import { useMemo, useState } from 'react'
import EventsToolbar, {
    TargetFilter,
    TypeFilter,
} from '../components/events/EventsToolbar'
import EventCard from '../components/events/EventCard'
import EventDetailCard from '../components/events/EventDetailCard'
import { CampusEvent } from '../models/CampusEvent'
import SectionHeader from '../components/common/SectionHeader'
import { useEvents } from '../hooks/events/useEvent'
import SelectionToolbar from '../components/common/SelectionToolbar'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'
import { usePromotionCycles } from '../hooks/promotions/usePromotionCycles'

interface MonthGroup {
    key: string
    label: string
    events: CampusEvent[]
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

const createFrontendEventId = () =>
    `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const normalizeEventForList = (event: CampusEvent): CampusEvent => {
    const startDate = event.startDate ?? event.date ?? ''
    const endDate = event.endDate ?? startDate
    const date = startDate || endDate || event.date

    return {
        ...event,
        startDate,
        endDate,
        date,
        showMacro: event.showMacro ?? true,
        showMicro: event.showMicro ?? false,
        concernedCycleIds: [...(event.concernedCycleIds ?? [])],
        concernedPromotionIds: [...(event.concernedPromotionIds ?? [])],
    }
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

export default function Events() {
    const { events, loading, error, createEvent, updateEvent } = useEvents()

    const [searchValue, setSearchValue] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [target, setTarget] = useState<TargetFilter>('ALL')
    const [type, setType] = useState<TypeFilter>('ALL')

    const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
    const [detailMode, setDetailMode] = useState<'edit' | 'create'>('edit')
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})

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
        let items = [...events]

        items.sort(
            (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )

        if (searchValue.trim()) {
            const q = searchValue.trim().toLowerCase()
            items = items.filter(
                (evt) =>
                    evt.name.toLowerCase().includes(q) ||
                    evt.location.toLowerCase().includes(q) ||
                    evt.description?.toLowerCase().includes(q)
            )
        }

        if (dateFrom) {
            const min = new Date(dateFrom).getTime()
            items = items.filter(
                (evt) => new Date(evt.startDate).getTime() >= min,
            )
        }

        if (dateTo) {
            const max = new Date(dateTo).getTime()
            items = items.filter(
                (evt) => new Date(evt.startDate).getTime() <= max,
            )
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
    }, [events, searchValue, dateFrom, dateTo, target, type])

    const {
        hasActiveFilters,
        resetFilters: handleResetFilters,
    } = useToolbarFilters({
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

    const removeEventsByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        setEvents((prev) => prev.filter((event) => !idsSet.has(event.id)))
        pruneEventSelection(Array.from(idsSet))
        setSelectedEvent((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
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
        const today = new Date().toISOString().slice(0, 10)
        const newEvent: CampusEvent = {
            id: 'new-event',
            name: '',
            date: today,
            startDate: now.toISOString(),
            endDate: new Date(now.getTime() + 3600000).toISOString(),
            location: '',
            type: 'AUTRE',
            source: 'JUNIA',
            description: '',
            show_macro: true,
            show_micro: true,
            is_blocking: false,
            is_exceptional: true,
            is_external: false,
            concernedCycleIds: [],
            concernedPromotionIds: [],
        }

        setDetailMode('create')
        setSelectedEvent(newEvent)
    }
    
    const handleSaveEvent = async (event: Partial<CampusEvent>, salleIds: string[]) => {
        const isCreateSave = detailMode === 'create' || savedEvent.id === 'new-event'
        const previousEventId = savedEvent.id
        
        const normalized = normalizeEventForList({
            ...savedEvent,
            id: isCreateSave ? createFrontendEventId() : savedEvent.id,
        })

        if (detailMode === 'create') {
            return await createEvent(event, salleIds)
        } else {
            return await updateEvent(event.id!, event, salleIds)
        }
        
         setEvents((prev) => {
            if (isCreateSave) {
                return [...prev, normalized]
            }

            return prev.map((event) =>
                event.id === previousEventId ? normalized : event,
            )
        })

        setSelectedEvent(normalized)
        if (isCreateSave) {
            setDetailMode('edit')
        }
    }
      
    const handleDeleteSingleEvent = (eventId: string) => {
        removeEventsByIds([eventId])
        setDetailMode('edit')
    }

    const handleDeleteSelected = () => {
        removeEventsByIds(selectedEventIds)
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
            <h1 className="page-title">Evenements</h1>
            <p className="page-sub">
                Vue consolidee des evenements Junia et externes.
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
                            confirmTitle="Supprimer les evenements selectionnes"
                            confirmMessage={`Vous allez supprimer ${selectedEventIds.length} evenement${selectedEventIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
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
                                                            onSelect={
                                                                handleSelectEvent
                                                            }
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
                                Aucun événement ne correspond aux filtres sélectionnés.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <EventDetailCard
                    event={selectedEvent}
                    cycles={promotionCycles}
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
