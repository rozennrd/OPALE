// src/components/events/EventsToolbar.tsx
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

    // Clic sur "+"
    onCreateRequested: () => void
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
                                          onCreateRequested,
                                      }: EventsToolbarProps) {
    return (
        <PageToolbar className="events-toolbar">
            {/* Ligne 1 : search + bouton + */}
            <ToolbarRow>
                <ToolbarSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    placeholder="Rechercher un événement…"
                />

                <button
                    type="button"
                    className="events-toolbar-plus-btn"
                    onClick={onCreateRequested}
                    aria-label="Créer un événement"
                    title="Créer un événement"
                >
                    <img src={icPlus} alt="" className="events-toolbar-plus-icon"/>
                </button>
            </ToolbarRow>

            {/* Ligne 2 : filtres */}
            <ToolbarRow className="page-toolbar-row--filters events-toolbar-filters">
                {/* Filtre dates */}
                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        À partir du
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
                        Jusqu’au
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className="toolbar-filter-date"
                        />
                    </label>
                </div>

                {/* Filtre cible */}
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

                {/* Filtre type */}
                <div className="toolbar-filter">
                    <label className="toolbar-filter-label">
                        Type d&apos;événement
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