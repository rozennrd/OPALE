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
import SectionHeader from '../components/common/SectionHeader' // si tu l’utilises pour les mois

const ALL_EVENTS = [...JUNIA_EVENTS_MOCK, ...EXTERNAL_EVENTS_MOCK]

// helpers getMonthKey / getMonthLabel que tu as déjà ou qu’on avait ajoutés
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
    const [searchValue, setSearchValue] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [target, setTarget] = useState<TargetFilter>('ALL')
    const [type, setType] = useState<TypeFilter>('ALL')

    const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
    const [detailMode, setDetailMode] = useState<'edit' | 'create'>('edit')
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})

    const filteredEvents = useMemo(() => {
        let items = [...ALL_EVENTS]

        // tri chronologique
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
    }, [searchValue, dateFrom, dateTo, target, type])

    // Regroupement par mois (comme on l’a déjà fait)
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

    // clic sur le bouton "+"
    const handleCreateRequested = () => {
        const todayIso = new Date().toISOString().slice(0, 10)

        const newEvent: CampusEvent = {
            id: 'new-event',
            name: '',
            startDate: '',
            endDate: '',
            location: '',
            type: 'AUTRE',
            source: 'JUNIA',
            description: '',
        }

        setDetailMode('create')
        setSelectedEvent(newEvent)
        console.log('[EVENTS] Open create event form', newEvent)
    }

    const handleCloseDetail = () => {
        setSelectedEvent(null)
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
                    />

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
                                Aucun événement ne correspond aux filtres
                                sélectionnés.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail card (vue / création / édition) */}
            {selectedEvent && (
                <EventDetailCard
                    event={selectedEvent}
                    mode={detailMode}
                    onClose={() => {
                        setSelectedEvent(null)
                        setDetailMode('edit')
                    }}
                />
            )}
        </>
    )
}