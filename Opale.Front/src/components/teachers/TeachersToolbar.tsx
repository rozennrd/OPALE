// src/components/teachers/TeachersToolbar.tsx
import React, { useMemo, useState } from 'react'
import { TeachingMode } from '../../models/Teacher'
import { PageToolbar, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'

export type ModeFilter = 'ALL' | TeachingMode

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'PRESENTIEL', label: 'Présentiel' },
    { value: 'HYBRIDE', label: 'Hybride' },
    { value: 'DISTANCIEL', label: 'Distanciel' },
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
}: TeachersToolbarProps) {
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false)
    const [subjectSearch, setSubjectSearch] = useState('')

    const filteredSubjectOptions = useMemo(() => {
        if (!subjectSearch.trim()) return subjectOptions
        const needle = subjectSearch.trim().toLowerCase()
        return subjectOptions.filter((opt) => opt.toLowerCase().includes(needle))
    }, [subjectOptions, subjectSearch])

    const handleSubjectsToggle = () => {
        setIsSubjectsOpen((prev) => !prev)
    }

    const handleSubjectsClear = () => {
        onSubjectChange('')
        setIsSubjectsOpen(false)
    }

    const handleSubjectSelect = (value: string) => {
        onSubjectChange(value)
        setIsSubjectsOpen(false)
    }

    return (
        <PageToolbar className="teachers-toolbar">
            <ToolbarRow className="teachers-toolbar-row">
                {/* Searchbar à gauche */}
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un enseignant"
                    className="teachers-toolbar-search"
                />

                {/* Filtres à droite */}
                <div className="teachers-toolbar-filters">
                    {/* Filtre matières (liste) */}
                    <div className="teachers-toolbar-subjects">
                        <button
                            type="button"
                            className="toolbar-filter-button"
                            onClick={handleSubjectsToggle}
                            aria-expanded={isSubjectsOpen}
                        >
                            <span>{subjectFilter || 'Matières'}</span>
                            <span
                                className="toolbar-filter-button-chevron"
                                aria-hidden="true"
                            >
                            </span>
                        </button>
                        {isSubjectsOpen && (
                            <div className="teachers-toolbar-subjects-panel">
                                <input
                                    className="teachers-toolbar-subjects-input"
                                    value={subjectSearch}
                                    onChange={(e) =>
                                        setSubjectSearch(e.target.value)
                                    }
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
                                    {filteredSubjectOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={
                                                'teachers-toolbar-subjects-item' +
                                                (opt === subjectFilter
                                                    ? ' is-selected'
                                                    : '')
                                            }
                                            onClick={() =>
                                                handleSubjectSelect(opt)
                                            }
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filtre mode : groupe de chips (radio visuels) */}
                    <div className="toolbar-filter">
                        <span className="toolbar-filter-label"></span>
                        <div className="toolbar-toggle-chips">
                            {MODE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={
                                        'toolbar-toggle-chip' +
                                        (modeFilter === opt.value
                                            ? ' toolbar-toggle-chip--active'
                                            : '')
                                    }
                                    onClick={() => onModeChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="teachers-toolbar-plus-btn"
                    onClick={onCreateRequested}
                    aria-label="Ajouter un enseignant"
                    title="Ajouter un enseignant"
                >
                    <img src={icPlus} alt="" className="teachers-toolbar-plus-icon" />
                </button>
            </ToolbarRow>
        </PageToolbar>
    )
}