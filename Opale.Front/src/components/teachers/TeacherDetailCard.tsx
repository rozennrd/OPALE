// src/components/teachers/TeacherDetailCard.tsx
import { Teacher } from '../../models/Teachers'
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
    onTeacherUpdated?: (teacher: Teacher) => void
}

export default function TeacherDetailCard({
    teacher,
    onClose,
    onDelete,
    onTeacherUpdated,
}: TeacherDetailCardProps) {
    const isCreate = teacher.id === 'new-teacher'
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
    } = useTeacherDetail(teacher, {
        onTeacherSaved: onTeacherUpdated,
    })

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
            void (async () => {
                const saved = await handleSave()
                if (saved) onClose()
            })()
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    const getCampusLabel = (value?: string) => {
        if (!value) return 'Bordeaux'
        const lower = value.toLowerCase()
        if (lower.includes('bordeaux')) return 'Bordeaux'
        if (lower.includes('lille')) return 'Lille'
        if (lower.includes('châteauroux') || lower.includes('chateauroux')) {
            return 'Châteauroux'
        }
        return value
    }

    const sectionLabel =
        teacherDraft.category === 'Intervenant'
            ? 'Vacataire'
            : getCampusLabel(teacherDraft.campus)

    const teacherDisplayName = `${teacherDraft.firstName || 'Prénom'} ${teacherDraft.lastName || 'Nom'}`.trim()

    const cancelCreateTitle = 'Création non enregistrée'
    const cancelCreateMessage = (
        <>
            <p>
                Vous êtes en train de créer l&apos;enseignant{' '}
                <strong>{teacherDisplayName}</strong>.
            </p>
            <p>Souhaitez-vous créer avant de fermer ?</p>
        </>
    )

    const cancelEditTitle = 'Modifications non enregistrées'
    const cancelEditMessage = (
        <>
            <p>Vous avez modifié cette fiche d&apos;enseignant.</p>
            <p>Souhaitez-vous enregistrer les changements avant de fermer ?</p>
        </>
    )

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
                        title="Détail de l'enseignant"
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
                        onCancel={handleRequestClose}
                        onSave={() => {
                            void handleSave()
                        }}
                        onAfterSaveConfirm={onClose}
                        hideCancel
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
                        confirmTitle={
                            isCreate
                                ? 'Créer cet enseignant'
                                : 'Confirmer les modifications'
                        }
                        confirmMessage={
                            isCreate ? (
                                <>
                                    Vous êtes sur le point de créer l&apos;enseignant{' '}
                                    <strong>{teacherDisplayName}</strong>.
                                    <br />
                                    Confirmer ?
                                </>
                            ) : (
                                <>
                                    Vous êtes sur le point d&apos;enregistrer les
                                    modifications pour{' '}
                                    <strong>
                                        {teacherDraft.firstName}{' '}
                                        {teacherDraft.lastName}
                                    </strong>
                                    .
                                    <br />
                                    Confirmer ?
                                </>
                            )
                        }
                        confirmLabel={isCreate ? 'Créer' : 'Enregistrer'}
                        cancelLabel="Annuler"
                        saveLabel={isCreate ? 'Créer' : 'Enregistrer'}
                        cancelDirtyTitle={isCreate ? cancelCreateTitle : cancelEditTitle}
                        cancelDirtyMessage={isCreate ? cancelCreateMessage : cancelEditMessage}
                        cancelDirtyConfirmLabel={
                            isCreate ? 'Fermer et créer' : 'Enregistrer et fermer'
                        }
                        cancelDirtyDiscardLabel={
                            isCreate ? 'Fermer sans créer' : 'Fermer sans enregistrer'
                        }
                    />
                </div>
            </DetailCardBody>

            <ConfirmDialog
                open={isConfirmOpen}
                title={isCreate ? cancelCreateTitle : cancelEditTitle}
                message={isCreate ? cancelCreateMessage : cancelEditMessage}
                confirmLabel={
                    isCreate ? 'Fermer et créer' : 'Enregistrer et fermer'
                }
                cancelLabel={
                    isCreate ? 'Fermer sans créer' : 'Fermer sans enregistrer'
                }
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />
        </div>
    )
}



