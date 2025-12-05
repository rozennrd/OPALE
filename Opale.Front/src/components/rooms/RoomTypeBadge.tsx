import React from 'react'
import { RoomType } from '../../models/Room'

import icTd from '../../assets/rooms/ic-room-td.png'
import icTpe from '../../assets/rooms/ic-room-tp-electronique.png'
import icTpn from '../../assets/rooms/ic-room-tp-numerique.png'
import icProjet from '../../assets/rooms/ic-room-projet.png'
import icAutre from '../../assets/rooms/ic-room-autre.png'
import EntityBadge, { BadgeVariant } from '../common/EntityBadge'

interface RoomTypeBadgeProps {
    type: RoomType
    className?: string
    variant?: BadgeVariant // 'card' | 'header'
    title?: string
    subtitle?: string
}

const TYPE_META: Record<RoomType, { icon: string; label: string; typeClass: string }> = {
    TD: { icon: icTd, label: 'Salle de TD', typeClass: 'td' },
    TP_ELECTRONIQUE: {
        icon: icTpe,
        label: 'TP électronique',
        typeClass: 'tp_electronique',
    },
    TP_NUMERIQUE: {
        icon: icTpn,
        label: 'TP numérique',
        typeClass: 'tp_numerique',
    },
    PROJET: { icon: icProjet, label: 'Salle projet', typeClass: 'projet' },
    AUTRE: { icon: icAutre, label: 'Autre', typeClass: 'autre' },
}

export default function RoomTypeBadge({
                                          type,
                                          className,
                                          variant = 'card',
                                          title,
                                          subtitle,
                                      }: RoomTypeBadgeProps) {
    const meta = TYPE_META[type] ?? TYPE_META.AUTRE

    const rootClassName = [
        'room-type-badge',
        variant === 'header' && 'room-type-badge-header',
        `room-type-${meta.typeClass}`,
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