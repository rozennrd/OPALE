// src/components/events/EventCard.tsx
import {CampusEvent} from '../../models/CampusEvent'
import EventTypeBadge from './EventTypeBadge'
import EntityCard from '../common/EntityCard'

interface EventCardProps {
    event: CampusEvent
    onSelect?: (event: CampusEvent) => void
}

function formatDatetime(isoString: string): string {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return isoString
    const date = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
    const time = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })
    return `${date} ${time}`
}

function formatTime(isoString: string): string {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function EventCard({event, onSelect}: EventCardProps) {
    const handleClick = () => {
        if (onSelect) onSelect(event)
    }

    return (
        <EntityCard
            onClick={handleClick}
            className="event-card"
            mainClassName="event-card-main"
            asideClassName="event-card-aside"
            badge={<EventTypeBadge type={event.type} source={event.source}/>}
        >
            <div className="event-card-name">{event.name}</div>
            <div className="event-card-meta">
                <span className="event-card-date">
                    {formatDatetime(event.startDate)}
                </span>
                <span className="event-card-separator">→</span>
                <span className="event-card-date">
                    {formatTime(event.endDate)}
                </span>
                {event.location && (
                    <>
                        <span className="event-card-separator">·</span>
                        <span className="event-card-location">
                            {event.location}
                        </span>
                    </>
                )}
            </div>
        </EntityCard>
    )
}