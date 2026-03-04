// src/components/matieres/MatieresToolbar.tsx

import React from 'react'
import { PageToolbar, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'

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

    // ✅ options injectées depuis la page
    cycleOptions: { id: string; nom: string }[]
    promotionOptions: { id: string; nom: string }[]
    teacherOptions: { id: string; label: string }[]

    selectionMode: boolean
    selectedCount: number
    onToggleSelectionMode: () => void
    onCreateRequested: () => void
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
    onCreateRequested,
    onResetFilters,
    hasActiveFilters,
}: MatieresToolbarProps) {
    return (
        <PageToolbar className="matieres-toolbar">
            <ToolbarRow className="page-toolbar-row--primary matieres-toolbar-row matieres-toolbar-row--primary">
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

                <ToolbarResetButton
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                />

                <button
                    type="button"
                    className="toolbar-add-btn matieres-toolbar-add-btn"
                    onClick={onCreateRequested}
                    aria-label="Ajouter une matière"
                    title="Ajouter une matière"
                >
                    <img src={icPlus} alt="" className="toolbar-add-icon" />
                    <span className="toolbar-add-label">Ajouter une matière</span>
                </button>
            </ToolbarRow>

            <ToolbarRow className="page-toolbar-row--filters matieres-toolbar-row matieres-toolbar-row--filters">
                <div className="toolbar-filter toolbar-filter--chips matieres-toolbar-semestre-filter">
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

                    {/* Cycle (select) */}
                    <div className="toolbar-filter matieres-toolbar-cycle-filter">
                        <label className="toolbar-filter-label">
                            Cycles
                            <select
                                value={cycleFilter}
                                onChange={(e) => onCycleChange(e.target.value as CycleFilter)}
                                className="toolbar-filter-select"
                            >
                                <option value="ALL">Tous</option>
                                {cycleOptions.map((c) => (
                                    <option key={c.id} value={c.nom}>
                                        {c.nom}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Promotions (select) */}
                    <div className="toolbar-filter matieres-toolbar-promotion-filter">
                        <label className="toolbar-filter-label">
                            Promotions
                            <select
                                value={promotionFilter}
                                onChange={(e) =>
                                    onPromotionChange(e.target.value as PromotionFilter)
                                }
                                className="toolbar-filter-select"
                            >
                                <option value="ALL">Toutes</option>
                                {promotionOptions.map((p) => (
                                    <option key={p.id} value={p.nom}>
                                        {p.nom}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                <div className="toolbar-filter matieres-toolbar-teacher-filter">
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

            </ToolbarRow>
        </PageToolbar>
    )
}
