// src/components/promotions/constraints/ConstraintPill.jsx
import React from 'react'

export default function ConstraintPill({
                                           type,
                                           title,
                                           pillClass,
                                           range,
                                           isEditing,
                                           onRangeClick,
                                           onRangeDateChange,
                                           onRemoveRange,
                                           canRemove = true,
                                       }) {
    const formatDateLabel = (iso) => {
        if (!iso) return 'jj/mm/aaaa'
        const [y, m, d] = (iso || '').split('-')
        if (!y || !m || !d) return 'jj/mm/aaaa'
        return `${d}/${m}/${y}`
    }

    const formatRangeLabel = (range) =>
        `${formatDateLabel(range.start)} - ${formatDateLabel(range.end)}`

    return (
        <div className={`constraint-pill ${pillClass}`}>
            <button
                type="button"
                className="constraint-pill-main"
                onClick={() => onRangeClick(type, range.id)}
            >
                {isEditing ? (
                    <div className="constraint-pill-editor">
                        <input
                            type="date"
                            className="constraint-date-input"
                            value={range.start || ''}
                            onChange={(e) =>
                                onRangeDateChange(
                                    type,
                                    range.id,
                                    'start',
                                    e.target.value
                                )
                            }
                        />
                        <span className="constraint-date-separator">-</span>
                        <input
                            type="date"
                            className="constraint-date-input"
                            value={range.end || ''}
                            onChange={(e) =>
                                onRangeDateChange(
                                    type,
                                    range.id,
                                    'end',
                                    e.target.value
                                )
                            }
                        />
                    </div>
                ) : (
                    formatRangeLabel(range)
                )}
            </button>

            {canRemove && (
                <button
                    type="button"
                    className="constraint-pill-remove"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemoveRange(type, range.id)
                    }}
                    aria-label={`Supprimer cette plage ${title}`}
                >
                    −
                </button>
            )}
        </div>
    )
}