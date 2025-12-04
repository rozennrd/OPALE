// src/pages/Events.tsx
import React, { useMemo, useState } from 'react'
import EventsToolbar, { TargetFilter, TypeFilter } from '../components/events/EventsToolbar'
import EventCard from '../components/events/EventCard'
import EventDetailCard from '../components/events/EventDetailCard'
import { CampusEvent } from '../models/CampusEvent'
import { JUNIA_EVENTS_MOCK, EXTERNAL_EVENTS_MOCK } from '../mocks/events.mock'

const ALL_EVENTS = [...JUNIA_EVENTS_MOCK, ...EXTERNAL_EVENTS_MOCK]

export default function Events() {
    const [searchValue, setSearchValue] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [target, setTarget] = useState<TargetFilter>('ALL')
    const [type, setType] = useState<TypeFilter>('ALL')
    const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)

    const filteredEvents = useMemo(() => {
        let items = [...ALL_EVENTS]

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
                    />

                    <div className="events-list-wrapper">
                        {filteredEvents.length > 0 ? (
                            <div className="events-list">
                                {filteredEvents.map((event, index) => {
                                    const currentDate = new Date(event.date)
                                    const currentMonth = currentDate.getMonth()
                                    const currentYear = currentDate.getFullYear()

                                    let showSeparator = false
                                    if (index === 0) {
                                        showSeparator = true
                                    } else {
                                        const prev = new Date(
                                            filteredEvents[index - 1].date,
                                        )
                                        const prevMonth = prev.getMonth()
                                        const prevYear = prev.getFullYear()
                                        if (
                                            prevMonth !== currentMonth ||
                                            prevYear !== currentYear
                                        ) {
                                            showSeparator = true
                                        }
                                    }

                                    const monthLabel =
                                        currentDate.toLocaleDateString('fr-FR', {
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                    const monthTitle =
                                        monthLabel.charAt(0).toUpperCase() +
                                        monthLabel.slice(1)

                                    return (
                                        <React.Fragment key={event.id}>
                                            {showSeparator && (
                                                <div className="event-month-separator">
                                                    {monthTitle}
                                                </div>
                                            )}

                                            <EventCard
                                                event={event}
                                                onSelect={setSelectedEvent}
                                            />
                                        </React.Fragment>
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
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </>
    )
}