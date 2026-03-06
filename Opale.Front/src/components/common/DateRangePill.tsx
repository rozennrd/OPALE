// src/components/common/DateRangePill.tsx
import React from 'react'
import { DateRange } from '../../models'
import DateInput from './DateInput'

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

    const rootClasses = [
        'date-range-pill',   // style générique
        isEditing ? 'date-range-pill--editing' : 'date-range-pill--readonly',
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
                        <DateInput
                            value={range.start || ''}
                            onChange={(value) =>
                                onDateChange?.(range.id, 'start', value)
                            }
                            inputClassName="date-range-date-input constraint-date-input"
                            max={range.end || undefined}
                        />
                        <span className="date-range-date-separator constraint-date-separator">
                            -
                        </span>
                        <DateInput
                            value={range.end || ''}
                            onChange={(value) =>
                                onDateChange?.(range.id, 'end', value)
                            }
                            inputClassName="date-range-date-input constraint-date-input"
                            min={range.start || undefined}
                        />
                    </div>
                ) : (
                    <span className="date-range-pill-dates">
                        <span className="date-range-pill-date">
                            {formatDateLabel(range.start)}
                        </span>
                        <span className="date-range-pill-separator">-</span>
                        <span className="date-range-pill-date">
                            {formatDateLabel(range.end)}
                        </span>
                    </span>
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

