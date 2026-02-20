// src/components/matieres/MatieresToolbar.tsx

import React from 'react'
import { PageToolbar, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'

export type SemestreFilter = 'ALL' | 1 | 2
export type CycleFilter = 'ALL' | string
export type PromotionFilter = 'ALL' | string
export type TeacherFilter = 'ALL' | string

interface MatieresToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void

    semestreFilter: SemestreFilter
    onSemestreChange: (value: SemestreFilter) => void

    cycleFilter: CycleFilter
    onCycleChange: (value: CycleFilter) => void
    promotionFilter: PromotionFilter
    onPromotionChange: (value: PromotionFilter) => void
    teacherFilter: TeacherFilter
    onTeacherChange: (value: TeacherFilter) => void

    cycleOptions: string[]
    promotionOptions: string[]
    teacherOptions: { id: string; label: string }[]

    selectionMode: boolean
    selectedCount: number
    onToggleSelectionMode: () => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

const SEMESTRE_OPTIONS: { value: SemestreFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 1, label: 'S1' },
    { value: 2, label: 'S2' },
]

export default function MatieresToolbar({
    searchValue,
    onSearchChange,
    semestreFilter,
    onSemestreChange,
    cycleFilter,
    onCycleChange,
    promotionFilter,
    onPromotionChange,
    teacherFilter,
    onTeacherChange,
    cycleOptions,
    promotionOptions,
    teacherOptions,
    selectionMode,
    selectedCount,
    onToggleSelectionMode,
    onResetFilters,
    hasActiveFilters,
}: MatieresToolbarProps) {
    return (
        <PageToolbar className="matieres-toolbar">
            <ToolbarRow className="matieres-toolbar-row matieres-toolbar-row--primary">
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher une matière"
                    className="matieres-toolbar-search"
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
            </ToolbarRow>

            <ToolbarRow className="matieres-toolbar-row matieres-toolbar-row--filters">
                <div className="toolbar-filter">
                    <span className="toolbar-filter-label">Semestre</span>
                    <div className="toolbar-toggle-chips">
                        {SEMESTRE_OPTIONS.map((option) => (
                            <button
                                key={String(option.value)}
                                type="button"
                                className={
                                    'toolbar-toggle-chip' +
                                    (semestreFilter === option.value
                                        ? ' toolbar-toggle-chip--active'
                                        : '')
                                }
                                onClick={() => onSemestreChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Cycles
                        <select
                            value={cycleFilter}
                            onChange={(e) => onCycleChange(e.target.value as CycleFilter)}
                            className="toolbar-filter-select"
                        >
                            <option value="ALL">Tous</option>
                            {cycleOptions.map((cycle) => (
                                <option key={cycle} value={cycle}>
                                    {cycle}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Promotions
                        <select
                            value={promotionFilter}
                            onChange={(e) => onPromotionChange(e.target.value as PromotionFilter)}
                            className="toolbar-filter-select"
                        >
                            <option value="ALL">Toutes</option>
                            {promotionOptions.map((promotion) => (
                                <option key={promotion} value={promotion}>
                                    {promotion}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Enseignants
                        <select
                            value={teacherFilter}
                            onChange={(e) => onTeacherChange(e.target.value as TeacherFilter)}
                            className="toolbar-filter-select"
                        >
                            <option value="ALL">Tous</option>
                            {teacherOptions.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <ToolbarResetButton
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                />
            </ToolbarRow>
        </PageToolbar>
    )
}
