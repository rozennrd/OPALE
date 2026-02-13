// src/components/promotions/constraints/ConstraintPill.tsx
import React from 'react'
import { DateRange } from '../../../models'
import DateRangePill from '../../common/DateRangePill'

interface ConstraintPillProps {
    type: string
    title: string
    pillClass: string
    range: DateRange
    isEditing: boolean
    onRangeClick: (type: string, id: string) => void
    onRangeDateChange: (type: string, id: string, field: 'start' | 'end', value: string) => void
    onRemoveRange: (type: string, id: string) => void
    canRemove?: boolean
}

const ConstraintPill: React.FC<ConstraintPillProps> = ({
                                                           type,
                                                           title,
                                                           pillClass,
                                                           range,
                                                           isEditing,
                                                           onRangeClick,
                                                           onRangeDateChange,
                                                           onRemoveRange,
                                                           canRemove = true,
                                                       }) => {
    return (
        <DateRangePill
            range={range}
            isEditing={isEditing}
            pillClass={pillClass}                // ex: "constraint-pill-vacances"
            rootClassName="constraint-pill"      // ⬅️ style promos existant
            canRemove={canRemove}
            ariaRemoveLabel={`Supprimer cette plage ${title}`}
            onClick={(id) => onRangeClick(type, id)}
            onDateChange={(id, field, value) =>
                onRangeDateChange(type, id, field, value)
            }
            onRemove={(id) => onRemoveRange(type, id)}
        />
    )
}

export default ConstraintPill