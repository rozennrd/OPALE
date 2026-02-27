import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type DateInputMode = 'date' | 'datetime'

interface DateInputProps {
    value: string
    onChange: (value: string) => void
    mode?: DateInputMode
    className?: string
    inputClassName?: string
    placeholder?: string
    disabled?: boolean
    min?: string
    max?: string
    minuteStep?: number
    ariaLabel?: string
}

type MonthState = { year: number; month: number }

type CalendarCell = {
    iso: string
    day: number
    isOutside: boolean
    month: number
    year: number
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const buildIsoDate = (year: number, month: number, day: number) =>
    `${year}-${pad2(month)}-${pad2(day)}`

const extractDate = (value: string): string => {
    if (!value) return ''
    const trimmed = value.trim()
    const datePart = trimmed.split('T')[0].split(' ')[0]
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : ''
}

const extractTime = (value: string): string => {
    if (!value) return ''
    const trimmed = value.trim()
    const timePart = trimmed.includes('T')
        ? trimmed.split('T')[1]
        : trimmed.split(' ')[1]
    if (!timePart) return ''
    const trimmedTime = timePart.slice(0, 5)
    return /^\d{2}:\d{2}$/.test(trimmedTime) ? trimmedTime : ''
}

const dateToNumber = (isoDate: string): number => {
    const [y, m, d] = isoDate.split('-').map((part) => Number(part))
    return y * 10000 + m * 100 + d
}

const formatDateLabel = (iso: string): string => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    if (!y || !m || !d) return ''
    return `${d}/${m}/${y}`
}

const formatDateTimeLabel = (value: string): string => {
    const datePart = extractDate(value)
    if (!datePart) return ''
    const timePart = extractTime(value)
    return timePart ? `${formatDateLabel(datePart)} ${timePart}` : formatDateLabel(datePart)
}

