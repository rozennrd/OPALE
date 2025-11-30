// src/components/teachers/section/TeacherSubjectsColumn.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'

type SubjectField = 'name' | 'promo'

interface TeacherSubjectsColumnProps {
    subjects: Teacher['subjects'] | undefined
    onSubjectChange: (index: number, field: SubjectField, value: string) => void
    onAddSubject: () => void
    onRemoveSubject: (index: number) => void
}

const TeacherSubjectsColumn: React.FC<TeacherSubjectsColumnProps> = ({
                                                                         subjects,
                                                                         onSubjectChange,
                                                                         onAddSubject,
                                                                         onRemoveSubject,
                                                                     }) => {
    return (
        <div className="teacher-detail-col">
            <h4>Matières enseignées</h4>

            {subjects && subjects.length > 0 ? (
                <ul className="teacher-subjects-edit-list">
                    {subjects.map((subject, index) => (
                        <li key={index} className="teacher-subject-row">
                            <input
                                className="teacher-subject-input teacher-subject-input-name"
                                placeholder="Matière"
                                value={subject.name}
                                onChange={(e) =>
                                    onSubjectChange(index, 'name', e.target.value)
                                }
                            />
                            {/*<span className="teacher-subject-sep">•</span>*/}
                            <input
                                className="teacher-subject-input teacher-subject-input-promo"
                                placeholder="Promo"
                                value={subject.promo}
                                onChange={(e) =>
                                    onSubjectChange(index, 'promo', e.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="teacher-subject-remove"
                                onClick={() => onRemoveSubject(index)}
                                aria-label="Supprimer cette matière"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="teacher-detail-muted">
                    Aucune matière associée pour l’instant.
                </p>
            )}

            <button
                type="button"
                className="teacher-subject-add-btn"
                onClick={onAddSubject}
            >
                + Ajouter une matière
            </button>
        </div>
    )
}

export default TeacherSubjectsColumn