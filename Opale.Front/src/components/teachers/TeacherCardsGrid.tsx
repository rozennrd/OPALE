// src/components/teachers/TeacherCardsGrid.tsx
import { Teacher } from '../../models/Teachers'
import TeacherCard from './TeacherCard'

interface TeacherCardsGridProps {
    teachers: Teacher[]
    onSelectTeacher: (t: Teacher) => void
    selectionMode?: boolean
    selectedTeacherIds?: Set<string>
    onToggleTeacherSelection?: (teacherId: string) => void
}

export default function TeacherCardsGrid({
    teachers,
    onSelectTeacher,
    selectionMode = false,
    selectedTeacherIds,
    onToggleTeacherSelection,
}: TeacherCardsGridProps) {
    return (
        <div className="teacher-cards-grid">
            {teachers.map((teacher) => (
                <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onSelect={() => onSelectTeacher(teacher)}
                    selectionMode={selectionMode}
                    selected={selectedTeacherIds?.has(teacher.id) ?? false}
                    onToggleSelect={() => {
                        if (onToggleTeacherSelection) {
                            onToggleTeacherSelection(teacher.id)
                        }
                    }}
                />
            ))}
        </div>
    )
}
