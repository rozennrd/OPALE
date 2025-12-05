// src/hooks/common/useDetailEscapeClose.ts
import { useEffect } from 'react'

interface UseDetailEscapeCloseOptions {
    /** Callback appelé quand on valide la fermeture via ESC */
    onEscape: () => void
    /**
     * Optionnel : si un sélecteur est fourni, ESC est ignoré
     * tant qu'au moins un élément correspondant est présent dans le DOM.
     * Exemple : '.modal-overlay' pour éviter de fermer la card si un ConfirmDialog est ouvert.
     */
    ignoreWhenSelectorExists?: string
    /** Permet de désactiver le comportement ESC (par défaut: true) */
    enabled?: boolean
}

export function useDetailEscapeClose({
                                         onEscape,
                                         ignoreWhenSelectorExists,
                                         enabled = true,
                                     }: UseDetailEscapeCloseOptions) {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return

            if (
                ignoreWhenSelectorExists &&
                document.querySelector(ignoreWhenSelectorExists)
            ) {
                // Un modal "prioritaire" est ouvert → on ne ferme pas la card
                return
            }

            onEscape()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [enabled, onEscape, ignoreWhenSelectorExists])
}