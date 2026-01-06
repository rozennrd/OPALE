// src/components/promotions/CycleCreateDialog.tsx
import React, { useState, useEffect } from 'react'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import { getCycleTypeDisplayName, CYCLE_TYPES } from '../../constants/cycleTypes'

interface CycleCreateDialogProps {
    isOpen: boolean
    onSubmit: (formData: { name: string; type: string; promotionCount: number }) => void
    onClose: () => void
}

const CycleCreateDialog: React.FC<CycleCreateDialogProps> = ({ isOpen, onSubmit, onClose }) => {
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

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = () => {
        // Basic validation - name is required
        if (!formData.name.trim()) {
            return
        }

        onSubmit(formData)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="promo-edit-overlay">
            <div className="card promo-edit-card">
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
