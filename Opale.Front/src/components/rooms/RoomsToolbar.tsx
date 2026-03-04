import React from 'react'
import { PageToolbar, ToolbarResetButton, ToolbarRow } from '../common/Toolbar'
import ToolbarSearch from '../common/ToolbarSearch'
import icPlus from '../../assets/ic-plus.png'
import {
    AvailabilityFilter,
    CapacityOperator,
    RoomTypeFilter,
} from '../../models/RoomFilters'

export type { RoomTypeFilter, CapacityOperator, AvailabilityFilter }

interface RoomsToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    typeFilter: RoomTypeFilter
    onTypeFilterChange: (value: RoomTypeFilter) => void
    capacityOperator: CapacityOperator
    onCapacityOperatorChange: (value: CapacityOperator) => void
    capacityValue: string
    onCapacityValueChange: (value: string) => void
    availabilityFilter: AvailabilityFilter
    onAvailabilityFilterChange: (value: AvailabilityFilter) => void
    selectionMode: boolean
    selectedCount: number
    onToggleSelectionMode: () => void
    onCreateRequested: () => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

const ROOM_TYPE_OPTIONS: { value: RoomTypeFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous les types' },
    { value: 'TD', label: 'TD' },
    { value: 'TP_ELECTRONIQUE', label: 'TP électronique' },
    { value: 'TP_NUMERIQUE', label: 'TP numérique' },
    { value: 'PROJET', label: 'Projet' },
    { value: 'AUTRE', label: 'Autre' },
]

export default function RoomsToolbar({
    searchValue,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    capacityOperator,
    onCapacityOperatorChange,
    capacityValue,
    onCapacityValueChange,
    availabilityFilter,
    onAvailabilityFilterChange,
    selectionMode,
    selectedCount,
    onToggleSelectionMode,
    onCreateRequested,
    onResetFilters,
    hasActiveFilters,
}: RoomsToolbarProps) {
    return (
        <PageToolbar className="rooms-toolbar">
            <ToolbarRow className="page-toolbar-row--primary rooms-toolbar-row rooms-toolbar-row--primary">
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher une salle"
                    className="rooms-toolbar-search"
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
                    className="toolbar-add-btn rooms-toolbar-add-btn rooms-toolbar-add-primary"
                    onClick={onCreateRequested}
                    aria-label="Ajouter une salle"
                    title="Ajouter une salle"
                >
                    <img src={icPlus} alt="" className="toolbar-add-icon" />
                    <span className="toolbar-add-label">Ajouter une salle</span>
                </button>
            </ToolbarRow>

            <ToolbarRow className="page-toolbar-row--filters rooms-toolbar-row rooms-toolbar-row--filters rooms-toolbar-filters">
                <div className="toolbar-filter rooms-toolbar-type-filter">
                    <label className="toolbar-filter-label">
                        Type
                        <select
                            value={typeFilter}
                            onChange={(e) => onTypeFilterChange(e.target.value as RoomTypeFilter)}
                            className="toolbar-filter-select"
                        >
                            {ROOM_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="toolbar-filter rooms-toolbar-capacity-filter">
                    <span className="toolbar-filter-label">Capacité</span>
                    <div className="rooms-toolbar-capacity-controls">
                        <select
                            value={capacityOperator}
                            onChange={(e) =>
                                onCapacityOperatorChange(e.target.value as CapacityOperator)
                            }
                            className="toolbar-filter-select rooms-toolbar-capacity-operator"
                        >
                            <option value="ALL">Tous</option>
                            <option value="GT">&gt;</option>
                            <option value="LT">&lt;</option>
                            <option value="EQ">=</option>
                        </select>

                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={capacityValue}
                            onChange={(e) => onCapacityValueChange(e.target.value)}
                            className="rooms-toolbar-capacity-input"
                            placeholder="Ex: 24"
                        />
                    </div>
                </div>

                <div className="toolbar-filter toolbar-filter--chips rooms-toolbar-availability-filter">
                    <span className="toolbar-filter-label">Disponibilité</span>
                    <div className="toolbar-toggle-chips">
                        {([
                            { value: 'ALL', label: 'Tous' },
                            { value: 'AVAILABLE', label: 'Disponible' },
                            { value: 'UNAVAILABLE', label: 'Non dispo' },
                        ] as { value: AvailabilityFilter; label: string }[]).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    'toolbar-toggle-chip' +
                                    (availabilityFilter === option.value
                                        ? ' toolbar-toggle-chip--active'
                                        : '')
                                }
                                onClick={() => onAvailabilityFilterChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className="toolbar-add-btn rooms-toolbar-add-btn rooms-toolbar-add-inline"
                    onClick={onCreateRequested}
                    aria-label="Ajouter une salle"
                    title="Ajouter une salle"
                >
                    <img src={icPlus} alt="" className="toolbar-add-icon" />
                    <span className="toolbar-add-label">Ajouter une salle</span>
                </button>
            </ToolbarRow>
        </PageToolbar>
    )
}