const getTodayIso = (): string => {
    const now = new Date()
    return buildIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

const getDefaultTime = (): string => {
    const now = new Date()
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
}

const getInitialMonth = (value: string): MonthState => {
    const datePart = extractDate(value)
    if (datePart) {
        const [y, m] = datePart.split('-').map((part) => Number(part))
        if (y && m) return { year: y, month: m - 1 }
    }
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
}

const buildMonthDays = (year: number, month: number): CalendarCell[] => {
    const first = new Date(year, month, 1)
    const startIndex = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const cells: CalendarCell[] = []

    for (let i = 0; i < 42; i += 1) {
        const dayIndex = i - startIndex + 1
        let cellYear = year
        let cellMonth = month
        let day = dayIndex
        let isOutside = false

        if (dayIndex < 1) {
            cellMonth = month - 1
            if (cellMonth < 0) {
                cellMonth = 11
                cellYear -= 1
            }
            day = daysInPrevMonth + dayIndex
            isOutside = true
        } else if (dayIndex > daysInMonth) {
            cellMonth = month + 1
            if (cellMonth > 11) {
                cellMonth = 0
                cellYear += 1
            }
            day = dayIndex - daysInMonth
            isOutside = true
        }

        const iso = buildIsoDate(cellYear, cellMonth + 1, day)
        cells.push({
            iso,
            day,
            isOutside,
            month: cellMonth,
            year: cellYear,
        })
    }

    return cells
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    mode = 'date',
    className,
    inputClassName,
    placeholder,
    disabled = false,
    min,
    max,
    minuteStep = 1,
    ariaLabel,
}) => {
    const popoverId = useId()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
    const [activeMonth, setActiveMonth] = useState<MonthState>(() =>
        getInitialMonth(value),
    )
    const timeFromValue = extractTime(value)
    const [time, setTime] = useState(() => timeFromValue || getDefaultTime())

    const selectedDate = useMemo(() => extractDate(value), [value])
    const todayIso = useMemo(() => getTodayIso(), [])

    const minDate = extractDate(min ?? '')
    const maxDate = extractDate(max ?? '')
    const minKey = minDate ? dateToNumber(minDate) : null
    const maxKey = maxDate ? dateToNumber(maxDate) : null

    useEffect(() => {
        if (timeFromValue) {
            setTime(timeFromValue)
        }
    }, [timeFromValue])

    useEffect(() => {
        if (!isOpen) {
            setActiveMonth(getInitialMonth(value))
        }
    }, [isOpen, value])

    useEffect(() => {
        if (!isOpen) return

        const updatePosition = () => {
            const rect = wrapperRef.current?.getBoundingClientRect() ?? null
            setAnchorRect(rect)
        }

        updatePosition()

        const handleScroll = (event: Event) => {
            const target = event.target as Node | null
            if (target) {
                if (popoverRef.current?.contains(target)) return
                if (wrapperRef.current?.contains(target)) return
            }
            setIsOpen(false)
        }
        const handleResize = () => updatePosition()

        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', handleResize)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            if (wrapperRef.current?.contains(target)) return
            if (popoverRef.current?.contains(target)) return
            setIsOpen(false)
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('mousedown', handlePointerDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('mousedown', handlePointerDown)
        }
    }, [isOpen])

    const displayValue =
        mode === 'datetime'
            ? formatDateTimeLabel(value)
            : formatDateLabel(selectedDate)

    const openPicker = () => {
        if (disabled) return
        setIsOpen(true)
    }

    const closePicker = () => setIsOpen(false)

    const updateDate = (isoDate: string, shouldClose: boolean) => {
        if (mode === 'date') {
            onChange(isoDate)
            if (shouldClose) closePicker()
            return
        }
        const nextTime = time || getDefaultTime()
        onChange(`${isoDate}T${nextTime}`)
        if (shouldClose) closePicker()
    }

    const updateTime = (nextHour: string, nextMinute: string) => {
        const nextTime = `${nextHour}:${nextMinute}`
        setTime(nextTime)
        const baseDate = selectedDate || todayIso
        if (mode === 'datetime') {
            onChange(`${baseDate}T${nextTime}`)
        }
    }

    const days = useMemo(
        () => buildMonthDays(activeMonth.year, activeMonth.month),
        [activeMonth],
    )

    const hourOptions = useMemo(
        () => Array.from({ length: 24 }, (_, i) => pad2(i)),
        [],
    )

    const minuteOptions = useMemo(() => {
        const step = Math.max(1, Math.min(60, minuteStep))
        const steps = Math.ceil(60 / step)
        return Array.from({ length: steps }, (_, i) => pad2(i * step))
    }, [minuteStep])

    const [selectedHour, selectedMinute] = time.split(':')

    const handleDayClick = (
        isoDate: string,
        isOutside: boolean,
        month: number,
        year: number,
    ) => {
        if (isOutside) {
            setActiveMonth({ year, month })
        }
        updateDate(isoDate, mode === 'date')
    }

    const handleClear = () => {
        onChange('')
        closePicker()
    }

    const handleToday = () => {
        if (mode === 'datetime') {
            onChange(`${todayIso}T${getDefaultTime()}`)
        } else {
            onChange(todayIso)
        }
        closePicker()
    }

    const handleValidate = () => {
        closePicker()
    }

    const moveMonth = (direction: number) => {
        setActiveMonth((prev) => {
            const nextMonth = prev.month + direction
            if (nextMonth < 0) {
                return { year: prev.year - 1, month: 11 }
            }
            if (nextMonth > 11) {
                return { year: prev.year + 1, month: 0 }
            }
            return { year: prev.year, month: nextMonth }
        })
    }

    const popoverStyle = (() => {
        if (!anchorRect) {
            return { position: 'fixed' as const, top: 0, left: 0 }
        }
        const padding = 12
        const estimatedWidth = mode === 'datetime' ? 420 : 300
        const viewportWidth =
            typeof window === 'undefined' ? anchorRect.left + estimatedWidth : window.innerWidth
        const maxLeft = Math.max(padding, viewportWidth - estimatedWidth - padding)
        const left = Math.min(anchorRect.left, maxLeft)
        return {
            position: 'fixed' as const,
            top: anchorRect.bottom + 6,
            left,
        }
    })()

    const popover = isOpen
        ? createPortal(
              <div
                  className={[
                      'calendar-popover',
                      mode === 'datetime' ? 'calendar-popover--datetime' : '',
                  ]
                      .filter(Boolean)
                      .join(' ')}
                  style={popoverStyle}
                  id={popoverId}
                  ref={popoverRef}
                  role="dialog"
                  aria-modal="false"
              >
                  <div className="calendar-body">
                      <div className="calendar-core">
                          <div className="calendar-header">
                              <button
                                  type="button"
                                  className="calendar-nav"
                                  onClick={() => moveMonth(-1)}
                                  aria-label="Mois precedent"
                              >
                                  {'<'}
                              </button>
                              <div className="calendar-month">
                                  {new Date(activeMonth.year, activeMonth.month, 1)
                                      .toLocaleDateString('fr-FR', {
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                      .replace(/^\w/, (c) => c.toUpperCase())}
                              </div>
                              <button
                                  type="button"
                                  className="calendar-nav"
                                  onClick={() => moveMonth(1)}
                                  aria-label="Mois suivant"
                              >
                                  {'>'}
                              </button>
                          </div>

                          <div className="calendar-weekdays">
                              {WEEKDAYS.map((day) => (
                                  <span key={day}>{day}</span>
                              ))}
                          </div>

                          <div className="calendar-grid">
                              {days.map((cell) => {
                                  const key = dateToNumber(cell.iso)
                                  const isDisabled =
                                      (minKey !== null && key < minKey) ||
                                      (maxKey !== null && key > maxKey)
                                  const isSelected = cell.iso === selectedDate
                                  const isToday = cell.iso === todayIso
                                  return (
                                      <button
                                          key={`${cell.iso}-${cell.day}`}
                                          type="button"
                                          className={[
                                              'calendar-day',
                                              cell.isOutside ? 'calendar-day--outside' : '',
                                              isSelected ? 'calendar-day--selected' : '',
                                              isToday ? 'calendar-day--today' : '',
                                              isDisabled ? 'calendar-day--disabled' : '',
                                          ]
                                              .filter(Boolean)
                                              .join(' ')}
                                          disabled={isDisabled}
                                          onClick={() =>
                                              handleDayClick(
                                                  cell.iso,
                                                  cell.isOutside,
                                                  cell.month,
                                                  cell.year,
                                              )
                                          }
                                          aria-selected={isSelected}
                                      >
                                          {cell.day}
                                      </button>
                                  )
                              })}
                          </div>
                      </div>

                      {mode === 'datetime' && (
                          <div className="calendar-time">
                              <div className="calendar-time-header">Heure</div>
                              <div className="calendar-time-column">
                                  {hourOptions.map((hour) => (
                                      <button
                                          key={hour}
                                          type="button"
                                          className={[
                                              'calendar-time-item',
                                              hour === selectedHour
                                                  ? 'calendar-time-item--active'
                                                  : '',
                                          ]
                                              .filter(Boolean)
                                              .join(' ')}
                                          onClick={() => updateTime(hour, selectedMinute || '00')}
                                      >
                                          {hour}
                                      </button>
                                  ))}
                              </div>

                              <div className="calendar-time-header">Min</div>
                              <div className="calendar-time-column">
                                  {minuteOptions.map((minute) => (
                                      <button
                                          key={minute}
                                          type="button"
                                          className={[
                                              'calendar-time-item',
                                              minute === selectedMinute
                                                  ? 'calendar-time-item--active'
                                                  : '',
                                          ]
                                              .filter(Boolean)
                                              .join(' ')}
                                          onClick={() => updateTime(selectedHour || '00', minute)}
                                      >
                                          {minute}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="calendar-footer">
                      <div className="calendar-footer-left">
                          <button
                              type="button"
                              className="calendar-action"
                              onClick={handleClear}
                          >
                              Effacer
                          </button>
                          <button
                              type="button"
                              className="calendar-action"
                              onClick={handleToday}
                          >
                              Aujourd'hui
                          </button>
                      </div>
                      <button
                          type="button"
                          className="calendar-action calendar-action--primary"
                          onClick={handleValidate}
                      >
                          Valider
                      </button>
                  </div>
              </div>,
              document.body,
          )
        : null

    return (
        <div className={['date-input', className].filter(Boolean).join(' ')} ref={wrapperRef}>
            <input
                type="text"
                className={['date-input-field', inputClassName].filter(Boolean).join(' ')}
                value={displayValue}
                placeholder={
                    placeholder ??
                    (mode === 'datetime' ? 'jj/mm/aaaa hh:mm' : 'jj/mm/aaaa')
                }
                onClick={openPicker}
                onFocus={openPicker}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openPicker()
                    }
                }}
                readOnly
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={popoverId}
            />
            <button
                type="button"
                className="date-input-button"
                onClick={openPicker}
                disabled={disabled}
                aria-label="Ouvrir le calendrier"
            >
                <svg
                    className="date-input-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <rect x="3" y="4" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="8" y1="2.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="2.5" x2="16" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </button>
            {popover}
        </div>
    )
}

export default DateInput
