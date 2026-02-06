// src/components/events/EventCard.tsx
import React from 'react'
import { CampusEvent } from '../../models/CampusEvent'
import EventTypeBadge from './EventTypeBadge'
import EntityCard from '../common/EntityCard'

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
        <EntityCard
            onClick={handleClick}
            className="event-card"
            mainClassName="event-card-main"
            asideClassName="event-card-aside"
            badge={
                <EventTypeBadge
                    type={event.type}
                    source={event.source}
                />
            }
        >
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
        </EntityCard>
    )
}