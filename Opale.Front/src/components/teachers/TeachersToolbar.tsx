// src/components/teachers/TeachersToolbar.tsx
import { TeachingMode } from '../../models/Teachers'
import { PageToolbar, ToolbarAddButton, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'
import DateInput from '../common/DateInput'

export type ModeFilter = 'ALL' | TeachingMode

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'Présentiel', label: 'Présentiel' },
    { value: 'Hybride', label: 'Hybride' },
    { value: 'Distanciel', label: 'Distanciel' },
]

interface TeachersToolbarProps {
    onCreateRequested: () => void
    searchValue: string
    onSearchChange: (value: string) => void
    modeFilter: ModeFilter
    onModeChange: (value: ModeFilter) => void
    subjectFilter: string
    onSubjectChange: (value: string) => void
    subjectOptions: string[]
    dateFrom: string
    onDateFromChange: (value: string) => void
    dateTo: string
    onDateToChange: (value: string) => void
    selectionMode: boolean
    selectedCount: number
    onToggleSelectionMode: () => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

export default function TeachersToolbar({
    onCreateRequested,
    searchValue,
    onSearchChange,
    modeFilter,
    onModeChange,
    subjectFilter,
    onSubjectChange,
    subjectOptions,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    selectionMode,
    selectedCount,
    onToggleSelectionMode,
    onResetFilters,
    hasActiveFilters,
}: TeachersToolbarProps) {
    return (
        <PageToolbar className="teachers-toolbar">
            <ToolbarRow className="page-toolbar-row--primary teachers-toolbar-row teachers-toolbar-row--primary">
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un enseignant"
                    className="teachers-toolbar-search"
                />

                <div className="page-toolbar-row--filters teachers-toolbar-filters">
                    <div className="toolbar-filter teachers-toolbar-date-filter teachers-toolbar-date-filter--from">
                        <label className="toolbar-filter-label">
                            Dispo à partir de...
                            <DateInput
                                value={dateFrom}
                                onChange={onDateFromChange}
                                inputClassName="toolbar-filter-date"
                                max={dateTo || undefined}
                            />
                        </label>
                    </div>

                    <div className="toolbar-filter teachers-toolbar-date-filter teachers-toolbar-date-filter--to">
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

                    <ToolbarAddButton
                        className="teachers-toolbar-add-btn teachers-toolbar-add-inline"
                        onClick={onCreateRequested}
                        label="Ajouter un enseignant"
                        iconSrc={icPlus}
                    />

                    <div className="toolbar-filter toolbar-filter--chips teachers-toolbar-mode-filter">
                        <span className="toolbar-filter-label">Type de cours</span>
                        <div className="toolbar-toggle-chips">
                            {MODE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={
                                        'toolbar-toggle-chip' +
                                        (modeFilter === option.value
                                            ? ' toolbar-toggle-chip--active'
                                            : '')
                                    }
                                    onClick={() => onModeChange(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="teachers-toolbar-line3">
                        <div className="toolbar-filter teachers-toolbar-promotion-filter">
                            <label className="toolbar-filter-label">
                                Promotion (désactivé)
                                <select
                                    className="toolbar-filter-select"
                                    value="ALL"
                                    disabled
                                >
                                    <option value="ALL">Toutes</option>
                                </select>
                            </label>
                        </div>

                        <div className="toolbar-filter teachers-toolbar-subjects">
                            <label className="toolbar-filter-label">
                                Matières
                                <select
                                    value={subjectFilter || 'ALL'}
                                    onChange={(e) =>
                                        onSubjectChange(
                                            e.target.value === 'ALL'
                                                ? ''
                                                : e.target.value,
                                        )
                                    }
                                    className="toolbar-filter-select"
                                >
                                    <option value="ALL">Toutes</option>
                                    {subjectOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

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

                <ToolbarResetButton
                    className="teachers-toolbar-reset"
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                />

                <ToolbarAddButton
                    className="teachers-toolbar-add-btn"
                    onClick={onCreateRequested}
                    label="Ajouter un enseignant"
                    iconSrc={icPlus}
                />
            </ToolbarRow>
        </PageToolbar>
    )
}
