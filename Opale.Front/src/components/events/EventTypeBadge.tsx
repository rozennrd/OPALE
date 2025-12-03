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

export default function EventTypeBadge({ type, source }: EventTypeBadgeProps) {
    const meta = TYPE_META[type] ?? TYPE_META.AUTRE

    return (
        <span
            className={
                'event-badge-type event-badge-type--' +
                (source === 'JUNIA' ? 'junia' : 'external')
            }
        >
            <img src={meta.icon} alt="" className="event-badge-icon" />
            <span className="event-badge-label">{meta.label}</span>
        </span>
    )
}