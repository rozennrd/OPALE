// src/components/common/DateRangePill.tsx
import React from 'react'
import { DateRange } from '../../models'

export interface DateRangePillProps {
    range: DateRange
    isEditing: boolean
    pillClass?: string
    rootClassName?: string
    onClick?: (id: string) => void
    onDateChange?: (id: string, field: 'start' | 'end', value: string) => void
    onRemove?: (id: string) => void
    canRemove?: boolean
    ariaRemoveLabel?: string
}

const DateRangePill: React.FC<DateRangePillProps> = ({
                                                         range,
                                                         isEditing,
                                                         pillClass,
                                                         rootClassName,
                                                         onClick,
                                                         onDateChange,
                                                         onRemove,
                                                         canRemove = true,
                                                         ariaRemoveLabel,
                                                     }) => {
    const formatDateLabel = (iso: string): string => {
        if (!iso) return 'jj/mm/aaaa'
        const [y, m, d] = (iso || '').split('-')
        if (!y || !m || !d) return 'jj/mm/aaaa'
        return `${d}/${m}/${y}`
    }

    const formatRangeLabel = (range: DateRange): string =>
        `${formatDateLabel(range.start)} - ${formatDateLabel(range.end)}`

    const rootClasses = [
        'date-range-pill',   // style générique
        rootClassName,       // ex: "constraint-pill" pour les promos
        pillClass,           // ex: "constraint-pill-vacances"
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={rootClasses}>
            <button
                type="button"
                className="date-range-pill-main constraint-pill-main"
                onClick={() => onClick?.(range.id)}
            >
                {isEditing ? (
                    <div className="date-range-pill-editor constraint-pill-editor">
                        <input
                            type="date"
                            className="date-range-date-input constraint-date-input"
                            value={range.start || ''}
                            onChange={(e) =>
                                onDateChange?.(range.id, 'start', e.target.value)
                            }
                        />
                        <span className="date-range-date-separator constraint-date-separator">
                            -
                        </span>
                        <input
                            type="date"
                            className="date-range-date-input constraint-date-input"
                            value={range.end || ''}
                            onChange={(e) =>
                                onDateChange?.(range.id, 'end', e.target.value)
                            }
                        />
                    </div>
                ) : (
                    formatRangeLabel(range)
                )}
            </button>

            {canRemove && onRemove && (
                <button
                    type="button"
                    className="date-range-pill-remove constraint-pill-remove"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove(range.id)
                    }}
                    aria-label={ariaRemoveLabel}
                >
                    −
                </button>
            )}
        </div>
    )
}

export default DateRangePill