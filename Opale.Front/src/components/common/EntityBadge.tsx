// src/components/common/EntityBadge.tsx
import React from 'react'

export type BadgeVariant = 'card' | 'header'

interface EntityBadgeProps {
    iconSrc: string
    label: string
    className?: string
    variant?: BadgeVariant
    title?: string
    subtitle?: string
    centerLabel?: string
}

export default function EntityBadge({
                                        iconSrc,
                                        label,
                                        className = '',
                                        variant = 'card',
                                        title,
                                        subtitle,
                                        centerLabel,
                                    }: EntityBadgeProps) {
    const rootClassName = [
        'entity-badge',
        variant === 'header' ? 'entity-badge--header' : 'entity-badge--card',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    if (variant === 'header') {
        return (
            <div className={rootClassName}>
                <div className="entity-badge__header-left">
                    {title && <div className="entity-badge__title">{title}</div>}
                    {subtitle && (
                        <div className="entity-badge__subtitle">{subtitle}</div>
                    )}
                </div>

                {centerLabel && (
                    <div className="entity-badge__header-center">
                        <span className="entity-badge__center-label">{centerLabel}</span>
                    </div>
                )}

                <div className="entity-badge__header-right">
                    <span className="entity-badge__label">{label}</span>
                    <div className="entity-badge__icon" aria-hidden="true">
                        <img src={iconSrc} alt="" />
                    </div>
                </div>
            </div>
        )
    }

    // Variante "card" : simple pill icône + label
    return (
        <div className={rootClassName}>
            <div className="entity-badge__icon" aria-hidden="true">
                <img src={iconSrc} alt="" />
            </div>
            <span className="entity-badge__label">{label}</span>
        </div>
    )
}
