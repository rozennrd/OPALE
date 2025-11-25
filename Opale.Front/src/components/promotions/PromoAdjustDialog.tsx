// src/components/promotions/PromoAdjustDialog.jsx
import React from 'react'

export default function PromoAdjustDialog({
                                              adjustPopup,
                                              onToggleGroups,
                                              onToggleSpecialties,
                                              onValidate,
                                          }) {
    if (!adjustPopup.open) return null

    return (
        <div className="promo-adjust-overlay">
            <div className="card promo-adjust-card">
                <h4 className="promo-adjust-title">Ajuster la répartition ?</h4>
                <p className="promo-adjust-text">
                    Vous avez modifié le nombre d&apos;étudiants de la promotion.
                    Souhaitez-vous recalculer automatiquement les effectifs ?
                </p>

                <div className="promo-adjust-row" onClick={onToggleGroups}>
                    <span className="promo-adjust-label">Groupes</span>
                    <label className="radio-toggle">
                        <input
                            type="checkbox"
                            className="radio-toggle-input"
                            checked={adjustPopup.groups}
                            onChange={(e) => {
                                e.stopPropagation()      // évite de déclencher 2 fois avec le onClick parent
                                onToggleGroups()
                            }}
                        />
                        <span className="radio-toggle-dot"/>
                    </label>
                </div>

                <div className="promo-adjust-row" onClick={onToggleSpecialties}>
                    <span className="promo-adjust-label">Spécialités</span>
                    <label className="radio-toggle">
                        <input
                            type="checkbox"
                            className="radio-toggle-input"
                            checked={adjustPopup.specialties}
                            onChange={(e) => {
                                e.stopPropagation()
                                onToggleSpecialties()
                            }}
                        />
                        <span className="radio-toggle-dot"/>
                    </label>
                </div>

                <div className="promo-adjust-actions">
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={onValidate}
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    )
}