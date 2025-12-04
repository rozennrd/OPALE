import React from 'react'
import { EventType, EventSource } from '../../models/CampusEvent'

import icEventJpo from '../../assets/ic-event-jpo.png'
import icEventExam from '../../assets/ic-event-exam.png'
import icEventConference from '../../assets/ic-event-conference.png'
import icEventForum from '../../assets/ic-event-forum.png'
import icEventSalon from '../../assets/ic-event-salon.png'
import icEventOther from '../../assets/ic-event-other.png'

interface EventTypeBadgeProps {
    type: EventType
    source: EventSource
}

const TYPE_META = {
    JOURNEE_PO: { label: 'Journée Portes Ouvertes', icon: icEventJpo },
    EXAMEN: { label: 'Examen', icon: icEventExam },
    CONFERENCE: { label: 'Conférence', icon: icEventConference },
    FORUM: { label: 'Forum', icon: icEventForum },
    SALON: { label: 'Salon', icon: icEventSalon },
    AUTRE: { label: 'Autre', icon: icEventOther },
}

// ... imports & TYPE_META identiques

export function getEventTypeMeta(type: EventType) {
    return TYPE_META[type] ?? TYPE_META.AUTRE
}

export default function EventTypeBadge({ type, source }: EventTypeBadgeProps) {
    const meta = getEventTypeMeta(type)

    return (
        <span
            className={
                'event-badge-type event-badge-type--' +
                (source === 'JUNIA' ? 'junia' : 'external')
            }
        >
            <span className="event-badge-icon">
                <img src={meta.icon} alt="" aria-hidden="true" />
            </span>
            <span className="event-badge-label">{meta.label}</span>
        </span>
    )
}