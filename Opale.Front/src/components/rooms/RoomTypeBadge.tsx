import React from 'react'
import { RoomType } from '../../models/Room'

import icTd from '../../assets/ic-room-td.png'
import icTpe from '../../assets/ic-room-tp-electronique.png'
import icTpn from '../../assets/ic-room-tp-numerique.png'
import icProjet from '../../assets/ic-room-projet.png'
import icAutre from '../../assets/ic-room-autre.png'

interface RoomTypeBadgeProps {
    type: RoomType
    className?: string
    variant?: 'card' | 'header'
    title?: string
    subtitle?: string
}

export default function RoomTypeBadge({
                                          type,
                                          className,
                                          variant = 'card',
                                          title,
                                          subtitle,
                                      }: RoomTypeBadgeProps) {
    let label = ''
    let iconSrc: string

    switch (type) {
        case 'TD':
            label = 'TD'
            iconSrc = icTd
            break
        case 'TP_ELECTRONIQUE':
            label = 'TP électronique'
            iconSrc = icTpe
            break
        case 'TP_NUMERIQUE':
            label = 'TP numérique'
            iconSrc = icTpn
            break
        case 'PROJET':
            label = 'Projet'
            iconSrc = icProjet
            break
        case 'AUTRE':
        default:
            label = 'Autre'
            iconSrc = icAutre
            break
    }

    const typeClass = type.toLowerCase() // td / tp_electronique / ...

    // Variante HEADER (comme TeacherModeBadge header)
    if (variant === 'header') {
        const rootClassName = [
            'room-type-badge',
            'room-type-badge-header',
            `room-type-${typeClass}`,
            className ?? '',
        ]
            .filter(Boolean)
            .join(' ')

        return (
            <div className={rootClassName}>
                <div className="room-header-left">
                    <div className="room-header-title">
                        {title ?? 'Détail salle'}
                    </div>
                    {subtitle && (
                        <div className="room-header-subtitle">{subtitle}</div>
                    )}
                </div>

                <div className="room-header-right">
                    <div className="room-type-icon" aria-hidden="true">
                        <img src={iconSrc} alt="" />
                    </div>
                    <span className="room-type-label">{label}</span>
                </div>
            </div>
        )
    }

    // Variante CARD (pour les cards dans les sections)
    return (
        <div className={`room-type-badge room-type-${typeClass} ${className ?? ''}`}>
            <div className="room-type-icon" aria-hidden="true">
                <img src={iconSrc} alt="" />
            </div>
            <span className="room-type-label">{label}</span>
        </div>
    )
}