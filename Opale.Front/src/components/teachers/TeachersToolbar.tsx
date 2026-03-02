// src/components/teachers/TeachersToolbar.tsx
import { useMemo, useState } from 'react'
import { TeachingMode } from '../../models/Teachers'
import { PageToolbar, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'

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
    selectionMode,
    selectedCount,
    onToggleSelectionMode,
    onResetFilters,
    hasActiveFilters,
}: TeachersToolbarProps) {
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false)
    const [subjectSearch, setSubjectSearch] = useState('')

    const filteredSubjectOptions = useMemo(() => {
        if (!subjectSearch.trim()) return subjectOptions
        const needle = subjectSearch.trim().toLowerCase()
        return subjectOptions.filter((option) => option.toLowerCase().includes(needle))
    }, [subjectOptions, subjectSearch])

    const handleSubjectsToggle = () => {
        setIsSubjectsOpen((previous) => !previous)
    }

    const handleSubjectsClear = () => {
        onSubjectChange('')
        setIsSubjectsOpen(false)
    }

    const handleSubjectSelect = (value: string) => {
        onSubjectChange(value)
        setIsSubjectsOpen(false)
    }

    const handleResetFilters = () => {
        onResetFilters()
        setIsSubjectsOpen(false)
        setSubjectSearch('')
    }

    return (
        <PageToolbar className="teachers-toolbar">
            <ToolbarRow className="teachers-toolbar-row">
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un enseignant"
                    className="teachers-toolbar-search"
                />

                <div className="teachers-toolbar-filters">
                    <div className="teachers-toolbar-subjects">
                        <button
                            type="button"
                            className="toolbar-filter-button teachers-toolbar-subjects-trigger"
                            onClick={handleSubjectsToggle}
                            aria-expanded={isSubjectsOpen}
                        >
                            <span>{subjectFilter || 'Matières'}</span>
                            <span
                                className="toolbar-filter-button-chevron"
                                aria-hidden="true"
                            />
                        </button>

                        {isSubjectsOpen && (
                            <div className="teachers-toolbar-subjects-panel">
                                <input
                                    className="teachers-toolbar-subjects-input"
                                    value={subjectSearch}
                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                    placeholder="Rechercher une matière"
                                />

                                <div className="teachers-toolbar-subjects-list">
                                    <button
                                        type="button"
                                        className="teachers-toolbar-subjects-item"
                                        onClick={handleSubjectsClear}
                                    >
                                        Toutes les matières
                                    </button>

                                    {filteredSubjectOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={
                                                'teachers-toolbar-subjects-item' +
                                                (option === subjectFilter
                                                    ? ' is-selected'
                                                    : '')
                                            }
                                            onClick={() => handleSubjectSelect(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="teachers-toolbar-mode-filter toolbar-filter--chips">
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
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                />

                <button
                    type="button"
                    className="toolbar-add-btn teachers-toolbar-add-btn"
                    onClick={onCreateRequested}
                    aria-label="Ajouter un enseignant"
                    title="Ajouter un enseignant"
                >
                    <img src={icPlus} alt="" className="toolbar-add-icon" />
                    <span className="toolbar-add-label">Ajouter un enseignant</span>
                </button>
            </ToolbarRow>
        </PageToolbar>
    )
}
