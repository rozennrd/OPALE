// src/components/teachers/TeacherModeBadge.tsx
import React from 'react'
import { TeachingMode } from '../../models/Teacher'

import icDistanciel from '../../assets/ic-mode-distanciel.png'
import icPresentiel from '../../assets/ic-mode-presentiel.png'
import icHybride from '../../assets/ic-mode-hybride.png'

interface TeacherModeBadgeProps {
    mode: TeachingMode
}

export default function TeacherModeBadge({ mode }: TeacherModeBadgeProps) {
    let label = ''
    let iconSrc: string

    switch (mode) {
        case 'DISTANCIEL':
            label = 'Distanciel'
            iconSrc = icDistanciel
            break
        case 'HYBRIDE':
            label = 'Hybride'
            iconSrc = icHybride
            break
        case 'PRESENTIEL':
            label = 'Présentiel'
            iconSrc = icPresentiel
            break
        default:
            label = ''
            iconSrc = icPresentiel
    }

    const modeClass = mode.toLowerCase() // distanciel / hybride / presentiel

    return (
        <div className={`teacher-mode-badge teacher-mode-${modeClass}`}>
            <div className="teacher-mode-icon" aria-hidden="true">
                <img src={iconSrc} alt=""/>
            </div>
            <span className="teacher-mode-label">{label}</span>
        </div>
    )
}