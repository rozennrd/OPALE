// src/components/teachers/TeacherCard.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherModeBadge from './TeacherModeBadge'
import icTel from '../../assets/ic-tel.png'
import EntityCard from '../common/EntityCard'

interface TeacherCardProps {
    teacher: Teacher
    onSelect: () => void
}

export default function TeacherCard({ teacher, onSelect }: TeacherCardProps) {
    return (
        <EntityCard
            onClick={onSelect}
            className="teacher-card"
            mainClassName="teacher-card-main"
            asideClassName="teacher-card-mode"
            badge={<TeacherModeBadge mode={teacher.mode} />}
            variant="compact" // par ex., un peu plus serré
        >
            <div className="teacher-card-name">
                {teacher.lastName.toUpperCase()} {teacher.firstName}
            </div>
            <div className="teacher-card-phone">
                <img
                    src={icTel}
                    alt=""
                    className="teacher-card-phone-icon"
                />
                {teacher.phone}
            </div>
        </EntityCard>
    )
}