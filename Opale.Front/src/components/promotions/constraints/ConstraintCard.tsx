// src/components/promotions/constraints/ConstraintCard.jsx
import React from 'react'
import ConstraintPill from './ConstraintPill.jsx'

export default function ConstraintCard({
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
                                       }) {
    return (
        <div className={cardClass}>
            <div className="constraint-card-header">
                <span className="constraint-title">{title}</span>
                <button
                    type="button"
                    className="constraint-add-btn"
                    onClick={() => onAddConstraint && onAddConstraint(type)}
                    aria-label={`Ajouter une contrainte ${title}`}
                >
                    +
                </button>
            </div>

            <div className="constraint-tags">
                {ranges.map((range) => {
                    const isEditing =
                        editingRange &&
                        editingRange.type === type &&
                        editingRange.id === range.id

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