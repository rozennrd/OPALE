// src/components/common/SelectionToolbar.tsx
import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

interface SelectionToolbarProps {
    totalCount: number
    selectedCount: number
    onSelectAll: () => void
    onClearSelection: () => void
    onDeleteSelected: () => void
    className?: string
    confirmTitle?: string
    confirmMessage?: React.ReactNode
    confirmLabel?: string
}

export default function SelectionToolbar({
    totalCount,
    selectedCount,
    onSelectAll,
    onClearSelection,
    onDeleteSelected,
    className = '',
    confirmTitle = 'Supprimer la sélection',
    confirmMessage,
    confirmLabel = 'Supprimer',
}: SelectionToolbarProps) {
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)

    const rootClassName = ['selection-toolbar', className].filter(Boolean).join(' ')

    const effectiveConfirmMessage =
        confirmMessage ??
        `Vous allez supprimer ${selectedCount} élément${selectedCount > 1 ? 's' : ''}. Continuer ?`

    const handleDeleteRequest = () => {
        if (selectedCount <= 0) return
        setOpenDeleteConfirm(true)
    }

    const handleConfirmDelete = () => {
        setOpenDeleteConfirm(false)
        onDeleteSelected()
    }

    return (
        <>
            <div className={rootClassName}>
                <div className="selection-toolbar-left">
                    <span className="selection-toolbar-count">
                        {selectedCount} / {totalCount} sélectionné{selectedCount > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="selection-toolbar-actions">
                    <button
                        type="button"
                        className="btn-tertiary"
                        onClick={onSelectAll}
                        disabled={totalCount === 0 || selectedCount === totalCount}
                    >
                        Tout sélectionner
                    </button>

                    <button
                        type="button"
                        className="btn-tertiary"
                        onClick={onClearSelection}
                        disabled={selectedCount === 0}
                    >
                        Effacer
                    </button>

                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDeleteRequest}
                        disabled={selectedCount === 0}
                    >
                        Supprimer ({selectedCount})
                    </button>
                </div>
            </div>

            <ConfirmDialog
                open={openDeleteConfirm}
                title={confirmTitle}
                message={effectiveConfirmMessage}
                confirmLabel={confirmLabel}
                cancelLabel="Annuler"
                confirmClassName="btn-danger"
                cancelClassName="btn-tertiary"
                onConfirm={handleConfirmDelete}
                onCancel={() => setOpenDeleteConfirm(false)}
                onRequestClose={() => setOpenDeleteConfirm(false)}
            />
        </>
    )
}
