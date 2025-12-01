// src/components/common/ActionButtonsWithConfirm.tsx
import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

interface ActionButtonsWithConfirmProps {
    saveLabel?: string
    cancelLabel?: string
    confirmTitle?: string
    confirmMessage?: React.ReactNode
    confirmLabel?: string
    onSave: () => void
    onCancel: () => void
}

const ActionButtonsWithConfirm: React.FC<ActionButtonsWithConfirmProps> = ({
                                                                               saveLabel = 'Enregistrer',
                                                                               cancelLabel = 'Annuler',
                                                                               confirmTitle = 'Confirmer les modifications',
                                                                               confirmMessage = 'Souhaitez-vous enregistrer les modifications ?',
                                                                               confirmLabel = 'Confirmer',
                                                                               onSave,
                                                                               onCancel,
                                                                           }) => {
    const [openConfirm, setOpenConfirm] = useState(false)

    const openConfirmDialog = () => setOpenConfirm(true)
    const closeConfirmDialog = () => setOpenConfirm(false)

    const handleConfirm = () => {
        closeConfirmDialog()
        onSave()
    }

    return (
        <>
            <div className="action-buttons-row">
                <button type="button" className="btn-tertiary" onClick={onCancel}>
                    {cancelLabel}
                </button>

                <button type="button" className="btn-primary" onClick={openConfirmDialog}>
                    {saveLabel}
                </button>
            </div>

            <ConfirmDialog
                open={openConfirm}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                onConfirm={handleConfirm}
                onCancel={closeConfirmDialog}
            />
        </>
    )
}

export default ActionButtonsWithConfirm