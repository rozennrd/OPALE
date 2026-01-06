// src/components/events/EventTypeBadge.tsx
import React from 'react'
import { EventType, EventSource } from '../../models/CampusEvent'
import EntityBadge, { BadgeVariant } from '../common/EntityBadge'
import { getEventTypeMeta } from './eventTypeMeta'

interface EventTypeBadgeProps {
    type: EventType
    source: EventSource
    className?: string
    variant?: BadgeVariant // 'card' | 'header'
    title?: string
    subtitle?: string
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
