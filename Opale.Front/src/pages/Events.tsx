// src/pages/Events.tsx
import React, { useMemo, useState } from 'react'
import EventsToolbar, {
    TargetFilter,
    TypeFilter,
} from '../components/events/EventsToolbar'
import EventCard from '../components/events/EventCard'
import EventDetailCard from '../components/events/EventDetailCard'
import {
    JUNIA_EVENTS_MOCK,
    EXTERNAL_EVENTS_MOCK,
} from '../mocks/events.mock'
import { CampusEvent } from '../models/CampusEvent'
import SectionHeader from '../components/common/SectionHeader'
import SelectionToolbar from '../components/common/SelectionToolbar'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'

const ALL_EVENTS = [...JUNIA_EVENTS_MOCK, ...EXTERNAL_EVENTS_MOCK]
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

export default function Events() {
    const [events, setEvents] = useState<CampusEvent[]>(() => [...ALL_EVENTS])

    const [searchValue, setSearchValue] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [target, setTarget] = useState<TargetFilter>('ALL')
    const [type, setType] = useState<TypeFilter>('ALL')

    const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
    const [detailMode, setDetailMode] = useState<'edit' | 'create'>('edit')
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})

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
                new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        if (searchValue.trim()) {
            const q = searchValue.trim().toLowerCase()
            items = items.filter(
                (evt) =>
                    evt.name.toLowerCase().includes(q) ||
                    evt.location.toLowerCase().includes(q),
            )
        }

        if (dateFrom) {
            const min = new Date(dateFrom).getTime()
            items = items.filter(
                (evt) => new Date(evt.date).getTime() >= min,
            )
        }

        if (dateTo) {
            const max = new Date(dateTo).getTime()
            items = items.filter(
                (evt) => new Date(evt.date).getTime() <= max,
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
        const groups: {
            key: string
            label: string
            events: CampusEvent[]
        }[] = []
        const byKey = new Map<
            string,
            { key: string; label: string; events: CampusEvent[] }
        >()

        for (const evt of filteredEvents) {
            const key = getMonthKey(evt.date)
            const label = getMonthLabel(evt.date)

            if (!byKey.has(key)) {
                const group = { key, label, events: [] as CampusEvent[] }
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
        const newEvent = {
            id: 'new-event',
            name: '',
            date: new Date().toISOString().slice(0, 10),
            location: '',
            type: 'AUTRE',
            source: 'JUNIA',
        } as CampusEvent

        setDetailMode('create')
        setSelectedEvent(newEvent)
        console.log('[EVENTS] Open create event form', newEvent)
    }

    const handleDeleteSingleEvent = (eventId: string) => {
        removeEventsByIds([eventId])
        setDetailMode('edit')
    }

    const handleDeleteSelected = () => {
        removeEventsByIds(selectedEventIds)
        disableEventSelectionMode()
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
                                    const isOpen =
                                        openMonths[group.key] ?? true

                                    return (
                                        <section
                                            key={group.key}
                                            className="events-month-group"
                                        >
                                            <SectionHeader
                                                title={group.label}
                                                isOpen={isOpen}
                                                onToggle={() =>
                                                    toggleMonth(group.key)
                                                }
                                                wrapperClassName="events-month-header"
                                            />

                                            {isOpen && (
                                                <div className="events-month-group-cards">
                                                    {group.events.map(
                                                        (event) => (
                                                            <EventCard
                                                                key={event.id}
                                                                event={event}
                                                                onSelect={
                                                                    handleSelectEvent
                                                                }
                                                                selectionMode={selectionMode}
                                                                selected={selectedEventIdsSet.has(event.id)}
                                                                onToggleSelect={toggleEventSelection}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="events-empty-state">
                                Aucun evenement ne correspond aux filtres selectionnes.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <EventDetailCard
                    event={selectedEvent}
                    mode={detailMode}
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
