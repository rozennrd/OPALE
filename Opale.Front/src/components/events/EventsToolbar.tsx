// src/components/events/EventsToolbar.tsx
import React from 'react'
import icSearch from '../../assets/ic-search.png'
import { EventType } from '../../models/CampusEvent'

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
                                      }: EventsToolbarProps) {
    return (
        <div className="events-toolbar">

            {/* Ligne 1 : recherche */}
            <div className="events-toolbar-row">
                <div className="events-search">
                    <img src={icSearch} alt="" className="events-search-icon" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="events-search-input"
                        placeholder="Rechercher un événement…"
                    />
                </div>
            </div>

            {/* Ligne 2 : filtres */}
            <div className="events-toolbar-row events-toolbar-filters">

                {/* Filtre dates */}
                <div className="events-filter">
                    <label className="events-filter-label">
                        À partir du
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            className="events-filter-date"
                        />
                    </label>
                </div>

                <div className="events-filter">
                    <label className="events-filter-label">
                        Jusqu’au
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className="events-filter-date"
                        />
                    </label>
                </div>

                {/* Filtre cible */}
                <div className="events-filter">
                    <span className="events-filter-label">Cible</span>
                    <div className="events-target-toggle">
                        {(['ALL','JUNIA','EXTERNE'] as TargetFilter[]).map(v => (
                            <button
                                key={v}
                                type="button"
                                className={
                                    'events-target-chip' +
                                    (target === v ? ' events-target-chip--active' : '')
                                }
                                onClick={() => onTargetChange(v)}
                            >
                                {v === 'ALL' ? 'Tous' : v === 'JUNIA' ? 'Junia' : 'Externe'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtre type */}
                <div className="events-filter events-filter-type">
                    <label className="events-filter-label">
                        Type d'événement
                        <select
                            value={type}
                            onChange={(e) => onTypeChange(e.target.value as TypeFilter)}
                            className="events-filter-select"
                        >
                            {EVENT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </div>
    )
}
