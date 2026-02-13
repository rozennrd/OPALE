// src/hooks/common/useDetailDirtyClose.ts
import { useCallback, useState } from 'react'
import { useDetailEscapeClose } from './useDetailEscapeClose'

interface UseDetailDirtyCloseOptions {
    /** Y a-t-il des modifications non enregistrées ? */
    hasChanges: boolean
    /** Fermeture simple de la card (sans save) */
    onClose: () => void
    /**
     * Sauvegarder puis fermer (utilisé pour "Enregistrer et fermer" /
     * "Créer et fermer" dans le popup).
     */
    onSaveAndClose?: () => void
    /**
     * Optionnel : comme dans useDetailEscapeClose, on peut ignorer ESC s'il y a
     * déjà un modal ouvert (ex: '.modal-overlay' pour ConfirmDialog).
     */
    ignoreWhenSelectorExists?: string
}

export function useDetailDirtyClose({
                                        hasChanges,
                                        onClose,
                                        onSaveAndClose,
                                        ignoreWhenSelectorExists,
                                    }: UseDetailDirtyCloseOptions) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const handleRequestClose = useCallback(() => {
        if (!hasChanges) {
            onClose()
            return
        }
        setIsConfirmOpen(true)
    }, [hasChanges, onClose])

    const handleConfirmSaveAndClose = useCallback(() => {
        setIsConfirmOpen(false)
        if (onSaveAndClose) {
            onSaveAndClose()
        } else {
            onClose()
        }
    }, [onSaveAndClose, onClose])

    const handleDiscardAndClose = useCallback(() => {
        setIsConfirmOpen(false)
        onClose()
    }, [onClose])

    const handleConfirmDialogRequestClose = useCallback(() => {
        setIsConfirmOpen(false)
    }, [])

    useDetailEscapeClose({
        onEscape: handleRequestClose,
        ignoreWhenSelectorExists,
    })

    return {
        /** À utiliser pour la croix + ESC (déjà branché sur ESC) */
        handleRequestClose,
        /** État du ConfirmDialog */
        isConfirmOpen,
        /** Pour "Enregistrer et fermer" */
        handleConfirmSaveAndClose,
        /** Pour "Fermer sans enregistrer" */
        handleDiscardAndClose,
        /** Pour onRequestClose du ConfirmDialog (clic croix / overlay popup) */
        handleConfirmDialogRequestClose,
    }
}