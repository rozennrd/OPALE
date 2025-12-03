// src/components/events/EventCard.tsx
import React from 'react'
import { CampusEvent } from '../../models/CampusEvent'
import EventTypeBadge from './EventTypeBadge'

interface EventCardProps {
    event: CampusEvent
    onSelect?: (event: CampusEvent) => void
}

function formatEventDate(date: string): string {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export default function EventCard({ event, onSelect }: EventCardProps) {
    const handleClick = () => {
        console.log('[EVENTS] Click event card', event)
        if (onSelect) onSelect(event)
    }

    return (
        <article className="event-card" onClick={handleClick}>
            {/* Colonne gauche */}
            <div className="event-card-main">
                <div className="event-card-name">{event.name}</div>
                <div className="event-card-meta">
                    <span className="event-card-date">
                        {formatEventDate(event.date)}
                    </span>
                    <span className="event-card-separator">•</span>
                    <span className="event-card-location">
                        {event.location}
                    </span>
                </div>
            </div>

            {/* Colonne droite – même esprit que room-card-type */}
            <div className="event-card-aside">
                <EventTypeBadge
                    type={event.type}
                    source={event.source}
                />
            </div>
        </article>
    )
}