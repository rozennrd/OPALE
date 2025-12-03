// src/components/teachers/section/TeacherInfoColumn.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'

interface TeacherInfoColumnProps {
    teacher: Teacher
    onInfoChange: (field: keyof Teacher, value: string) => void
}

const TeacherInfoColumn: React.FC<TeacherInfoColumnProps> = ({ teacher, onInfoChange }) => {
    return (
        <div className="teacher-detail-col">
            <h4>Informations</h4>

            <dl className="teacher-detail-list">
                <div className="teacher-detail-item">
                    <dt>Nom</dt>
                    <dd>
                        <input
                            className="teacher-detail-input"
                            value={teacher.lastName}
                            onChange={(e) => onInfoChange('lastName', e.target.value)}
                        />
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Prénom</dt>
                    <dd>
                        <input
                            className="teacher-detail-input"
                            value={teacher.firstName}
                            onChange={(e) => onInfoChange('firstName', e.target.value)}
                        />
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Téléphone</dt>
                    <dd>
                        <input
                            className="teacher-detail-input"
                            type="tel"
                            value={teacher.phone}
                            onChange={(e) => onInfoChange('phone', e.target.value)}
                        />
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Email</dt>
                    <dd>
                        <input
                            className="teacher-detail-input"
                            type="email"
                            value={teacher.email || ''}
                            onChange={(e) => onInfoChange('email', e.target.value)}
                        />
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Type</dt>
                    <dd>
                        <select
                            className="teacher-detail-select"
                            value={teacher.mode}
                            onChange={(e) =>
                                onInfoChange('mode', e.target.value as Teacher['mode'])
                            }
                        >
                            <option value="PRESENTIEL">Présentiel</option>
                            <option value="DISTANCIEL">Distanciel</option>
                            <option value="HYBRIDE">Hybride</option>
                        </select>
                    </dd>
                </div>
            </dl>
        </div>
    )
}

export default TeacherInfoColumn