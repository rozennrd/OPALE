// src/components/teachers/TeacherModeBadge.tsx
import React from 'react'
import { TeachingMode } from '../../models/Teacher'

interface TeacherModeBadgeProps {
    mode: TeachingMode
}

export default function TeacherModeBadge({ mode }: TeacherModeBadgeProps) {
    let label = ''
    let icon = ''

    switch (mode) {
        case 'DISTANCIEL':
            label = 'Distanciel'
            icon = '💻' // à remplacer par ton icône pack maison
            break
        case 'HYBRIDE':
            label = 'Hybride'
            icon = '🔀'
            break
        case 'PRESENTIEL':
            label = 'Présentiel'
            icon = '🏫'
            break
    }

    const modeClass = mode.toLowerCase() // distanciel / hybride / presentiel

    return (
        <div className={`teacher-mode-badge teacher-mode-${modeClass}`}>
      <span className="teacher-mode-icon" aria-hidden="true">
        {icon}
      </span>
            <span className="teacher-mode-label">{label}</span>
        </div>
    )
}