// src/components/matieres/MatieresToolbar.tsx

import React from 'react'
import { PageToolbar, ToolbarRow } from '../common/Toolbar'
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

    // ✅ options injectées depuis la page
    cycleOptions: string[]
    promotionOptions: string[]
    teacherOptions: { id: string; label: string }[]
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
                                        }: MatieresToolbarProps) {
    return (
        <PageToolbar className="matieres-toolbar">
            <ToolbarRow className="matieres-toolbar-row">
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher une matière"
                    className="matieres-toolbar-search"
                />

                <div className="matieres-toolbar-filters">
                    {/* Semestre (chips) */}
                    <div className="toolbar-filter">
                        <span className="toolbar-filter-label">Semestre</span>
                        <div className="toolbar-toggle-chips">
                            {SEMESTRE_OPTIONS.map((opt) => (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    className={
                                        'toolbar-toggle-chip' +
                                        (semestreFilter === opt.value
                                            ? ' toolbar-toggle-chip--active'
                                            : '')
                                    }
                                    onClick={() => onSemestreChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cycle (select) */}
                    <div className="toolbar-filter">
                        <label className="toolbar-filter-label">
                            Cycles
                            <select
                                value={cycleFilter}
                                onChange={(e) => onCycleChange(e.target.value as CycleFilter)}
                                className="toolbar-filter-select"
                            >
                                <option value="ALL">Tous</option>
                                {cycleOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Promotions (select) */}
                    <div className="toolbar-filter">
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
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Enseignants (select) */}
                    <div className="toolbar-filter">
                        <label className="toolbar-filter-label">
                            Enseignants
                            <select
                                value={teacherFilter}
                                onChange={(e) =>
                                    onTeacherChange(e.target.value as TeacherFilter)
                                }
                                className="toolbar-filter-select"
                            >
                                <option value="ALL">Tous</option>
                                {teacherOptions.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </ToolbarRow>
        </PageToolbar>
    )
}