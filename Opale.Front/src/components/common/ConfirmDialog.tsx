// src/components/common/ConfirmDialog.tsx
import React from 'react'

interface ConfirmDialogProps {
    open: boolean
    title?: string
    message: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         open,
                                                         title = 'Confirmer les modifications',
                                                         message,
                                                         confirmLabel = 'Confirmer',
                                                         cancelLabel = 'Annuler',
                                                         onConfirm,
                                                         onCancel,
                                                     }) => {
    if (!open) return null

    return (
        <div className="modal-overlay">
            <div className="card confirm-dialog-card">
                {title && <h3 className="confirm-dialog-title">{title}</h3>}

                <div className="confirm-dialog-body">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                </div>

                <div className="confirm-dialog-actions">
                    <button type="button" className="btn-tertiary" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="btn-primary" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog