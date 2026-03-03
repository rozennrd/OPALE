// src/components/events/EventsToolbar.tsx
import { EventType } from '../../models/CampusEvent'
import { PageToolbar, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'
import DateInput from '../common/DateInput'

export type TargetFilter = 'ALL' | 'JUNIA' | 'EXTERNE'
export type TypeFilter = 'ALL' | EventType

interface EventsToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void

    dateFrom: string
    onDateFromChange: (value: string) => void

    dateTo: string
    onDateToChange: (value: string) => void

    target: TargetFilter
    onTargetChange: (value: TargetFilter) => void

    type: TypeFilter
    onTypeChange: (value: TypeFilter) => void

    onCreateRequested: () => void

    selectionMode: boolean
    selectedCount: number
    onToggleSelectionMode: () => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

const EVENT_TYPE_OPTIONS = [
    { value: 'ALL', label: 'Tous les types' },
    { value: 'JOURNEE_PO', label: 'Journée Portes Ouvertes' },
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'CONFERENCE', label: 'Conférence' },
    { value: 'FORUM', label: 'Forum' },
    { value: 'SALON', label: 'Salon' },
    { value: 'AUTRE', label: 'Autre' },
]

export default function EventsToolbar({
    searchValue,
    onSearchChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    target,
    onTargetChange,
    type,
    onTypeChange,
    onCreateRequested,
    selectionMode,
    selectedCount,
    onToggleSelectionMode,
    onResetFilters,
    hasActiveFilters,
}: EventsToolbarProps) {
    return (
        <PageToolbar className="events-toolbar">
            <ToolbarRow className="page-toolbar-row--primary events-toolbar-row events-toolbar-row--primary">
                <ToolbarSearch className="events-toolbar-search"
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un événement..."
                />

                <ToolbarResetButton
                    className="events-toolbar-reset-inline"
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                />

                <button
                    type="button"
                    className={[
                        'toolbar-filter-button',
                        'toolbar-selection-toggle',
                        selectionMode ? 'is-active' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    onClick={onToggleSelectionMode}
                >
                    <span>
                        {selectionMode ? 'Quitter sélection' : 'Sélectionner'}
                    </span>
                    {selectedCount > 0 && (
                        <span className="toolbar-selection-count-pill">
                            {selectedCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    className="toolbar-add-btn events-toolbar-add-btn"
                    onClick={onCreateRequested}
                    aria-label="Ajouter un événement"
                    title="Ajouter un événement"
                >
                    <img src={icPlus} alt="" className="toolbar-add-icon" />
                    <span className="toolbar-add-label">Ajouter un événement</span>
                </button>
            </ToolbarRow>

            <ToolbarRow className="page-toolbar-row--filters events-toolbar-row events-toolbar-row--filters events-toolbar-filters">
                <div className="toolbar-filter events-toolbar-date-filter events-toolbar-date-filter--from">
                    <label className="toolbar-filter-label">
                        À partir du
                        <DateInput
                            value={dateFrom}
                            onChange={onDateFromChange}
                            inputClassName="toolbar-filter-date"
                            max={dateTo || undefined}
                        />
                    </label>
                </div>

                <div className="toolbar-filter events-toolbar-date-filter events-toolbar-date-filter--to">
                    <label className="toolbar-filter-label">
                        Jusqu&apos;au
                        <DateInput
                            value={dateTo}
                            onChange={onDateToChange}
                            inputClassName="toolbar-filter-date"
                            min={dateFrom || undefined}
                        />
                    </label>
                </div>

                <div className="toolbar-filter toolbar-filter--chips events-toolbar-target-filter">
                    <span className="toolbar-filter-label">Cible</span>
                    <div className="toolbar-toggle-chips">
                        {(['ALL', 'JUNIA', 'EXTERNE'] as TargetFilter[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={
                                    'toolbar-toggle-chip' +
                                    (target === value
                                        ? ' toolbar-toggle-chip--active'
                                        : '')
                                }
                                onClick={() => onTargetChange(value)}
                            >
                                {value === 'ALL'
                                    ? 'Tous'
                                    : value === 'JUNIA'
                                      ? 'Junia'
                                      : 'Externe'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="toolbar-filter events-toolbar-type-filter">
                    <label className="toolbar-filter-label">
                        Type d&apos;événement
                        <select
                            value={type}
                            onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
                            className="toolbar-filter-select"
                        >
                            {EVENT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <ToolbarResetButton
                    className="events-toolbar-reset"
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                />
            </ToolbarRow>
        </PageToolbar>
    )
}

