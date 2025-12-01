// src/components/teachers/TeacherCardsGrid.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherCard from './TeacherCard'

interface TeacherCardsGridProps {
    teachers: Teacher[]
}

export default function TeacherCardsGrid({ teachers }: TeacherCardsGridProps) {
    return (
        <div className="teacher-cards-grid">
            {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
        </div>
    )
}