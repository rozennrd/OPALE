// src/components/promotions/CycleCreateDialog.tsx
import React, { useState, useEffect, useCallback } from 'react'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import { getCycleTypeDisplayName, CYCLE_TYPES } from '../../constants/cycleTypes'
import { DUPLICATE_CYCLE_MESSAGE } from '../../hooks/promotions/usePromotionCycles'

interface CycleCreateDialogProps {
    isOpen: boolean
    onSubmit: (formData: { name: string; type: string; promotionCount: number }) => Promise<boolean>
    onClose: () => void
    errorMessage?: string
    validateName?: (name: string) => string
}

const CycleCreateDialog: React.FC<CycleCreateDialogProps> = ({
    isOpen,
    onSubmit,
    onClose,
    errorMessage,
    validateName,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        type: CYCLE_TYPES[0], // Default to first available type
        promotionCount: 3 // Default
    })
    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                type: CYCLE_TYPES[0],
                promotionCount: 3
            })
        }
    }, [isOpen])
    
    // we need the any here.
    // eslint-disable-next-line
    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        // Basic validation - name is required
        if (!formData.name.trim()) {
            return
        }

        const validationMessage = validateName ? validateName(formData.name) : ''
        if (validationMessage) {
            return
        }

        const success = await onSubmit(formData)
        if (success) {
            onClose()
        }
    }

    const handleRequestClose = useCallback(() => {
        onClose()
    }, [onClose])

    useEffect(() => {
        if (!isOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return

            const hasModal = document.querySelector('.modal-overlay')
            if (hasModal) {
                return
            }

            handleRequestClose()
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isOpen, handleRequestClose])

    if (!isOpen) return null

    const nameValidationMessage = validateName ? validateName(formData.name) : ''
    const inlineNameError = nameValidationMessage || (errorMessage === DUPLICATE_CYCLE_MESSAGE ? errorMessage : '')
    const shouldShowGenericError = Boolean(errorMessage && errorMessage !== DUPLICATE_CYCLE_MESSAGE)

    return (
        <div className="promo-edit-overlay">
            <div className="card promo-edit-card">
                <button
                    type="button"
                    className="promo-edit-close"
                    onClick={handleRequestClose}
                    aria-label="Fermer la fen�tre de cr�ation"
                >
                    &times;
                </button>

                <h3 className="promo-edit-title">Créer un nouveau cycle</h3>

                <section className="promo-section promo-section-main">
                    <h4 className="promo-section-title">Informations du cycle</h4>

                    <div className="promo-section-grid">
                        <label className="promo-edit-field">
                            <span className="promo-edit-label">Nom du cycle</span>
                            <input
                                type="text"
                                className="promo-edit-input"
                                value={formData.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="Ex: ADI, CIR"
                                autoFocus
                                required
                            />
                            {inlineNameError && (
                                <small className="promo-edit-error">{inlineNameError}</small>
                            )}
                        </label>

                        <label className="promo-edit-field">
                            <span className="promo-edit-label">Type de formation</span>
                            <select
                                className="promo-edit-input"
                                value={formData.type}
                                onChange={(e) => handleFieldChange('type', e.target.value)}
                            >
                                {CYCLE_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {getCycleTypeDisplayName(type)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="promo-edit-field">
                            <span className="promo-edit-label">Nombre de promotions</span>
                            <input
                                type="number"
                                className="promo-edit-input"
                                value={formData.promotionCount}
                                onChange={(e) => handleFieldChange('promotionCount', parseInt(e.target.value) || 1)}
                                min="1"
                                max="10"
                            />
                            <small className="field-help">
                                Les promotions seront nommées &quot;{formData.name || 'Nom'} 1&quot;, &quot;{formData.name || 'Nom'} 2&quot;, etc.
                            </small>
                        </label>
                    </div>
                </section>

                {shouldShowGenericError && (
                    <div className="promo-warning promo-warning--danger" role="alert">
                        <span className="promo-warning-icon">!</span>
                        <div className="promo-warning-content">
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                )}

                <div className="promo-edit-actions">
                    <ActionButtonsWithConfirm
                        onCancel={onClose}
                        onSave={handleSubmit}
                        confirmMessage={
                            <>
                                Créer le cycle &quot;<strong>{formData.name}</strong>&quot; avec{' '}
                                <strong>{formData.promotionCount} promotion{formData.promotionCount > 1 ? 's' : ''}</strong> ?
                            </>
                        }
                        confirmLabel="Créer le cycle"
                        cancelLabel="Annuler"
                    />
                </div>
            </div>
        </div>
    )
}

export default CycleCreateDialog

