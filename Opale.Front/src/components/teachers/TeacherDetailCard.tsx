// src/components/teachers/TeacherDetailCard.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import TeacherInfoColumn from './section/TeacherInfoColumn'
import TeacherSubjectsColumn from './section/TeacherSubjectsColumn'
import TeacherAvailabilityColumn from './section/TeacherAvailabilityColumn'
import { useTeacherDetail } from '../../hooks/teachers/useTeacherDetail'
import TeacherModeBadge from './TeacherModeBadge'

interface TeacherDetailCardProps {
    teacher: Teacher
    onClose: () => void
}

export default function TeacherDetailCard({ teacher, onClose }: TeacherDetailCardProps) {
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
    } = useTeacherDetail(teacher)

    return (
        <div className="teacher-detail-overlay">
            <div className="teacher-detail-card">
                {/*<button className="teacher-detail-close" onClick={onClose} aria-label="Fermer">*/}
                {/*    ✕*/}
                {/*</button>*/}

                {/* ✅ Pill header : titre + nom/prénom + type + icône à droite */}
                <TeacherModeBadge
                    mode={teacherDraft.mode}
                    variant="header"
                    title="Détail enseignant"
                    subtitle={`${teacherDraft.lastName.toUpperCase()} ${teacherDraft.firstName}`}
                    className="teacher-detail-header-badge"
                />

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
                        confirmMessage={
                            <>
                                Vous êtes sur le point d’enregistrer les modifications pour{' '}
                                <strong>
                                    {teacherDraft.firstName} {teacherDraft.lastName}
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
            </div>
        </div>
    )
}