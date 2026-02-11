// src/components/promotions/PromoEditDialog.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Constraints } from '../../models'
import { EditingPromotion } from '../../hooks/promotions'
import { computePromoTotals } from '../../utils/promoUtils'

import PromoMainInfo from './sections/PromoMainInfo'
import PromoGroups from './sections/PromoGroups'
import PromoSpecialties from './sections/PromoSpecialties'
import ConstraintsSection from './constraints/ConstraintsSection'

import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import ConfirmDialog from '../common/ConfirmDialog'

interface PromoEditDialogProps {
    editingPromo: EditingPromotion
    hasChanges: boolean
    onSubmit: (promo:EditingPromotion) => Promise<EditingPromotion>
    onClose: () => void
    onFieldChange: (field: string, value: string | number) => void
    onStudentsBlur?: () => void
    onGroupChange: (index: number, field: string, value: string | number) => void
    onAddGroup: () => void
    onRemoveGroup: (index: number) => void
    onSpecialtyChange: (index: number, field: string, value: string | number) => void
    onAddSpecialty: () => void
    onRemoveSpecialty: (index: number) => void
    constraints: Constraints
    onAddConstraint: (type: string) => void
    onRemoveConstraint: (type: string, id: string) => void
    onUpdateConstraintRange: (
        type: string,
        id: string,
        field: 'start' | 'end',
        value: string
    ) => void
    onAddEvent?: (type: string, startDate: string, endDate: string) => Promise<void>
    onUpdateEvent?: (eventId: string, type: string, startDate: string, endDate: string) => Promise<void>
    onDeleteEvent?: (eventId: string) => Promise<void>
}

const PromoEditDialog: React.FC<PromoEditDialogProps> = (props) => {
    const { editingPromo, hasChanges, onClose } = props

    const [openCloseConfirm, setOpenCloseConfirm] = useState(false)

    // Fermeture demandée par la croix / ESC (au niveau de la card)
    const handleRequestClose = useCallback(() => {
        if (!hasChanges) {
            onClose()
            return
        }
        setOpenCloseConfirm(true)
    }, [hasChanges, onClose])

    // ESC au niveau de la card : ne ferme la card QUE si aucun popup de confirmation n’est ouvert
    useEffect(() => {
        if (!editingPromo) return

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
    }, [editingPromo, hasChanges, handleRequestClose])

    if (!editingPromo) return null

    const totals = computePromoTotals({
        id: '',
        label: '',
        students: editingPromo.students,
        startDate: '',
        endDate: '',
        groups: editingPromo.groups,
        specialties: editingPromo.specialties,
        constraints: editingPromo.constraints,
    })

    const handleSave = () => {
        props.onSubmit(editingPromo)
    }

    const handleConfirmSaveAndClose = () => {
        setOpenCloseConfirm(false)
        handleSave()
        props.onClose()
    }

    const handleDiscardAndClose = () => {
        setOpenCloseConfirm(false)
        props.onClose()
    }

    const handleCloseConfirmPopupOnly = () => {
        setOpenCloseConfirm(false)
    }

    return (
        <div className="promo-edit-overlay">
            <form
                className="card promo-edit-card"
                onSubmit={(e) => e.preventDefault()}
            >
                {/* Croix en haut à droite */}
                <button
                    type="button"
                    className="promo-edit-close"
                    onClick={handleRequestClose}
                    aria-label="Fermer la fenêtre de modification"
                >
                    ✕
                </button>

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
                            idPromo={editingPromo.promoId}
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
                        promoIsApprentissage={false} // Default value, should be passed from parent
                        constraints={props.constraints}
                        onAddConstraint={props.onAddConstraint}
                        onRemoveConstraint={props.onRemoveConstraint}
                        onUpdateConstraintRange={props.onUpdateConstraintRange}
                        onUpdateEvent={props.onUpdateEvent}
                        onDeleteEvent={props.onDeleteEvent}
                        promoId={editingPromo.promoId}
                    />
                </div>

                {(totals.groupsMismatch || totals.specialtiesMismatch) && (
                    <div className="promo-mismatch-block">
                        {totals.groupsMismatch && (
                            <p className="promo-mismatch">
                                Le total des groupes est {totals.groupsTotal} pour{' '}
                                {totals.totalStudents}.
                            </p>
                        )}
                        {totals.specialtiesMismatch && (
                            <p className="promo-mismatch">
                                Le total des spécialités est {totals.specialtiesTotal} pour{' '}
                                {totals.totalStudents}.
                            </p>
                        )}
                    </div>
                )}

                <div className="promo-edit-actions">
                    <ActionButtonsWithConfirm
                        onCancel={props.onClose}
                        onSave={handleSave}
                        hasChanges={props.hasChanges}
                        confirmMessage={
                            <>
                                Vous êtes sur le point d’enregistrer les modifications
                                apportées à la promotion{' '}
                                <strong>{editingPromo.name}</strong>.
                                <br />
                                Confirmer&nbsp;?
                            </>
                        }
                        confirmLabel="Enregistrer"
                        cancelLabel="Annuler"
                        cancelDirtyTitle="Modifications non enregistrées"
                        cancelDirtyMessage={
                            <>
                                <p>Vous avez modifié cette promotion.</p>
                                <p>
                                    Souhaitez-vous enregistrer les changements avant de
                                    fermer&nbsp;?
                                </p>
                            </>
                        }
                        cancelDirtyConfirmLabel="Enregistrer et fermer"
                        cancelDirtyDiscardLabel="Fermer sans enregistrer"
                    />
                </div>
            </form>

            {/* Popup spécifique pour la croix / ESC card */}
            <ConfirmDialog
                open={openCloseConfirm}
                title="Modifications non enregistrées"
                message={
                    <>
                        <p>Vous avez modifié cette promotion.</p>
                        <p>Souhaitez-vous enregistrer les changements avant de fermer&nbsp;?</p>
                    </>
                }
                confirmLabel="Enregistrer et fermer"
                cancelLabel="Fermer sans enregistrer"
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                // ESC / croix / overlay → ferment juste ce popup
                onRequestClose={handleCloseConfirmPopupOnly}
            />
        </div>
    )
}

export default PromoEditDialog
