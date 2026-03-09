// src/pages/Promotions.tsx
import { useEffect } from 'react'
import icPlus from '../assets/ic-plus.png'

import PromoEditDialog from '../components/promotions/PromoEditDialog.tsx'
import PromoAdjustDialog from '../components/promotions/PromoAdjustDialog.tsx'
import CycleCard from '../components/promotions/cycles/CycleCard'
import CycleCreateDialog from '../components/promotions/CycleCreateDialog'
import PageHeader from '../components/common/PageHeader'

import {
    usePromotionCycles,
    usePromotionEditing,
    usePromotionConstraints,
    usePromotionAdjustPopup,
} from '../hooks/promotions'
import { usePromotionSync } from "../hooks/promotions/usePromotionSync.ts"

export default function Promotions() {
    // Cycle management hooks
    const {
        cycles,
        error,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        createCycleWithPromotions,
        removeCycle,
        renameCycle,
        removePromotion,
        addPromotionToCycle,
        refreshCycles,
    } = usePromotionCycles()

    // Promotion sync (save/fetch)
    const { savePromotion } = usePromotionSync()

    // Promotion editing state
    const {
        editingPromo,
        setEditingPromo,
        openEditPromotion,
        closeEditPromotion,
        handleEditFieldChange,
        markFormAsUntouched,
        addGroup,
        removeGroup,
        handleGroupChange,
        hasChanges,
        isLoading: isLoadingPromotion,
        addSpecialty,
        removeSpecialty,
        handleSpecialtyChange,
        removedGroupIds,
        removedSpecialtyIds,
    } = usePromotionEditing(cycles)

    // Student adjustment popup
    const {
        adjustPopup,
        handleStudentsBlur,
        handleAdjustValidate,
        toggleAdjustGroups,
        toggleAdjustSpecialties,
    } = usePromotionAdjustPopup(editingPromo, setEditingPromo)

    // Constraints management
    const {
        handleAddConstraint,
        handleRemoveConstraint,
        handleUpdateConstraintRange,
    } = usePromotionConstraints(editingPromo, setEditingPromo)

    // Debug log cycles (can be removed in production)
    useEffect(() => {
    }, [cycles])

    /**
     * Handles promotion save with proper error handling
     */
    const handleSavePromotion = async () => {
        if (!editingPromo) return

        try {
            const updatedPromo = await savePromotion(
                editingPromo,
                [],
                removedGroupIds,
                removedSpecialtyIds
            )

            // Update local state with synced groups (containing real IDs) and refresh state
            markFormAsUntouched(updatedPromo);
            await refreshCycles()

            // TODO: Update cycles state to reflect changes
            // setCycles(prev => updateCyclePromotion(prev, updatedPromo))

        } catch (error) {
            console.error('Failed to save promotion:', error)
            // TODO: Show error notification to user
        }
    }

    return (
        <div className="promos">
            <PageHeader
                title="Promotions"
                subtitle="Gestion des cycles, promotions et contraintes académiques."
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
                        addPromotion={addPromotionToCycle}
                    />
                ))}
                <button
                    type="button"
                    className="card add-cycle-card"
                    onClick={openCreateModal}
                    aria-label="Ajouter un cycle"
                    title="Ajouter un cycle"
                >
                    <img src={icPlus} alt="" />
                </button>
            {/* Error display */}
            {error && (
                <div className="error-banner" role="alert">
                    Erreur : {error}
                </div>
            )}

            {/* Edit promotion modal */}
            {editingPromo && (
                <PromoEditDialog
                    editingPromo={editingPromo}
                    hasChanges={hasChanges}
                    isLoading={isLoadingPromotion}
                    onSubmit={handleSavePromotion}
                    onClose={closeEditPromotion}
                    onFieldChange={handleEditFieldChange}
                    onGroupChange={handleGroupChange}
                    onAddGroup={addGroup}
                    onRemoveGroup={removeGroup}
                    onStudentsBlur={handleStudentsBlur}
                    onSpecialtyChange={handleSpecialtyChange}
                    onAddSpecialty={addSpecialty}
                    onRemoveSpecialty={removeSpecialty}
                    constraints={editingPromo.constraints}
                    onAddConstraint={handleAddConstraint}
                    onRemoveConstraint={handleRemoveConstraint}
                    onUpdateConstraintRange={handleUpdateConstraintRange}
                />
            )}

            {/* Student adjustment popup */}
            {adjustPopup.open && (
                <PromoAdjustDialog
                    adjustPopup={adjustPopup}
                    onToggleGroups={toggleAdjustGroups}
                    onToggleSpecialties={toggleAdjustSpecialties}
                    onValidate={handleAdjustValidate}
                />
            )}

            {/* Create cycle modal */}
            <CycleCreateDialog
                isOpen={isCreateModalOpen}
                onSubmit={createCycleWithPromotions}
                onClose={closeCreateModal}
            />
            </div></div>
    )
}
