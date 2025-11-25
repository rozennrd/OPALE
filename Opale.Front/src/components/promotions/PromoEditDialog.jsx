// src/components/promotions/PromoEditDialog.jsx
import React from 'react'
import { computePromoTotals } from '../../utils/promoUtils'

import PromoMainInfo from './sections/PromoMainInfo.jsx'
import PromoGroups from './sections/PromoGroups.jsx'
import PromoSpecialties from './sections/PromoSpecialties.jsx'
import ConstraintsSection from './constraints/ConstraintsSection.jsx'

export default function PromoEditDialog(props) {
    const { editingPromo } = props
    if (!editingPromo) return null

    const totals = computePromoTotals(editingPromo)

    return (
        <div className="promo-edit-overlay">
            <form className="card promo-edit-card" onSubmit={props.onSubmit}>
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

                {/* Messages d’erreur */}
                { (totals.groupsMismatch || totals.specialtiesMismatch) && (
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
        </div>
    )
}