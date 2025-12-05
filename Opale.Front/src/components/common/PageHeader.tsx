// src/components/common/PageHeader.tsx
import React from 'react'

type PageHeaderAlign = 'left' | 'center'

interface PageHeaderProps {
    title: string
    subtitle?: React.ReactNode
    align?: PageHeaderAlign
    className?: string
    /** Slot optionnel pour des actions à droite (boutons, filtres...) */
    actions?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({
                                                   title,
                                                   subtitle,
                                                   align = 'left',
                                                   className = '',
                                                   actions,
                                               }) => {
    const rootClassName = [
        'page-header',
        align === 'center' && 'page-header--center',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <header className={rootClassName}>
            <div className="page-header-main">
                <h1 className="page-header-title">{title}</h1>
                {subtitle && (
                    <p className="page-header-subtitle">{subtitle}</p>
                )}
            </div>

            {actions && <div className="page-header-actions">{actions}</div>}
        </header>
    )
}

export default PageHeader