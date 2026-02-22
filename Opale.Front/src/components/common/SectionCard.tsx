import React from 'react'

interface SectionCardProps {
    id: string
    title: string
    expanded: boolean
    onToggle: () => void
    children: React.ReactNode
    wide?: boolean
    className?: string
    contentClassName?: string
}

const SectionCard: React.FC<SectionCardProps> = ({
    id,
    title,
    expanded,
    onToggle,
    children,
    wide = false,
    className = '',
    contentClassName = '',
}) => {
    const rootClassName = [
        'card',
        'section-card',
        wide && 'section-card--wide',
        !expanded && 'is-collapsed',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const contentClassNames = ['section-card-content', contentClassName]
        .filter(Boolean)
        .join(' ')

    return (
        <section className={rootClassName}>
            <div className="section-card-header">
                <h2 className="section-card-title">{title}</h2>
                <button
                    type="button"
                    className="section-card-toggle"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-controls={id}
                    title={expanded ? 'Replier' : 'D\u00e9plier'}
                >
                    <span
                        className={`section-card-chevron ${expanded ? 'is-up' : 'is-down'}`}
                        aria-hidden="true"
                    />
                </button>
            </div>

            {expanded && (
                <div id={id} className={contentClassNames}>
                    {children}
                </div>
            )}
        </section>
    )
}

export default SectionCard
