// src/components/common/ActionButtonsWithConfirm.tsx
import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

interface ActionButtonsWithConfirmProps {
    saveLabel?: string
    cancelLabel?: string

    // Confirm "Enregistrer"
    confirmTitle?: string
    confirmMessage?: React.ReactNode
    confirmLabel?: string

    // Pop-up de "Annuler" quand il y a des modifications
    hasChanges?: boolean
    cancelDirtyTitle?: string
    cancelDirtyMessage?: React.ReactNode
    cancelDirtyConfirmLabel?: string   // bouton principal
    cancelDirtyDiscardLabel?: string   // bouton rouge

    onSave: () => void
    onCancel: () => void
}

const ActionButtonsWithConfirm: React.FC<ActionButtonsWithConfirmProps> = ({
                                                                               saveLabel = 'Enregistrer',
                                                                               cancelLabel = 'Annuler',
                                                                               confirmTitle = 'Confirmer les modifications',
                                                                               confirmMessage = 'Souhaitez-vous enregistrer les modifications ?',
                                                                               confirmLabel = 'Confirmer',
                                                                               hasChanges = false,
                                                                               cancelDirtyTitle = 'Modifications non enregistrées',
                                                                               cancelDirtyMessage = (
                                                                                   <>
                                                                                       <p>Vous avez modifié certaines informations.</p>
                                                                                       <p>Souhaitez-vous les enregistrer avant de quitter&nbsp;?</p>
                                                                                   </>
                                                                               ),
                                                                               cancelDirtyConfirmLabel = 'Enregistrer et fermer',
                                                                               cancelDirtyDiscardLabel = 'Fermer sans enregistrer',
                                                                               onSave,
                                                                               onCancel,
                                                                           }) => {
    const [openSaveConfirm, setOpenSaveConfirm] = useState(false)
    const [openCancelConfirm, setOpenCancelConfirm] = useState(false)

    /* -------- Bouton "Enregistrer" -------- */
    const openSaveConfirmDialog = () => {
        setOpenSaveConfirm(true)
    }

    const closeSaveConfirmDialog = () => {
        setOpenSaveConfirm(false)
    }

    const handleConfirmSave = () => {
        closeSaveConfirmDialog()
        onSave()
    }

    /* -------- Bouton "Annuler" -------- */
    const handleCancelClick = () => {
        if (!hasChanges) {
            onCancel()
            return
        }

        setOpenCancelConfirm(true)
    }

    const closeCancelConfirmDialog = () => {
        setOpenCancelConfirm(false)
    }

    const handleConfirmCancelWithSave = () => {
        closeCancelConfirmDialog()
        onSave()
        onCancel()
    }

    const handleDiscardChangesAndClose = () => {
        closeCancelConfirmDialog()
        onCancel()
    }

    return (
        <>
            <div className="action-buttons-row">
                <button
                    type="button"
                    className="btn-tertiary"
                    onClick={handleCancelClick}
                >
                    {cancelLabel}
                </button>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={openSaveConfirmDialog}
                >
                    {saveLabel}
                </button>
            </div>

            {/* Pop-up du bouton "Enregistrer" */}
            <ConfirmDialog
                open={openSaveConfirm}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                // classes par défaut : confirm = btn-primary, cancel = btn-tertiary
                onConfirm={handleConfirmSave}
                onCancel={closeSaveConfirmDialog}
                // ESC / croix / overlay → ferment juste ce popup
                onRequestClose={closeSaveConfirmDialog}
            />

            {/* Pop-up quand on clique sur "Annuler" avec des changements */}
            <ConfirmDialog
                open={openCancelConfirm}
                title={cancelDirtyTitle}
                message={cancelDirtyMessage}
                confirmLabel={cancelDirtyConfirmLabel}
                cancelLabel={cancelDirtyDiscardLabel}
                // "Enregistrer et fermer" = bouton principal
                confirmClassName="btn-primary"
                // "Fermer sans enregistrer" = bouton rouge
                cancelClassName="btn-danger"
                onConfirm={handleConfirmCancelWithSave}
                onCancel={handleDiscardChangesAndClose}
                // ESC / croix / overlay → ferment SEULEMENT le popup
                onRequestClose={closeCancelConfirmDialog}
            />
        </>
    )
}

export default ActionButtonsWithConfirm