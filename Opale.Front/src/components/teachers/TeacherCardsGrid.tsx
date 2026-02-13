// src/components/teachers/TeacherCardsGrid.tsx
import React from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherCard from './TeacherCard'

interface TeacherCardsGridProps {
    teachers: Teacher[]
    onSelectTeacher: (t: Teacher) => void
}

export default function TeacherCardsGrid({ teachers, onSelectTeacher }: TeacherCardsGridProps) {
    return (
        <div className="teacher-cards-grid">
            {teachers.map((teacher) => (
                <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onSelect={() => onSelectTeacher(teacher)}
                />
            ))}
        </div>
    )
}