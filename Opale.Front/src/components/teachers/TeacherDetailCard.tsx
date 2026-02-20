// src/components/teachers/TeacherDetailCard.tsx
import React from 'react'
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
    onDelete?: () => void
}

export default function TeacherDetailCard({
    teacher,
    onClose,
    onDelete,
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

    const getCampusLabel = (value?: string) => {
        if (!value) return 'Bordeaux'
        const lower = value.toLowerCase()
        if (lower.includes('bordeaux')) return 'Bordeaux'
        if (lower.includes('lille')) return 'Lille'
        if (lower.includes('chateauroux')) {
            return 'Chateauroux'
        }
        return value
    }

    const sectionLabel =
        teacherDraft.category === 'VACATAIRE'
            ? 'Vacataire'
            : getCampusLabel(teacherDraft.campus)

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
                        title="Detail enseignant"
                        subtitle={`${teacherDraft.lastName.toUpperCase()} ${teacherDraft.firstName}`}
                        className="teacher-detail-header-badge"
                        sectionLabel={sectionLabel}
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
                        onDelete={
                            teacher.id === 'new-teacher' ? undefined : onDelete
                        }
                        deleteLabel="Supprimer"
                        deleteTitle="Supprimer cet enseignant"
                        deleteMessage={
                            <>
                                Vous allez supprimer{' '}
                                <strong>
                                    {teacherDraft.firstName}{' '}
                                    {teacherDraft.lastName}
                                </strong>
                                .
                                <br />
                                Confirmer ?
                            </>
                        }
                        deleteConfirmLabel="Supprimer"
                        hasChanges={hasChanges}
                        confirmMessage={
                            <>
                                Vous etes sur le point d&apos;enregistrer les
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

            <ConfirmDialog
                open={isConfirmOpen}
                title="Modifications non enregistrees"
                message={
                    <>
                        <p>Vous avez modifie cette fiche enseignant.</p>
                        <p>
                            Souhaitez-vous enregistrer les changements avant de
                            fermer ?
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
