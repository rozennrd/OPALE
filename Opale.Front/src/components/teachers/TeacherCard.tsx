// src/components/teachers/TeacherCard.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherModeBadge from './TeacherModeBadge'

interface TeacherCardProps {
    teacher: Teacher
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
    const handleClick = () => {
        console.log('[TEACHERS] Click teacher card', teacher)
    }

    return (
        <article className="teacher-card" onClick={handleClick}>
            <div className="teacher-card-main">
                <div className="teacher-card-name">
                    {teacher.lastName.toUpperCase()} {teacher.firstName}
                </div>
                <div className="teacher-card-phone">
          <span className="teacher-card-phone-icon" aria-hidden="true">
            📞
          </span>
                    <span>{teacher.phone}</span>
                </div>
            </div>

            <div className="teacher-card-mode">
                <TeacherModeBadge mode={teacher.mode} />
            </div>
        </article>
    )
}