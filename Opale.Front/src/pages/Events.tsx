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

interface MonthGroup {
    key: string
    label: string
    events: CampusEvent[]
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

        const newEvent: CampusEvent = {
            id: 'new-event',
            name: '',
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
        }

        setDetailMode('create')
        setSelectedEvent(newEvent)
    }

    const handleSaveEvent = async (event: Partial<CampusEvent>, salleIds: string[]) => {
        if (detailMode === 'create') {
            return await createEvent(event, salleIds)
        } else {
            return await updateEvent(event.id!, event, salleIds)
        }
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
                    />

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
                    mode={detailMode}
                    onClose={() => setSelectedEvent(null)}
                    onSave={handleSaveEvent}
                />
            )}
        </>
    )
}