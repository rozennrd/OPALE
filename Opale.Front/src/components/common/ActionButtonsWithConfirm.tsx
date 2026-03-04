// src/components/common/ActionButtonsWithConfirm.tsx
import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

interface ActionButtonsWithConfirmProps {
    saveLabel?: string
    cancelLabel?: string
    hideCancel?: boolean

    // Confirm "Enregistrer"
    confirmTitle?: string
    confirmMessage?: React.ReactNode
    confirmLabel?: string

    // Pop-up de "Annuler" quand il y a des modifications
    hasChanges?: boolean
    cancelDirtyTitle?: string
    cancelDirtyMessage?: React.ReactNode
    cancelDirtyConfirmLabel?: string
    cancelDirtyDiscardLabel?: string

    // Suppression optionnelle
    onDelete?: () => void
    deleteLabel?: string
    deleteTitle?: string
    deleteMessage?: React.ReactNode
    deleteConfirmLabel?: string
    deleteCancelLabel?: string

    // Hooks optionnels autour de la sauvegarde
    onBeforeSaveClick?: () => boolean
    onAfterSaveConfirm?: () => void | Promise<void>
    overlayClassName?: string

    onSave: () => void | boolean | Promise<void | boolean>
    // Disable the save button
    disabled?: boolean
    onCancel: () => void
}

export const ActionButtonsWithConfirm: React.FC<ActionButtonsWithConfirmProps> = ({
    saveLabel = 'Enregistrer',
    cancelLabel = 'Annuler',
    confirmTitle = 'Confirmer les modifications',
    confirmMessage = 'Souhaitez-vous enregistrer les modifications ?',
    confirmLabel = 'Confirmer',
    hasChanges = true,
    onDelete,
    deleteLabel = 'Supprimer',
    deleteTitle = 'Confirmer la suppression',
    deleteMessage = 'Souhaitez-vous supprimer cet élément ?',
    deleteConfirmLabel = 'Supprimer',
    deleteCancelLabel = 'Annuler',
    onBeforeSaveClick,
    onAfterSaveConfirm,
    disabled,
    onSave,
}) => {
    const [openSaveConfirm, setOpenSaveConfirm] = useState(false)
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)

    const closeSaveConfirmDialog = () => {
        setOpenSaveConfirm(false)
    }

    const closeDeleteConfirmDialog = () => {
        setOpenDeleteConfirm(false)
    }

    const canSave = () => {
        if (!onBeforeSaveClick) return true
        return onBeforeSaveClick()
    }

    const handleConfirmSave = async () => {
        if (!canSave()) {
            closeSaveConfirmDialog()
            return
        }

        closeSaveConfirmDialog()
        const saveResult = await Promise.resolve(onSave())
        if (saveResult === false) return
        if (onAfterSaveConfirm) await Promise.resolve(onAfterSaveConfirm())
    }

    const handleDirectSave = async () => {
        if (!canSave()) return

        const saveResult = await Promise.resolve(onSave())
        if (saveResult === false) return
        if (onAfterSaveConfirm) await Promise.resolve(onAfterSaveConfirm())
    }

    const handleConfirmDelete = () => {
        if (!onDelete) return

        closeDeleteConfirmDialog()
        onDelete()
    }

    return (
        <>
            <div className="action-buttons-row">
                {onDelete && (
                    <button
                        type="button"
                        className="btn-danger action-buttons-delete-btn"
                        onClick={() => setOpenDeleteConfirm(true)}
                    >
                        {deleteLabel}
                    </button>
                )}

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        if (!hasChanges) {
                            void handleDirectSave()
                            return
                        }
                        setOpenSaveConfirm(true)
                    }}
                    disabled={disabled}
                    style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                    {saveLabel}
                </button>
            </div>

            <ConfirmDialog
                open={openSaveConfirm}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                onConfirm={handleConfirmSave}
                onCancel={closeSaveConfirmDialog}
                onRequestClose={closeSaveConfirmDialog}
            />

            <ConfirmDialog
                open={openDeleteConfirm}
                title={deleteTitle}
                message={deleteMessage}
                confirmLabel={deleteConfirmLabel}
                cancelLabel={deleteCancelLabel}
                confirmClassName="btn-danger"
                cancelClassName="btn-tertiary"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirmDialog}
                onRequestClose={closeDeleteConfirmDialog}
            />
        </>
    )
}

export default ActionButtonsWithConfirm
