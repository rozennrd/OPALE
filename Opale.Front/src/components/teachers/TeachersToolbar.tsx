// src/components/teachers/TeachersToolbar.tsx
import React, { useState } from 'react'
import { TeachingMode } from '../../models/Teacher'
import { PageToolbar, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'

type ModeFilter = 'ALL' | TeachingMode

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'PRESENTIEL', label: 'Présentiel' },
    { value: 'HYBRIDE', label: 'Hybride' },
    { value: 'DISTANCIEL', label: 'Distanciel' },
]

export default function TeachersToolbar() {
    const [searchValue, setSearchValue] = useState('')
    const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL')

    const handleSearchChange = (value: string) => {
        setSearchValue(value)
        console.log('[TEACHERS] Recherche :', value)
    }

    const handleSubjectsClick = () => {
        console.log('[TEACHERS] Ouvrir filtre "Matières"')
    }

    const handleModeChange = (value: ModeFilter) => {
        setModeFilter(value)
        console.log('[TEACHERS] Filtre mode :', value)
        // plus tard : remonter ce filtre à la page par des props
    }

    return (
        <PageToolbar className="teachers-toolbar">
            <ToolbarRow className="teachers-toolbar-row">
                {/* Searchbar à gauche */}
                <ToolbarSearch
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Rechercher un enseignant"
                    className="teachers-toolbar-search"
                />

                {/* Filtres à droite */}
                <div className="teachers-toolbar-filters">
                    {/* Filtre matières (bouton simple) */}
                    <button
                        type="button"
                        className="toolbar-filter-button"
                        onClick={handleSubjectsClick}
                    >
                        <span>Matières</span>
                        <span
                            className="toolbar-filter-button-chevron"
                            aria-hidden="true"
                        >
                            ▾
                        </span>
                    </button>

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
                                    onClick={() => handleModeChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ToolbarRow>
        </PageToolbar>
    )
}