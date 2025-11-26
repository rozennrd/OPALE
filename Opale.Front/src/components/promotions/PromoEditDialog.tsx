// src/components/promotions/PromoEditDialog.tsx
import React from 'react'
import { Constraints } from '../../models'
import { EditingPromotion } from '../../hooks/promotions/usePromotionEditing'
import { computePromoTotals } from '../../utils/promoUtils'

import PromoMainInfo from './sections/PromoMainInfo'
import PromoGroups from './sections/PromoGroups'
import PromoSpecialties from './sections/PromoSpecialties'
import ConstraintsSection from './constraints/ConstraintsSection'
import ConfirmDialog from '../common/ConfirmDialog'

interface PromoEditDialogProps {
    editingPromo: EditingPromotion
    onSubmit: () => void
    onClose: () => void
    onFieldChange: (field: string, value: any) => void
    onStudentsBlur?: () => void
    onGroupChange: (index: number, field: string, value: any) => void
    onAddGroup: () => void
    onRemoveGroup: (index: number) => void
    onSpecialtyChange: (index: number, field: string, value: any) => void
    onAddSpecialty: () => void
    onRemoveSpecialty: (index: number) => void
    constraints: Constraints
    onAddConstraint: (type: keyof Constraints) => void
    onRemoveConstraint: (type: keyof Constraints, id: string) => void
    onUpdateConstraintRange: (type: keyof Constraints, id: string, field: string, value: string) => void
}

const PromoEditDialog: React.FC<PromoEditDialogProps> = (props) => {
    const { editingPromo } = props
    const [showConfirm, setShowConfirm] = React.useState(false)

    if (!editingPromo) return null

    const totals = computePromoTotals({
        students: editingPromo.students,
        groups: editingPromo.groups,
        specialties: editingPromo.specialties,
    } as any)

    /**
     * Soumission du formulaire : on bloque le submit natif
     * et on affiche la boîte de confirmation.
     */
    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setShowConfirm(true)
    }

    /**
     * Confirmation : on déclenche la sauvegarde (logique dans le hook)
     */
    const handleConfirmSave = () => {
        console.log('Mettre à jour la BDD (simulation front)')
        props.onSubmit()
        setShowConfirm(false)
    }

    /**
     * Annulation de la confirmation : on ne sauvegarde pas
     */
    const handleCancelSave = () => {
        console.log('Rétablir front avec l’état de la BDD')
        setShowConfirm(false)
    }

    return (
        <div className="promo-edit-overlay">
            <form className="card promo-edit-card" onSubmit={handleFormSubmit}>
                <h3 className="promo-edit-title">Modifier la promotion</h3>

                <div className="promo-edit-layout">
                    <PromoMainInfo
                        editingPromo={editingPromo}
                        onFieldChange={props.onFieldChange}
                        onStudentsBlur={props.onStudentsBlur}
                    />

                    <div className="promo-edit-side">
                        <PromoGroups
                            groups={editingPromo.groups}
                            onAddGroup={props.onAddGroup}
                            onGroupChange={props.onGroupChange}
                            onRemoveGroup={props.onRemoveGroup}
                        />

                        <PromoSpecialties
                            specialties={editingPromo.specialties}
                            onAddSpecialty={props.onAddSpecialty}
                            onSpecialtyChange={props.onSpecialtyChange}
                            onRemoveSpecialty={props.onRemoveSpecialty}
                        />
                    </div>

                    <ConstraintsSection
                        promoName={editingPromo.name}
                        constraints={props.constraints}
                        onAddConstraint={props.onAddConstraint}
                        onRemoveConstraint={props.onRemoveConstraint}
                        onUpdateConstraintRange={props.onUpdateConstraintRange}
                    />
                </div>

                {(totals.groupsMismatch || totals.specialtiesMismatch) && (
                    <div className="promo-mismatch-block">
                        {totals.groupsMismatch && (
                            <p className="promo-mismatch">
                                Le total des groupes est {totals.groupsTotal} pour {totals.totalStudents}.
                            </p>
                        )}
                        {totals.specialtiesMismatch && (
                            <p className="promo-mismatch">
                                Le total des spécialités est {totals.specialtiesTotal} pour {totals.totalStudents}.
                            </p>
                        )}
                    </div>
                )}

                <div className="promo-edit-actions">
                    <button type="button" className="btn-tertiary" onClick={props.onClose}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                        Enregistrer
                    </button>
                </div>
            </form>

            <ConfirmDialog
                open={showConfirm}
                title="Confirmer les modifications"
                message={
                    <>
                        <p>Des modifications ont été apportées à cette promotion.</p>
                        <p>Souhaitez-vous confirmer et enregistrer ces changements&nbsp;?</p>
                    </>
                }
                confirmLabel="Oui, enregistrer"
                cancelLabel="Annuler"
                onConfirm={handleConfirmSave}
                onCancel={handleCancelSave}
            />
        </div>
    )
}

export default PromoEditDialog