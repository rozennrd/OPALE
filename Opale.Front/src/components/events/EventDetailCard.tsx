import React, { useEffect }  from 'react'
import { CampusEvent, EventType } from '../../models/CampusEvent'
import { getEventTypeMeta } from './EventTypeBadge'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import { useEventDetail } from '../../hooks/events/useEventDetail'

interface EventDetailCardProps {
    event: CampusEvent
    onClose: () => void
}

function formatDate(date: string | undefined): string {
    if (!date) return '—'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export default function EventDetailCard({ event, onClose }: EventDetailCardProps) {
    const { draft, hasChanges, updateField, handleSave } = useEventDetail(event)
    const typeMeta = getEventTypeMeta(draft.type)

    // 🔥 ESC ferme la fiche événement
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleDescriptionBlur = () => {
        console.log('[EVENTS] Update description (mock onBlur)', {
            eventId: draft.id,
            description: draft.description,
        })
    }

    return (
        <div className="event-detail-overlay" role="dialog" aria-modal="true">
            <div className="event-detail-card">
                <button
                    type="button"
                    className="event-detail-close"
                    onClick={onClose}
                    aria-label="Fermer la fiche événement"
                >
                    ✕
                </button>

                {/* Header pill */}
                <div className="event-detail-header-badge">
                    <div
                        className={
                            'event-detail-header-pill ' +
                            (draft.source === 'JUNIA'
                                ? 'event-detail-header-pill--junia'
                                : 'event-detail-header-pill--external')
                        }
                    >
                        <div className="event-header-left">
                            <div className="event-header-title">
                                {draft.name}
                            </div>
                            <div className="event-header-subtitle">
                                {formatDate(draft.startDate)}
                                {draft.startDate !== draft.endDate && (
                                    <>
                                        {' → '}
                                        {formatDate(draft.endDate)}
                                    </>
                                )}
                                {' · '}
                                {draft.location}
                            </div>
                        </div>

                        <div className="event-header-right">
                            <div className="event-header-type-icon">
                                <img
                                    src={typeMeta.icon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="event-header-type-label">
                                {typeMeta.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne gauche : infos éditables */}
                <section className="event-detail-section event-detail-section-left">
                    <h3 className="event-detail-section-title">
                        Informations générales
                    </h3>

                    <dl className="event-detail-info-list">
                        <div className="event-detail-info-row">
                            <dt>Nom</dt>
                            <dd>
                                <input
                                    type="text"
                                    className="event-detail-input"
                                    value={draft.name}
                                    onChange={(e) =>
                                        updateField('name', e.target.value)
                                    }
                                />
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Date de début</dt>
                            <dd>
                                <input
                                    type="date"
                                    className="event-detail-input"
                                    value={draft.startDate}
                                    onChange={(e) =>
                                        updateField('startDate', e.target.value)
                                    }
                                />
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Date de fin</dt>
                            <dd>
                                <input
                                    type="date"
                                    className="event-detail-input"
                                    value={draft.endDate}
                                    onChange={(e) =>
                                        updateField('endDate', e.target.value)
                                    }
                                />
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Salle / lieu</dt>
                            <dd>
                                <input
                                    type="text"
                                    className="event-detail-input"
                                    value={draft.location}
                                    onChange={(e) =>
                                        updateField('location', e.target.value)
                                    }
                                />
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Type</dt>
                            <dd>
                                <select
                                    className="event-detail-select"
                                    value={draft.type}
                                    onChange={(e) =>
                                        updateField(
                                            'type',
                                            e.target.value as EventType,
                                        )
                                    }
                                >
                                    <option value="JOURNEE_PO">
                                        Journée Portes Ouvertes
                                    </option>
                                    <option value="EXAMEN">Examen</option>
                                    <option value="CONFERENCE">
                                        Conférence
                                    </option>
                                    <option value="FORUM">Forum</option>
                                    <option value="SALON">Salon</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Cible</dt>
                            <dd>
                                <div className="event-detail-source-toggle">
                                    <button
                                        type="button"
                                        className={
                                            'event-detail-source-pill' +
                                            (draft.source === 'JUNIA'
                                                ? ' is-active'
                                                : '')
                                        }
                                        onClick={() =>
                                            updateField('source', 'JUNIA')
                                        }
                                    >
                                        Junia
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            'event-detail-source-pill' +
                                            (draft.source === 'EXTERNE'
                                                ? ' is-active'
                                                : '')
                                        }
                                        onClick={() =>
                                            updateField('source', 'EXTERNE')
                                        }
                                    >
                                        Externe
                                    </button>
                                </div>
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Colonne droite : description */}
                <section className="event-detail-section event-detail-section-right">
                    <h3 className="event-detail-section-title">
                        Description / commentaires
                    </h3>
                    <textarea
                        className="event-detail-textarea"
                        placeholder="Notes sur l’événement, objectifs, intervenants, public visé…"
                        value={draft.description}
                        onChange={(e) =>
                            updateField('description', e.target.value)
                        }
                        onBlur={handleDescriptionBlur}
                        rows={4}
                    />
                </section>

                {/* Footer : boutons communs Annuler / Enregistrer */}
                <div className="event-detail-footer">
                    <ActionButtonsWithConfirm
                        onCancel={onClose}
                        onSave={handleSave}
                        hasChanges={hasChanges}
                        confirmMessage={
                            <>
                                Vous êtes sur le point d’enregistrer les
                                modifications pour{' '}
                                <strong>{draft.name}</strong>.
                                <br />
                                Confirmer ?
                            </>
                        }
                        confirmLabel="Enregistrer"
                        cancelLabel="Annuler"
                    />
                </div>
            </div>
        </div>
    )
}