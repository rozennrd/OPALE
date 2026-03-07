// src/components/matieres/MatiereBadge.tsx

import React from 'react'
import EntityBadge, { BadgeVariant } from '../common/EntityBadge'
import icOther from '../../assets/ic-event-other.png'

interface MatiereBadgeProps {
    semestre: number
    className?: string
    variant?: BadgeVariant
    title?: string
    subtitle?: string
    centerLabel?: string
}

export default function MatiereBadge({
    semestre,
    className,
    variant = 'card',
    title,
    subtitle,
    centerLabel,
}: MatiereBadgeProps) {
    const rootClassName = [
        'matiere-badge',
        variant === 'header' && 'matiere-badge-header',
        `matiere-badge-s${semestre}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <EntityBadge
            iconSrc={icOther}
            label={`S${semestre}`}
            className={rootClassName}
            variant={variant}
            title={title}
            subtitle={subtitle}
            centerLabel={centerLabel}
        />
    )
}
