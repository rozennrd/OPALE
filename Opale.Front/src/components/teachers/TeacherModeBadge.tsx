// src/components/teachers/TeacherModeBadge.tsx
import React from 'react'
import { TeachingMode } from '../../models/Teacher'

import icDistanciel from '../../assets/mode/ic-mode-distanciel.png'
import icPresentiel from '../../assets/mode/ic-mode-presentiel.png'
import icHybride from '../../assets/mode/ic-mode-hybride.png'
import EntityBadge, { BadgeVariant } from '../common/EntityBadge'

interface TeacherModeBadgeProps {
    mode: TeachingMode
    className?: string
    variant?: BadgeVariant // 'card' | 'header'
    title?: string
    subtitle?: string
}

export default function TeacherModeBadge({
                                             mode,
                                             className,
                                             variant = 'card',
                                             title,
                                             subtitle,
                                         }: TeacherModeBadgeProps) {
    let label: string
    let iconSrc: string
    let modeClass: string

    switch (mode) {
        case 'DISTANCIEL':
            label = 'Distanciel'
            iconSrc = icDistanciel
            modeClass = 'distanciel'
            break
        case 'HYBRIDE':
            label = 'Hybride'
            iconSrc = icHybride
            modeClass = 'hybride'
            break
        case 'PRESENTIEL':
        default:
            label = 'Présentiel'
            iconSrc = icPresentiel
            modeClass = 'presentiel'
            break
    }

    const rootClassName = [
        'teacher-mode-badge',
        variant === 'header' && 'teacher-mode-badge-header',
        `teacher-mode-${modeClass}`,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <EntityBadge
            iconSrc={iconSrc}
            label={label}
            className={rootClassName}
            variant={variant}
            title={title}
            subtitle={subtitle}
        />
    )
}