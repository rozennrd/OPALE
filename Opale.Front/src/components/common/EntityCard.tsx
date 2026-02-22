// src/components/common/EntityCard.tsx
import React from 'react'

export type EntityCardVariant = 'default' | 'compact'

interface EntityCardProps {
    children: React.ReactNode          // contenu colonne gauche
    badge: React.ReactNode             // badge colonne droite
    onClick?: () => void

    className?: string                 // pour garder .event-card / .room-card / .teacher-card
    mainClassName?: string             // ex: "event-card-main"
    asideClassName?: string            // ex: "event-card-aside"

    variant?: EntityCardVariant        // spacing global
    selected?: boolean                 // surbrillance possible
    selectionMode?: boolean            // affiche le marqueur de selection
    disabled?: boolean                 // clic desactive
}

export default function EntityCard({
    children,
    badge,
    onClick,
    className = '',
    mainClassName = '',
    asideClassName = '',
    variant = 'default',
    selected = false,
    selectionMode = false,
    disabled = false,
}: EntityCardProps) {
    const rootClassName = [
        'entity-card',
        `entity-card--${variant}`,
        selected && 'entity-card--selected',
        selectionMode && 'entity-card--selection-mode',
        disabled && 'entity-card--disabled',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const handleClick = () => {
        if (disabled) return
        if (onClick) onClick()
    }

    return (
        <article className={rootClassName} onClick={handleClick}>
            {selectionMode && (
                <span
                    className={[
                        'entity-card-selection-dot',
                        selected ? 'is-selected' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    aria-hidden="true"
                >
                    {selected ? '?' : ''}
                </span>
            )}

            <div className={['entity-card-main', mainClassName].filter(Boolean).join(' ')}>
                {children}
            </div>

            <div className={['entity-card-aside', asideClassName].filter(Boolean).join(' ')}>
                {badge}
            </div>
        </article>
    )
}
