// src/components/common/ConfirmDialog.tsx
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
    open: boolean
    title?: string
    message: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    confirmClassName?: string
    cancelClassName?: string
    cardClassName?: string
    confirmDisabled?: boolean
    cancelDisabled?: boolean

    // Appelé quand on veut simplement fermer le popup
    // (ESC, clic overlay, croix) sans déclencher confirm/cancel métier
    onRequestClose?: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
    const {
        open,
        title = 'Confirmer',
        message,
        confirmLabel = 'OK',
        cancelLabel = 'Annuler',
        onConfirm,
        onCancel,
        confirmClassName = 'btn-primary',
        cancelClassName = 'btn-tertiary',
        cardClassName,
        confirmDisabled = false,
        cancelDisabled = false,
        onRequestClose,
    } = props

    // Gestion de ESC au niveau du popup
    useEffect(() => {
        if (!open) return

        const handleKey = (e: KeyboardEvent) => {

            if (e.key === 'Escape') {
                // On bloque la propagation vers les autres listeners (card, page, etc.)
                e.stopPropagation()
                e.preventDefault()

                if (onRequestClose) {
                    onRequestClose()
                } else {
                    onCancel()
                }
            }
        }

        // ⚠️ capture = true → on intercepte avant les autres keydown
        window.addEventListener('keydown', handleKey, true)

        return () => {
            window.removeEventListener('keydown', handleKey, true)
        }
    }, [open, onRequestClose, onCancel])

    if (!open) return null
    if (typeof document === 'undefined') return null

    const handleOverlayClick = () => {
        if (onRequestClose) {
            onRequestClose()
        } else {
            onCancel()
        }
    }

    const handleCloseButton = () => {
        if (onRequestClose) {
            onRequestClose()
        } else {
            onCancel()
        }
    }

    return createPortal(
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div
                className={['card', 'confirm-dialog-card', cardClassName].filter(Boolean).join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Croix dans le popup */}
                <button
                    type="button"
                    className="confirm-dialog-close"
                    onClick={handleCloseButton}
                >
                    ✕
                </button>

                {title && <h3 className="confirm-dialog-title">{title}</h3>}

                <div className="confirm-dialog-body">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                </div>

                <div className="confirm-dialog-actions">
                    <button
                        type="button"
                        className={cancelClassName}
                        onClick={() => {
                            onCancel()
                        }}
                        disabled={cancelDisabled}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={confirmClassName}
                        onClick={() => {
                            onConfirm()
                        }}
                        disabled={confirmDisabled}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    )
}

export default ConfirmDialog
