// src/pages/Promotions.tsx
import React from 'react'
import icPlus from '../assets/ic-plus.png'

import PromoEditDialog from '../components/promotions/PromoEditDialog.tsx'
import PromoAdjustDialog from '../components/promotions/PromoAdjustDialog.tsx'
import CycleCard from '../components/promotions/cycles/CycleCard'

import {
    usePromotionCycles,
    usePromotionEditing,
    usePromotionConstraints,
    usePromotionAdjustPopup,
} from '../hooks/promotions'

import PageHeader from '../components/common/PageHeader'

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
        hasChanges: promoHasChanges,
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
            <PageHeader
                title="Promotions"
                subtitle="Gestion des cycles, promotions et contraintes académiques (mock front uniquement)."
            />

            <div className="promos-grid">
                {cycles.map((cycle) => (
                    <CycleCard
                        key={cycle.id}
                        cycle={cycle}
                        renameCycle={renameCycle}
                        removeCycle={removeCycle}
                        openEditPromotion={openEditPromotion}
                        removePromotion={removePromotion}
                    />
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
                    hasChanges={promoHasChanges}
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