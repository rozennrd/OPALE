// src/pages/Promotions.jsx
import React from 'react'
import icModif from '../assets/ic-modif.png'
import icMoins from '../assets/ic-moins.png'
import icPlus from '../assets/ic-plus.png'
import icWarning from '../assets/ic-warning.png'

import PromoEditDialog from '../components/promotions/PromoEditDialog.jsx'
import PromoAdjustDialog from '../components/promotions/PromoAdjustDialog.jsx'

import {
    usePromotionCycles,
    usePromotionEditing,
    usePromotionConstraints,
    usePromotionAdjustPopup,
} from '../hooks/promotions'

import { hasPromoMismatch } from '../utils/promoUtils'   // ✅ Re-intégré !

export default function Promotions() {
    const {
        cycles,
        setCycles,
        addCycle,
        removeCycle,
        renameCycle,
        removePromotion,
    } = usePromotionCycles()

    const {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        handleSavePromotion,
        addGroup,
        removeGroup,
        handleGroupChange,
        addSpecialty,
        removeSpecialty,
        handleSpecialtyChange,
    } = usePromotionEditing(cycles, setCycles)

    const {
        adjustPopup,
        handleStudentsBlur,
        handleAdjustValidate,
        toggleAdjustGroups,
        toggleAdjustSpecialties,
    } = usePromotionAdjustPopup(editingPromo, setEditingPromo)

    const {
        handleAddConstraint,
        handleRemoveConstraint,
        handleUpdateConstraintRange,
    } = usePromotionConstraints(editingPromo, setEditingPromo)

    return (
        <div className="promos">
            <div className="promos-header">
                <h2 className="page-title">Promotions</h2>
            </div>

            <div className="promos-grid">
                {cycles.map(cycle => (
                    <section key={cycle.id} className="card cycle-card">
                        <div className="cycle-head">
                            <input
                                className="cycle-name"
                                value={cycle.name}
                                onChange={(e) => renameCycle(cycle.id, e.target.value)}
                            />
                            <div className="cycle-actions">
                                <button
                                    className="btn-danger btn-icon-responsive"
                                    onClick={() => removeCycle(cycle.id)}
                                    aria-label="Supprimer le cycle"
                                    title="Supprimer le cycle"
                                >
                                    <img src={icMoins} alt="" aria-hidden="true" />
                                    <span className="btn-label">Supprimer le cycle</span>
                                </button>
                            </div>
                        </div>

                        <div className="promotions">
                            {cycle.promotions.length === 0 && (
                                <div className="empty">Aucune promotion affichée pour ce cycle.</div>
                            )}

                            {cycle.promotions.map(promo => (
                                <div key={promo.id} className="promo-row">
                                    <div className="promo-main">
                                        <span className="promo-label">{promo.label}</span>

                                        {/* ✅ Warning basé sur la vraie logique métier */}
                                        {hasPromoMismatch(promo) && (
                                            <img
                                                src={icWarning}
                                                alt="Répartition d'étudiants incohérente"
                                                className="promo-warning"
                                            />
                                        )}
                                    </div>

                                    <div className="promo-actions">
                                        <button
                                            className="btn-tertiary btn-icon-responsive"
                                            onClick={() => openEditPromotion(cycle.id, promo.id)}
                                            aria-label="Modifier la promotion"
                                            title="Modifier la promotion"
                                        >
                                            <img src={icModif} alt="" aria-hidden="true" />
                                            <span className="btn-label">Modifier</span>
                                        </button>

                                        <button
                                            className="btn-danger btn-icon-responsive"
                                            onClick={() => removePromotion(cycle.id, promo.id)}
                                            aria-label="Supprimer la promotion"
                                            title="Supprimer la promotion"
                                        >
                                            <img src={icMoins} alt="" aria-hidden="true" />
                                            <span className="btn-label">Supprimer</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Carte "Ajouter un cycle" */}
                <button
                    type="button"
                    className="card add-cycle-card"
                    onClick={addCycle}
                    aria-label="Ajouter un cycle"
                    title="Ajouter un cycle"
                >
                    <img src={icPlus} alt="" />
                </button>
            </div>

            {/* Modale d’édition */}
            {editingPromo && (
                <PromoEditDialog
                    editingPromo={editingPromo}
                    onSubmit={handleSavePromotion}
                    onClose={closeEditPromotion}
                    onFieldChange={handleEditFieldChange}
                    onGroupChange={handleGroupChange}
                    onAddGroup={addGroup}
                    onRemoveGroup={removeGroup}
                    onSpecialtyChange={handleSpecialtyChange}
                    onAddSpecialty={addSpecialty}
                    onRemoveSpecialty={removeSpecialty}
                    onStudentsBlur={handleStudentsBlur}
                    constraints={editingPromo.constraints}
                    onAddConstraint={handleAddConstraint}
                    onRemoveConstraint={handleRemoveConstraint}
                    onUpdateConstraintRange={handleUpdateConstraintRange}
                />
            )}

            {/* Pop-up d’ajustement */}
            {adjustPopup.open && (
                <PromoAdjustDialog
                    adjustPopup={adjustPopup}
                    onToggleGroups={toggleAdjustGroups}
                    onToggleSpecialties={toggleAdjustSpecialties}
                    onValidate={handleAdjustValidate}
                />
            )}
        </div>
    )
}