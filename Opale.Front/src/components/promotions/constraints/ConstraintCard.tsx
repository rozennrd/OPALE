// src/components/promotions/constraints/ConstraintCard.tsx
import React from 'react'
import ConstraintPill from './ConstraintPill'
import { DateRange } from '../../../models'

interface EditingRange {
    type: string
    id: string
}

interface ConstraintCardProps {
    type: string
    title: string
    cardClass: string
    pillClass: string
    ranges: DateRange[]
    editingRange: EditingRange | null
    onRangeClick: (type: string, id: string) => void
    onRangeDateChange: (type: string, id: string, field: 'start' | 'end', value: string) => void
    onRemoveRange: (type: string, id: string) => void
    onAddConstraint: (type: string) => void
    canRemove?: boolean
}

const ConstraintCard: React.FC<ConstraintCardProps> = ({
    type,
    title,
    cardClass,
    pillClass,
    ranges,
    editingRange,
    onRangeClick,
    onRangeDateChange,
    onRemoveRange,
    onAddConstraint,
    canRemove = true,
}) => {
    return (
        <div className={cardClass}>
            <div className="constraint-card-header">
                <span className="constraint-title">{title}</span>
                <button
                    type="button"
                    className="constraint-add-btn"
                    onClick={() => onAddConstraint(type)}
                    aria-label={`Ajouter une contrainte ${title}`}
                >
                    +
                </button>
            </div>

            <div className="constraint-tags">
                {ranges.map((range) => {
                    const isEditing =
                        !!(editingRange &&
                        editingRange.type === type &&
                        editingRange.id === range.id)

                    return (
                        <ConstraintPill
                            key={range.id}
                            type={type}
                            title={title}
                            pillClass={pillClass}
                            range={range}
                            isEditing={isEditing}
                            onRangeClick={onRangeClick}
                            onRangeDateChange={onRangeDateChange}
                            onRemoveRange={onRemoveRange}
                            canRemove={canRemove}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default ConstraintCard
