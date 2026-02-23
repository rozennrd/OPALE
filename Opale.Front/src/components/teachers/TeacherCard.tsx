// src/components/teachers/TeacherCard.tsx
import { Teacher } from '../../models/Teachers'
import TeacherModeBadge from './TeacherModeBadge'
import icTel from '../../assets/ic-tel.png'
import EntityCard from '../common/EntityCard'

interface TeacherCardProps {
    teacher: Teacher
    onSelect: () => void
    selectionMode?: boolean
    selected?: boolean
    onToggleSelect?: () => void
}

export default function TeacherCard({
    teacher,
    onSelect,
    selectionMode = false,
    selected = false,
    onToggleSelect,
}: TeacherCardProps) {
    const handleClick = () => {
        if (selectionMode) {
            if (onToggleSelect) onToggleSelect()
            return
        }

        onSelect()
    }

    return (
        <EntityCard
            onClick={handleClick}
            className="teacher-card"
            mainClassName="teacher-card-main"
            asideClassName="teacher-card-mode"
            badge={<TeacherModeBadge mode={teacher.mode} />}
            variant="compact"
            selectionMode={selectionMode}
            selected={selected}
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
