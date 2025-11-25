// src/hooks/promotions/usePromotionAdjustPopup.ts
import { useState, useEffect, useCallback } from 'react'
import { distributeEvenly } from '../../utils/promoUtils'
import { EditingPromotion } from './usePromotionEditing'

interface AdjustPopupState {
    open: boolean
    groups: boolean
    specialties: boolean
}

export function usePromotionAdjustPopup(
    editingPromo: EditingPromotion | null,
    setEditingPromo: React.Dispatch<React.SetStateAction<EditingPromotion | null>>
) {
    const [adjustPopup, setAdjustPopup] = useState<AdjustPopupState>({
        open: false,
        groups: false,
        specialties: false,
    })

    const [lastStudentsPrompt, setLastStudentsPrompt] = useState<number | null>(null)

    const handleStudentsBlur = useCallback(() => {
        if (!editingPromo) return

        const current = Number(editingPromo.students) || 0

        if (lastStudentsPrompt !== null && current === lastStudentsPrompt) {
            return
        }

        if (
            (!editingPromo.groups || editingPromo.groups.length === 0) &&
            (!editingPromo.specialties || editingPromo.specialties.length === 0)
        ) {
            return
        }

        setLastStudentsPrompt(current)
        setAdjustPopup({
            open: true,
            groups: false,
            specialties: false,
        })
    }, [editingPromo, lastStudentsPrompt])

    const handleAdjustValidate = useCallback(() => {
        if (!editingPromo) {
            setAdjustPopup({ open: false, groups: false, specialties: false })
            return
        }

        setEditingPromo(prev => {
            if (!prev) return prev
            let next = { ...prev }

            if (adjustPopup.groups && prev.groups && prev.groups.length > 0) {
                next.groups = distributeEvenly(prev.students, prev.groups)
            }

            if (adjustPopup.specialties && prev.specialties && prev.specialties.length > 0) {
                next.specialties = distributeEvenly(prev.students, prev.specialties)
            }

            console.log('[PROMO] auto adjust', {
                students: next.students,
                groups: next.groups,
                specialties: next.specialties,
            })

            return next
        })

        setAdjustPopup({ open: false, groups: false, specialties: false })
    }, [editingPromo, adjustPopup.groups, adjustPopup.specialties, setEditingPromo])

    const toggleAdjustGroups = useCallback(() => {
        setAdjustPopup(prev => ({ ...prev, groups: !prev.groups }))
    }, [])

    const toggleAdjustSpecialties = useCallback(() => {
        setAdjustPopup(prev => ({ ...prev, specialties: !prev.specialties }))
    }, [])

    // ESC : ferme le popup ou la modale
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape') return

            if (adjustPopup.open) {
                setAdjustPopup({ open: false, groups: false, specialties: false })
                return
            }

            if (editingPromo) {
                setEditingPromo(null)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [adjustPopup.open, editingPromo, setEditingPromo])

    return {
        adjustPopup,
        handleStudentsBlur,
        handleAdjustValidate,
        toggleAdjustGroups,
        toggleAdjustSpecialties,
    }
}
