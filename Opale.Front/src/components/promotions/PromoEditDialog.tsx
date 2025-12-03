// src/components/promotions/PromoEditDialog.tsx
import React from 'react'
import { Constraints } from '../../models'
import { EditingPromotion } from '../../hooks/promotions/usePromotionEditing'
import { computePromoTotals } from '../../utils/promoUtils'

import PromoMainInfo from './sections/PromoMainInfo'
import PromoGroups from './sections/PromoGroups'
import PromoSpecialties from './sections/PromoSpecialties'
import ConstraintsSection from './constraints/ConstraintsSection'

import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'

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

    if (!editingPromo) return null

    const totals = computePromoTotals({
        students: editingPromo.students,
        groups: editingPromo.groups,
        specialties: editingPromo.specialties,
    } as any)

    const handleSave = () => {
        console.log('[PROMOS] Enregistrer les modifications')
        console.log('→ mettre à jour la BDD côté back')
        props.onSubmit()
    }

    return (
        <div className="promo-edit-overlay">
            <form className="card promo-edit-card" onSubmit={(e) => e.preventDefault()}>
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

                {/* Remplace totalement l'ancien bloc d'actions */}
                <div className="promo-edit-actions">
                    <ActionButtonsWithConfirm
                        onCancel={props.onClose}
                        onSave={handleSave}
                        confirmMessage={
                            <>
                                Vous êtes sur le point d’enregistrer les modifications apportées à la promotion{' '}
                                <strong>{editingPromo.name}</strong>.
                                <br />
                                Confirmer ?
                            </>
                        }
                        confirmLabel="Enregistrer"
                        cancelLabel="Annuler"
                    />
                </div>
            </form>
        </div>
    )
}

export default PromoEditDialog