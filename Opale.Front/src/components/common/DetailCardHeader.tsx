// src/components/common/DetailCardHeader.tsx
import React from 'react'

interface DetailCardHeaderProps {
    /** Callback pour fermer la card (croix en haut à droite) */
    onClose: () => void
    /** Label accessibilité pour le bouton de fermeture */
    closeAriaLabel: string
    /** Classe CSS spécifique au bouton (event-detail-close, room-detail-close, ...) */
    closeButtonClassName: string
    /** Classe appliquée au conteneur de la pastille / badge (ex: event-detail-header-badge) */
    headerClassName?: string
    /** Classe supplémentaire sur le wrapper header (en plus de detail-card-header) */
    wrapperClassName?: string
    /** Contenu du header : badge, pill, etc. */
    children: React.ReactNode
}

const DetailCardHeader: React.FC<DetailCardHeaderProps> = ({
                                                               onClose,
                                                               closeAriaLabel,
                                                               closeButtonClassName,
                                                               headerClassName,
                                                               wrapperClassName,
                                                               children,
                                                           }) => {
    const rootClassName = ['detail-card-header', wrapperClassName]
        .filter(Boolean)
        .join(' ')

    return (
        <header className={rootClassName}>
            <button
                type="button"
                className={closeButtonClassName}
                onClick={onClose}
                aria-label={closeAriaLabel}
            >
                ✕
            </button>

            {headerClassName ? (
                <div className={headerClassName}>{children}</div>
            ) : (
                children
            )}
        </header>
    )
}

export default DetailCardHeader