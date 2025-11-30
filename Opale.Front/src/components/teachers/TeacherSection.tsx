// src/components/teachers/TeacherSection.tsx
import React, { useState } from 'react'
import { Teacher } from '../../models/Teacher'
import TeacherCardsGrid from './TeacherCardsGrid'

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
            <button
                type="button"
                // className="teacher-section-header"
                className={`teacher-section-header ${isOpen ? 'is-open' : ''}`}
                onClick={handleToggle}
            >
                <span className="teacher-section-title">{title}</span>

                <span
                    className={`teacher-section-chevron ${isOpen ? 'is-open' : ''}`}
                    aria-hidden="true"
                >
          ▾
        </span>
            </button>

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