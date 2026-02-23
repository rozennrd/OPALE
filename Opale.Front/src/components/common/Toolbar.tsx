// src/components/common/Toolbar.tsx
import React from 'react'

interface PageToolbarProps {
    children: React.ReactNode
    className?: string
}

export const PageToolbar: React.FC<PageToolbarProps> = ({
                                                            children,
                                                            className = '',
                                                        }) => {
    const rootClassName = ['page-toolbar', className].filter(Boolean).join(' ')
    return <div className={rootClassName}>{children}</div>
}

interface ToolbarRowProps {
    children: React.ReactNode
    className?: string
}

export const ToolbarRow: React.FC<ToolbarRowProps> = ({
                                                          children,
                                                          className = '',
                                                      }) => {
    const rowClassName = ['page-toolbar-row', className]
        .filter(Boolean)
        .join(' ')
    return <div className={rowClassName}>{children}</div>
}

interface ToolbarResetButtonProps {
    onClick: () => void
    disabled?: boolean
    label?: string
    className?: string
}

export const ToolbarResetButton: React.FC<ToolbarResetButtonProps> = ({
                                                                          onClick,
                                                                          disabled = false,
                                                                          label = 'Reset filtres',
                                                                          className = '',
                                                                      }) => {
    const buttonClassName = ['toolbar-filter-button', 'toolbar-reset-button', className]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type="button"
            className={buttonClassName}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    )
}
