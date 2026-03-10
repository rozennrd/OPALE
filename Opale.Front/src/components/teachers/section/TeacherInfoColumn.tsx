// src/components/teachers/section/TeacherInfoColumn.tsx
import { Teacher } from '../../../models/Teachers'

interface TeacherInfoColumnProps {
    teacher: Teacher
    onInfoChange: (field: keyof Teacher, value: string) => void
}

const TeacherInfoColumn = ({ teacher, onInfoChange }: TeacherInfoColumnProps) => {
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
                    <dt>Email Junia</dt>
                    <dd>
                        <input
                            className="teacher-detail-input"
                            type="email"
                            value={teacher.emailJunia || ''}
                            onChange={(e) => onInfoChange('emailJunia', e.target.value)}
                        />
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Email perso</dt>
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
                            <option value="Présentiel">Présentiel</option>
                            <option value="Distanciel">Distanciel</option>
                            <option value="Hybride">Hybride</option>
                        </select>
                    </dd>
                </div>
                <div className="teacher-detail-item">
                    <dt>Rattachement</dt>
                    <dd>
                        <select
                            className="teacher-detail-select"
                            value={teacher.category || 'Permanent'}
                            onChange={(e) =>
                                onInfoChange('category', e.target.value as Teacher['category'])
                            }
                        >
                            <option value="Permanent">Interne</option>
                            <option value="Intervenant">Vacataire</option>
                            <option value="Invite">Invité</option>
                        </select>
                    </dd>
                </div>
                {teacher.category !== 'Intervenant' && (
                    <div className="teacher-detail-item">
                        <dt>Campus d&apos;origine</dt>
                        <dd>
                            <select
                                className="teacher-detail-select"
                                value={teacher.campus || 'Bordeaux'}
                                onChange={(e) => onInfoChange('campus', e.target.value)}
                            >
                                <option value="Bordeaux">Bordeaux</option>
                                <option value="Lille">Lille</option>
                                <option value="Châteauroux">Châteauroux</option>
                            </select>
                        </dd>
                    </div>
                )}
            </dl>
        </div>
    )
}

export default TeacherInfoColumn
