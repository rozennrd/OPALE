// src/components/teachers/TeacherCard.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherModeBadge from './TeacherModeBadge'
import icTel from '../../assets/ic-tel.png'

interface TeacherCardProps {
    teacher: Teacher
    onSelect: () => void
}

export default function TeacherCard({ teacher, onSelect }: TeacherCardProps) {
    const handleClick = () => {
        console.log('[TEACHERS] Click teacher card', teacher)
    }

    return (
        <article className="teacher-card" onClick={onSelect}>
            <div className="teacher-card-main">
                <div className="teacher-card-name">
                    {teacher.lastName.toUpperCase()} {teacher.firstName}
                </div>
                <div className="teacher-card-phone">
                    <img src={icTel} alt="" className="teacher-card-phone-icon"/>
                    {teacher.phone}
                </div>
            </div>

            <div className="teacher-card-mode">
                <TeacherModeBadge mode={teacher.mode} />
            </div>
        </article>
    )
}