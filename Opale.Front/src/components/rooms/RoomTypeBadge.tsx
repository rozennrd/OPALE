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
    Cours: { icon: icTd, label: 'Cours', typeClass: 'td' },
    Informatique: { icon: icTpn, label: 'Informatique', typeClass: 'tp_numerique' },
    Projet: { icon: icProjet, label: 'Projet', typeClass: 'projet' },
    Rassemblement: { icon: icAutre, label: 'Rassemblement', typeClass: 'autre' },
    Reunion: { icon: icAutre, label: 'Reunion', typeClass: 'autre' },
    Associatif: { icon: icAutre, label: 'Associatif', typeClass: 'autre' },
    Electronique: { icon: icTpe, label: 'Electronique', typeClass: 'tp_electronique' },
    Fablab: { icon: icProjet, label: 'Fablab', typeClass: 'projet' },
    Reseau: { icon: icTpn, label: 'Reseau', typeClass: 'tp_numerique' },
}

export default function RoomTypeBadge({
                                          type,
                                          className,
                                          variant = 'card',
                                          title,
                                          subtitle,
                                      }: RoomTypeBadgeProps) {
    const meta = TYPE_META[type] ?? TYPE_META.Rassemblement

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
