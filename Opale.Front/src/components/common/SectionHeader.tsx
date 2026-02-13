// src/components/common/SectionHeader.tsx
import React from 'react'

interface SectionHeaderProps {
    title: React.ReactNode
    subtitle?: React.ReactNode
    isOpen: boolean
    onToggle: () => void

    // classes optionnelles pour affiner par page
    wrapperClassName?: string
    titleClassName?: string
    subtitleClassName?: string
    chevronClassName?: string
}

export default function SectionHeader({
                                          title,
                                          subtitle,
                                          isOpen,
                                          onToggle,
                                          wrapperClassName,
                                          titleClassName,
                                          subtitleClassName,
                                          chevronClassName,
                                      }: SectionHeaderProps) {
    const headerClass = [
        'section-header',
        isOpen ? 'is-open' : '',
        wrapperClassName ?? '',
    ]
        .filter(Boolean)
        .join(' ')

    const titleClass = ['section-header-title', titleClassName ?? '']
        .filter(Boolean)
        .join(' ')

    const subtitleClass = ['section-header-subtitle', subtitleClassName ?? '']
        .filter(Boolean)
        .join(' ')

    const chevronClass = [
        'section-header-chevron',
        isOpen ? 'is-open' : '',
        chevronClassName ?? '',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type="button"
            className={headerClass}
            onClick={onToggle}
            aria-expanded={isOpen}
        >
            <div className="section-header-main">
                <span className={titleClass}>{title}</span>
                {subtitle && <p className={subtitleClass}>{subtitle}</p>}
            </div>

            <span className={chevronClass} aria-hidden="true">
        ▾
      </span>
        </button>
    )
}