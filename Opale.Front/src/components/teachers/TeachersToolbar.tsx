// src/components/teachers/TeachersToolbar.tsx
import React, { useState } from 'react'

export default function TeachersToolbar() {
    const [searchValue, setSearchValue] = useState('')

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchValue(value)
        console.log('[TEACHERS] Recherche :', value)
    }

    const handleSubjectsClick = () => {
        console.log('[TEACHERS] Ouvrir filtre "Matières"')
    }

    const handleModeClick = () => {
        console.log('[TEACHERS] Ouvrir filtre "Mode (Distanciel / Hybride / Présentiel)"')
    }

    return (
        <div className="teachers-toolbar">
            <div className="teachers-toolbar-left">
                <div className="teachers-search">
                    <span className="teachers-search-icon" aria-hidden="true">
                        🔍
                    </span>

                    <input
                        type="text"
                        className="teachers-search-input"
                        placeholder="Rechercher un enseignant"
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="teachers-toolbar-right">
                <button
                    type="button"
                    className="teachers-filter-btn"
                    onClick={handleSubjectsClick}
                >
                    <span>Matières</span>
                    <span className="teachers-filter-chevron" aria-hidden="true">
                        ▾
                    </span>
                </button>

                <button
                    type="button"
                    className="teachers-filter-btn"
                    onClick={handleModeClick}
                >
                    <span>Mode</span>
                    <span className="teachers-filter-chevron" aria-hidden="true">
                        ▾
                    </span>
                </button>
            </div>
        </div>
    )
}