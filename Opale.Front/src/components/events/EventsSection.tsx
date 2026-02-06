// src/components/events/EventsSection.tsx
import React, { useState, useMemo } from 'react'
import SectionHeader from '../common/SectionHeader'
import { CampusEvent } from '../../models/CampusEvent'
import EventCard from './EventCard'

interface EventsSectionProps {
    title: string
    events: CampusEvent[]
}

export default function EventsSection({ title, events }: EventsSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const sortedEvents = useMemo(
        () =>
            [...events].sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            ),
        [events],
    )

    const handleToggle = () => setIsOpen((prev) => !prev)

    return (
        <section className="events-section">
            <SectionHeader
                title={title}
                isOpen={isOpen}
                onToggle={handleToggle}
                wrapperClassName="events-section-header"
                titleClassName="events-section-title"
                subtitleClassName="events-section-subtitle"
                chevronClassName="events-section-chevron"
            />

            {isOpen && (
                <div className="events-section-body">
                    {sortedEvents.length > 0 ? (
                        <div className="events-list">
                            {sortedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="events-empty-state">
                            Aucun événement dans cette section.
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}