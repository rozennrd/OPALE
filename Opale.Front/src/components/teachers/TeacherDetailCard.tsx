// src/components/teachers/TeacherDetailCard.tsx

import React, { useState } from 'react'
import { Teacher } from '../../models/Teacher'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import TeacherInfoColumn from './section/TeacherInfoColumn'
import TeacherSubjectsColumn from './section/TeacherSubjectsColumn'
import TeacherAvailabilityColumn from './section/TeacherAvailabilityColumn'
import { useTeacherDetail } from '../../hooks/teachers/useTeacherDetail'
import TeacherModeBadge from './TeacherModeBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardBody from '../common/DetailCardBody'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'

interface TeacherDetailCardProps {
    teacher: Teacher
    onClose: () => void
}

export default function TeacherDetailCard({
                                              teacher,
                                              onClose,
                                          }: TeacherDetailCardProps) {
    const {
        teacherDraft,
        periods,
        selectedPeriodId,
        handleInfoChange,
        handleSubjectChange,
        handleAddSubject,
        handleRemoveSubject,
        handleToggleSlot,
        handleSelectPeriod,
        handleAddPeriod,
        handleRemovePeriod,
        handlePeriodDateChange,
        handleSave,
        hasChanges,
    } = useTeacherDetail(teacher)

    const {
        handleRequestClose,
        isConfirmOpen,
        handleConfirmSaveAndClose,
        handleDiscardAndClose,
        handleConfirmDialogRequestClose,
    } = useDetailDirtyClose({
        hasChanges,
        onClose,
        onSaveAndClose: () => {
            handleSave()
            onClose()
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    return (
        <div className="teacher-detail-overlay" role="dialog" aria-modal="true">
            <DetailCardBody className="teacher-detail-card">
                <DetailCardHeader
                    onClose={handleRequestClose}
                    closeAriaLabel="Fermer la fiche enseignant"
                    closeButtonClassName="teacher-detail-close"
                    headerClassName="teacher-detail-header-badge"
                >
                    <TeacherModeBadge
                        mode={teacherDraft.mode}
                        variant="header"
                        title="Détail enseignant"
                        subtitle={`${teacherDraft.lastName.toUpperCase()} ${teacherDraft.firstName}`}
                        className="teacher-detail-header-badge"
                    />
                </DetailCardHeader>

                <div className="teacher-detail-columns">
                    <TeacherInfoColumn
                        teacher={teacherDraft}
                        onInfoChange={handleInfoChange}
                    />

                    <TeacherSubjectsColumn
                        subjects={teacherDraft.subjects}
                        onSubjectChange={handleSubjectChange}
                        onAddSubject={handleAddSubject}
                        onRemoveSubject={handleRemoveSubject}
                    />

                    <TeacherAvailabilityColumn
                        periods={periods}
                        selectedPeriodId={selectedPeriodId}
                        onSelectPeriod={handleSelectPeriod}
                        onAddPeriod={handleAddPeriod}
                        onRemovePeriod={handleRemovePeriod}
                        onToggleSlot={handleToggleSlot}
                        onPeriodDateChange={handlePeriodDateChange}
                    />
                </div>

                <div className="teacher-detail-footer">
                    <ActionButtonsWithConfirm
                        onCancel={onClose}
                        onSave={handleSave}
                        hasChanges={hasChanges}
                        confirmMessage={
                            <>
                                Vous êtes sur le point d’enregistrer les
                                modifications pour{' '}
                                <strong>
                                    {teacherDraft.firstName}{' '}
                                    {teacherDraft.lastName}
                                </strong>
                                .
                                <br />
                                Confirmer ?
                            </>
                        }
                        confirmLabel="Enregistrer"
                        cancelLabel="Annuler"
                    />
                </div>
            </DetailCardBody>

            {/* Popup spécifique ESC / croix */}
            <ConfirmDialog
                open={isConfirmOpen}
                title="Modifications non enregistrées"
                message={
                    <>
                        <p>Vous avez modifié cette fiche enseignant.</p>
                        <p>
                            Souhaitez-vous enregistrer les changements avant de
                            fermer&nbsp;?
                        </p>
                    </>
                }
                confirmLabel="Enregistrer et fermer"
                cancelLabel="Fermer sans enregistrer"
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />
        </div>
    )
}