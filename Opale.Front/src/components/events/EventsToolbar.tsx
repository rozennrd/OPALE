// src/components/events/EventsToolbar.tsx
import React from 'react'
import { EventType } from '../../models/CampusEvent'
import { PageToolbar, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'

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
}

const EVENT_TYPE_OPTIONS = [
    { value: 'ALL', label: 'Tous les types' },
    { value: 'JOURNEE_PO', label: 'Journee Portes Ouvertes' },
    { value: 'EXAMEN', label: 'Examen' },
    { value: 'CONFERENCE', label: 'Conference' },
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
}: EventsToolbarProps) {
    return (
        <PageToolbar className="events-toolbar">
            <ToolbarRow>
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un evenement..."
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
                        {selectionMode ? 'Quitter selection' : 'Selectionner'}
                    </span>
                    {selectedCount > 0 && (
                        <span className="toolbar-selection-count-pill">
                            {selectedCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    className="events-toolbar-plus-btn"
                    onClick={onCreateRequested}
                    aria-label="Creer un evenement"
                    title="Creer un evenement"
                >
                    <img src={icPlus} alt="" className="events-toolbar-plus-icon" />
                </button>
            </ToolbarRow>

            <ToolbarRow className="page-toolbar-row--filters events-toolbar-filters">
                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        A partir du
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            className="toolbar-filter-date"
                        />
                    </label>
                </div>

                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Jusqu&apos;au
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className="toolbar-filter-date"
                        />
                    </label>
                </div>

                <div className="toolbar-filter">
                    <span className="toolbar-filter-label">Cible</span>
                    <div className="toolbar-toggle-chips">
                        {(['ALL', 'JUNIA', 'EXTERNE'] as TargetFilter[]).map(
                            (v) => (
                                <button
                                    key={v}
                                    type="button"
                                    className={
                                        'toolbar-toggle-chip' +
                                        (target === v
                                            ? ' toolbar-toggle-chip--active'
                                            : '')
                                    }
                                    onClick={() => onTargetChange(v)}
                                >
                                    {v === 'ALL'
                                        ? 'Tous'
                                        : v === 'JUNIA'
                                          ? 'Junia'
                                          : 'Externe'}
                                </button>
                            ),
                        )}
                    </div>
                </div>

                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Type d&apos;evenement
                        <select
                            value={type}
                            onChange={(e) =>
                                onTypeChange(e.target.value as TypeFilter)
                            }
                            className="toolbar-filter-select"
                        >
                            {EVENT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </ToolbarRow>
        </PageToolbar>
    )
}
