// src/components/teachers/TeacherModeBadge.tsx
import React from 'react'
import { TeachingMode } from '../../models/Teacher'

import icDistanciel from '../../assets/ic-mode-distanciel.png'
import icPresentiel from '../../assets/ic-mode-presentiel.png'
import icHybride from '../../assets/ic-mode-hybride.png'

interface TeacherModeBadgeProps {
    mode: TeachingMode
    className?: string
    variant?: 'card' | 'header'
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
        default:
            label = 'Présentiel'
            iconSrc = icPresentiel
            break
    }

    const modeClass = mode.toLowerCase() // distanciel / hybride / presentiel

    // Variante header : grosse pill avec titre + sous-titre à gauche
    // et icône + label du mode à droite
    if (variant === 'header') {
        const rootClassName = [
            'teacher-mode-badge',
            'teacher-mode-badge-header',
            `teacher-mode-${modeClass}`,
            className ?? '',
        ]
            .filter(Boolean)
            .join(' ')

        return (
            <div className={rootClassName}>
                <div className="teacher-mode-header-left">
                    <div className="teacher-mode-header-title">
                        {title ?? 'Détail enseignant'}
                    </div>
                    {subtitle && (
                        <div className="teacher-mode-header-subtitle">
                            {subtitle}
                        </div>
                    )}
                </div>

                <div className="teacher-mode-header-right">
                    <div className="teacher-mode-icon" aria-hidden="true">
                        <img src={iconSrc} alt="" />
                    </div>
                    <span className="teacher-mode-label">{label}</span>
                </div>
            </div>
        )
    }

    // Variante "card" (pour les cards liste)
    return (
        <div className={`teacher-mode-badge teacher-mode-${modeClass} ${className ?? ''}`}>
            <div className="teacher-mode-icon" aria-hidden="true">
                <img src={iconSrc} alt="" />
            </div>
            <span className="teacher-mode-label">{label}</span>
        </div>
    )
}