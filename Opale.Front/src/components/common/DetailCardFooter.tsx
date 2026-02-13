// src/components/common/DetailCardFooter.tsx
import React from 'react'
import ActionButtonsWithConfirm from './ActionButtonsWithConfirm'

type ActionButtonsProps = React.ComponentProps<typeof ActionButtonsWithConfirm>

interface DetailCardFooterProps extends ActionButtonsProps {
    /** Classe optionnelle sur le wrapper <footer> si une page veut surcharger un détail */
    wrapperClassName?: string
}

export default function DetailCardFooter({
                                             wrapperClassName,
                                             ...buttonProps
                                         }: DetailCardFooterProps) {
    const rootClassName = ['detail-card-footer', wrapperClassName]
        .filter(Boolean)
        .join(' ')

    return (
        <footer className={rootClassName}>
            <ActionButtonsWithConfirm {...buttonProps} />
        </footer>
    )
}