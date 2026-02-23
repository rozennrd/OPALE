// src/components/teachers/section/TeacherAvailabilityColumn.tsx
import { useMemo } from 'react'
import { TeacherAvailabilityPeriod } from '../../../models/Teachers'
import { DateRange } from '../../../models'
import DateRangePill from '../../common/DateRangePill'

interface TeacherAvailabilityColumnProps {
    periods: TeacherAvailabilityPeriod[]
    selectedPeriodId: string | null
    onSelectPeriod: (id: string) => void
    onAddPeriod: () => void
    onRemovePeriod: (id: string) => void
    onToggleSlot: (slotIndex: number) => void
    onPeriodDateChange: (id: string, field: 'start' | 'end', value: string) => void
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const normalizeAvailability = (value?: string): string => {
    if (!value || value.length !== 10) return '0000000000'
    return value
}

const TeacherAvailabilityColumn = ({
    periods,
    selectedPeriodId,
    onSelectPeriod,
    onAddPeriod,
    onRemovePeriod,
    onToggleSlot,
    onPeriodDateChange,
}: TeacherAvailabilityColumnProps) => {
    const selectedPeriod = useMemo(
        () => periods.find((p) => p.id === selectedPeriodId) ?? periods[0],
        [periods, selectedPeriodId],
    )
    const sortedPeriods = useMemo(() => {
        const entries = periods.map((period, index) => ({
            period,
            index,
            sortKey: period.start || period.end || null,
        }))
        const hasAnyDate = entries.some((entry) => entry.sortKey)
        if (!hasAnyDate) return periods
        return entries
            .sort((a, b) => {
                if (!a.sortKey && !b.sortKey) return a.index - b.index
                if (!a.sortKey) return 1
                if (!b.sortKey) return -1
                if (a.sortKey === b.sortKey) return a.index - b.index
                return a.sortKey.localeCompare(b.sortKey)
            })
            .map((entry) => entry.period)
    }, [periods])

    if (!selectedPeriod) {
        return (
            <div className="teacher-detail-col">
                <h4>Disponibilités</h4>
                <p className="teacher-detail-muted">Aucune période de disponibilité définie.</p>
            </div>
        )
    }

    const availabilityForSelected =
        selectedPeriod?.availability ?? normalizeAvailability()

    const selectedPeriodRange: DateRange = {
        id: selectedPeriod.id,
        start: selectedPeriod.start || '',
        end: selectedPeriod.end || '',
    }

    const buildPeriodLabel = (period: TeacherAvailabilityPeriod) => {
        const formatDate = (value?: string) => {
            if (!value) return ''
            const parts = value.split('-')
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`
            }
            return value
        }
        if (!period.start && !period.end) return period.label
        if (period.start && period.end) {
            return `${formatDate(period.start)} - ${formatDate(period.end)}`
        }
        if (period.start) {
            return formatDate(period.start)
        }
        return formatDate(period.end)
    }

    return (
        <div className="teacher-detail-col">
            <h4>Disponibilités</h4>

            {/* Header périodes de disponibilité */}
            <div className="teacher-periods-header">
                {sortedPeriods.map((period) => {
                    const displayLabel = buildPeriodLabel(period)
                    return (
                        <div
                            key={period.id}
                            className={
                                'teacher-period-pill' +
                                (period.id === selectedPeriodId ? ' is-active' : '')
                            }
                        >
                            <button
                                type="button"
                                className="teacher-period-pill-main"
                                onClick={() => onSelectPeriod(period.id)}
                            >
                                {displayLabel}
                            </button>

                            {periods.length > 1 && (
                                <button
                                    type="button"
                                    className="teacher-period-pill-remove"
                                    onClick={() => onRemovePeriod(period.id)}
                                    aria-label={`Supprimer ${displayLabel}`}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )
                })}

                <button
                    type="button"
                    className="teacher-period-add-pill"
                    onClick={onAddPeriod}
                >
                    + Ajouter une période de disponibilité
                </button>
            </div>

            {/* Plage de dates */}
            <div className="teacher-period-range">
                <DateRangePill
                    range={selectedPeriodRange}
                    isEditing={true}
                    rootClassName="teacher-period-range-pill"
                    canRemove={false}
                    ariaRemoveLabel={`Modifier la plage de la ${selectedPeriod.label}`}
                    onDateChange={(id, field, value) =>
                        onPeriodDateChange(id, field, value)
                    }
                />
            </div>

            {/* Tableau 6x3 */}
            <div className="teacher-availability-grid">
                <div className="ta-empty"></div>
                <div className="ta-day">Lun</div>
                <div className="ta-day">Mar</div>
                <div className="ta-day">Mer</div>
                <div className="ta-day">Jeu</div>
                <div className="ta-day">Ven</div>

                <div className="ta-label">Matin</div>
                {DAYS.map((_, i) => {
                    const slotIndex = i * 2
                    const isAvailable = availabilityForSelected[slotIndex] === '1'
                    return (
                        <button
                            key={`m-${i}`}
                            type="button"
                            className={`ta-cell ${
                                isAvailable ? 'is-available' : 'is-unavailable'
                            }`}
                            onClick={() => onToggleSlot(slotIndex)}
                            aria-label={`${DAYS[i]} matin : ${
                                isAvailable ? 'disponible' : 'non disponible'
                            }`}
                        />
                    )
                })}

                <div className="ta-label">Après-midi</div>
                {DAYS.map((_, i) => {
                    const slotIndex = i * 2 + 1
                    const isAvailable = availabilityForSelected[slotIndex] === '1'
                    return (
                        <button
                            key={`a-${i}`}
                            type="button"
                            className={`ta-cell ${
                                isAvailable ? 'is-available' : 'is-unavailable'
                            }`}
                            onClick={() => onToggleSlot(slotIndex)}
                            aria-label={`${DAYS[i]} après-midi : ${
                                isAvailable ? 'disponible' : 'non disponible'
                            }`}
                        />
                    )
                })}
            </div>

            <div className="teacher-availability-legend">
                <div className="ta-legend-item">
                    <span className="ta-cell legend is-available" />
                    <span>Disponible</span>
                </div>
                <div className="ta-legend-item">
                    <span className="ta-cell legend is-unavailable" />
                    <span>Non disponible</span>
                </div>
            </div>
        </div>
    )
}

export default TeacherAvailabilityColumn

