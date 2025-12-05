// src/components/events/EventTypeBadge.tsx
import React from 'react'
import { EventType, EventSource } from '../../models/CampusEvent'
import EntityBadge, { BadgeVariant } from '../common/EntityBadge'

import icEventJpo from '../../assets/events/ic-event-jpo.png'
import icEventExam from '../../assets/events/ic-event-exam.png'
import icEventConference from '../../assets/events/ic-event-conference.png'
import icEventForum from '../../assets/events/ic-event-forum.png'
import icEventSalon from '../../assets/events/ic-event-salon.png'
import icEventOther from '../../assets/events/ic-event-other.png'

interface EventTypeBadgeProps {
    type: EventType
    source: EventSource
    className?: string
    variant?: BadgeVariant // 'card' | 'header'
    title?: string
    subtitle?: string
}

/**
 * Métadonnées par type d'événement :
 * - label affiché
 * - icône
 */
export const TYPE_META: Record<EventType, { icon: string; label: string }> = {
    JOURNEE_PO: { icon: icEventJpo, label: 'Journée Portes Ouvertes' },
    EXAMEN: { icon: icEventExam, label: 'Examen / Partiels' },
    CONFERENCE: { icon: icEventConference, label: 'Conférence' },
    FORUM: { icon: icEventForum, label: 'Forum' },
    SALON: { icon: icEventSalon, label: 'Salon / Expo' },
    AUTRE: { icon: icEventOther, label: 'Autre évènement' },
}

/**
 * Helper exporté pour d’autres usages éventuels
 */
export function getEventTypeMeta(type: EventType) {
    return TYPE_META[type] ?? TYPE_META.AUTRE
}

export default function EventTypeBadge({
                                           type,
                                           source,
                                           className,
                                           variant = 'card',
                                           title,
                                           subtitle,
                                       }: EventTypeBadgeProps) {
    const meta = getEventTypeMeta(type)
    const headerColorClass =
        source === 'JUNIA'
            ? 'event-detail-header-pill--junia'
            : 'event-detail-header-pill--external'

    const cardColorClass =
        source === 'JUNIA'
            ? 'event-badge-type--junia'
            : 'event-badge-type--external'

    const rootClassName = [
        'event-badge-type',
        variant === 'header' && 'event-detail-header-pill',
        variant === 'header' && headerColorClass,
        variant === 'card' && cardColorClass,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <EntityBadge
            iconSrc={meta.icon}
            label={meta.label}
            className={rootClassName}
            variant={variant}
            title={title}
            subtitle={subtitle}
        />
    )
}