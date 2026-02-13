// src/components/teachers/TeacherSection.tsx
import React, { useState } from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherCardsGrid from './TeacherCardsGrid'
import SectionHeader from '../common/SectionHeader'

interface TeacherSectionProps {
    title: string
    teachers: Teacher[]
    onSelectTeacher: (t: Teacher) => void
}

export default function TeacherSection({ title, teachers, onSelectTeacher }: TeacherSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleToggle = () => {
        const next = !isOpen
        setIsOpen(next)
        console.log(`[TEACHERS] Toggle section "${title}" →`, next ? 'open' : 'closed')
    }

    return (
        <section className="teacher-section">
            <SectionHeader
                title={title}
                isOpen={isOpen}
                onToggle={handleToggle}
                wrapperClassName="teacher-section-header"
                titleClassName="teacher-section-title"
                chevronClassName="teacher-section-chevron"
            />

            {isOpen && (
                <div className="teacher-section-body">
                    {teachers.length > 0 ? (
                        <TeacherCardsGrid teachers={teachers} onSelectTeacher={onSelectTeacher} />
                    ) : (
                        <div className="teacher-empty-state">
                            Aucun enseignant dans cette section.
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}