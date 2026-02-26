import React from 'react'
import { CampusEvent, EventType } from '../../models/CampusEvent'
import { useEventDetail } from '../../hooks/events/useEventDetail'
import { Cycle } from '../../models/Cycle'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardFooter from '../common/DetailCardFooter'
import DetailCardBody from '../common/DetailCardBody'
import EventTypeBadge from './EventTypeBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'
import { ROOMS_MOCK } from '../../mocks/rooms.mock'

type SaveResult = { success: boolean; error?: string }

interface EventDetailCardProps {
    event: CampusEvent
    cycles?: Cycle[]
    onDelete?: () => void
    mode?: 'edit' | 'create'
    onClose: () => void
    onSave: (event: Partial<CampusEvent>, salleIds: string[]) => Promise<SaveResult>
}

function formatDate(date: string | undefined): string {
    if (!date) return '-'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function toDatetimeLocal(isoString: string): string {
    if (!isoString) return ''
    return isoString.slice(0, 16)
}

const EVENT_LOCATION_DATALIST_ID = 'event-location-suggestions'
const EVENT_ROOM_LOCATION_SUGGESTIONS = Array.from(
    new Set(ROOMS_MOCK.map((room) => room.fullName ?? room.name)),
).sort((a, b) =>
    a.localeCompare(b, 'fr', {
        numeric: true,
        sensitivity: 'base',
    }),
)

const CREATE_EVENT_REQUIRED_FIELDS_ALERT =
    'Merci de remplir tous les champs obligatoires (nom, dates, lieu, type, cible) avant de creer cet evenement.'

export default function EventDetailCard({
                                            event,
                                            cycles = [],
                                            onClose,
                                            onSave,
                                            onDelete,
                                            mode = 'edit',
                                        }: EventDetailCardProps) {
    const isCreate = mode === 'create'

    const {
        draft,
        hasChanges,
        saving,
        updateField,
        updateFields,
        handleSave,
    } = useEventDetail(event, onSave)

    const isValid =
        draft.name.trim().length > 0 &&
        draft.startDate.trim().length > 0 &&
        draft.endDate.trim().length > 0 &&
        draft.location.trim().length > 0 &&
        !!draft.type &&
        !!draft.source

    const promotionTargets = cycles.flatMap((cycle) =>
        cycle.promotions.map((promotion) => ({
            promotionId: promotion.id,
            promotionLabel: promotion.label,
            cycleId: cycle.id,
        })),
    )

    const selectedPromotionId = draft.concernedPromotionIds[0] ?? ''

    const saveDraft = async () => {
        const result = await handleSave()
        if (!result.success) {
            console.error('[EVENTS] Save failed:', result.error)
        }
    }

    const handleSourceChange = (source: 'JUNIA' | 'EXTERNE') => {
        updateField('source', source)

        if (source === 'EXTERNE') {
            updateFields({
                concernedCycleIds: [],
                concernedPromotionIds: [],
            })
        }
    }

    const handlePromotionChange = (promotionId: string) => {
        if (!promotionId) {
            updateFields({
                concernedCycleIds: [],
                concernedPromotionIds: [],
            })
            return
        }

        const target = promotionTargets.find(
            (promotionTarget) => promotionTarget.promotionId === promotionId,
        )
        if (!target) return

        updateFields({
            source: 'JUNIA',
            concernedCycleIds: [target.cycleId],
            concernedPromotionIds: [target.promotionId],
        })
    }

    const headerTitle =
        draft.name || (isCreate ? 'Nouvel evenement' : 'Evenement sans titre')

    const headerSubtitle = (() => {
        const start = formatDate(draft.startDate)
        const end =
            draft.startDate &&
            draft.endDate &&
            draft.startDate !== draft.endDate
                ? ` -> ${formatDate(draft.endDate)}`
                : ''
        const location = draft.location ? ` Â· ${draft.location}` : ''
        return `${start}${end}${location}`
    })()

    const {
        handleRequestClose,
        isConfirmOpen,
        handleConfirmSaveAndClose,
        handleDiscardAndClose,
        handleConfirmDialogRequestClose,
    } = useDetailDirtyClose({
        hasChanges,
        onClose,
        onSaveAndClose: () => {
            if (isCreate && !isValid) {
                window.alert(CREATE_EVENT_REQUIRED_FIELDS_ALERT)
                return
            }
            void saveDraft()
            onClose()
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    return (
        <div className="event-detail-overlay" role="dialog" aria-modal="true">
            <DetailCardBody className="event-detail-card">
                <DetailCardHeader
                    onClose={handleRequestClose}
                    closeAriaLabel="Fermer la fiche evenement"
                    closeButtonClassName="event-detail-close"
                    headerClassName="event-detail-header-badge"
                >
                    <EventTypeBadge
                        type={draft.type}
                        source={draft.source}
                        variant="header"
                        title={headerTitle}
                        subtitle={headerSubtitle}
                    />
                </DetailCardHeader>

                <section className="event-detail-section event-detail-section-left">
                    <h3 className="event-detail-section-title">
                        Informations generales
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
                            <dt>Date de debut</dt>
                            <dd>
                                <input
                                    type="datetime-local"
                                    className="event-detail-input"
                                    value={toDatetimeLocal(draft.startDate)}
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
                                    type="datetime-local"
                                    className="event-detail-input"
                                    value={toDatetimeLocal(draft.endDate)}
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
                                    list={EVENT_LOCATION_DATALIST_ID}
                                    value={draft.location}
                                    onChange={(e) =>
                                        updateField('location', e.target.value)
                                    }
                                />
                                <datalist id={EVENT_LOCATION_DATALIST_ID}>
                                    {EVENT_ROOM_LOCATION_SUGGESTIONS.map(
                                        (roomLabel) => (
                                            <option
                                                key={roomLabel}
                                                value={roomLabel}
                                            />
                                        ),
                                    )}
                                </datalist>
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
                                        Journee Portes Ouvertes
                                    </option>
                                    <option value="EXAMEN">Examen</option>
                                    <option value="CONFERENCE">Conference</option>
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
                                            handleSourceChange('JUNIA')
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
                                            handleSourceChange('EXTERNE')
                                        }
                                    >
                                        Externe
                                    </button>
                                </div>
                            </dd>
                        </div>

                        {draft.source === 'JUNIA' && (
                            <div className="event-detail-info-row">
                                <dt>Promotions</dt>
                                <dd>
                                    <select
                                        className="event-detail-select"
                                        value={selectedPromotionId}
                                        onChange={(e) =>
                                            handlePromotionChange(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Aucune promotion cible
                                        </option>
                                        {promotionTargets.map((promotionTarget) => (
                                            <option
                                                key={promotionTarget.promotionId}
                                                value={promotionTarget.promotionId}
                                            >
                                                {promotionTarget.promotionLabel}
                                            </option>
                                        ))}
                                    </select>
                                </dd>
                            </div>
                        )}

                        <div className="event-detail-info-row">
                            <dt>Macro planning</dt>
                            <dd>
                                <button
                                    type="button"
                                    className={
                                        'event-visibility-switch' +
                                        (draft.show_macro ? ' is-on' : '')
                                    }
                                    aria-pressed={draft.show_macro}
                                    onClick={() =>
                                        updateField('show_macro', !draft.show_macro)
                                    }
                                >
                                    <span
                                        className="event-visibility-switch-track"
                                        aria-hidden="true"
                                    >
                                        <span className="event-visibility-switch-thumb" />
                                    </span>
                                    <span className="event-visibility-switch-label">
                                        {draft.show_macro ? 'Oui' : 'Non'}
                                    </span>
                                </button>
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Micro planning</dt>
                            <dd>
                                <button
                                    type="button"
                                    className={
                                        'event-visibility-switch' +
                                        (draft.show_micro ? ' is-on' : '')
                                    }
                                    aria-pressed={draft.show_micro}
                                    onClick={() =>
                                        updateField('show_micro', !draft.show_micro)
                                    }
                                >
                                    <span
                                        className="event-visibility-switch-track"
                                        aria-hidden="true"
                                    >
                                        <span className="event-visibility-switch-thumb" />
                                    </span>
                                    <span className="event-visibility-switch-label">
                                        {draft.show_micro ? 'Oui' : 'Non'}
                                    </span>
                                </button>
                            </dd>
                        </div>

                        {/* NOTE: toggleSalle est disponible si tu ajoutes une UI de sÃ©lection des salles */}
                        {/* toggleSalle('room-id') */}
                    </dl>
                </section>

                <section className="event-detail-section event-detail-section-right">
                    <h3 className="event-detail-section-title">
                        Description / commentaires
                    </h3>
                    <textarea
                        className="event-detail-textarea"
                        placeholder="Notes sur l evenement, objectifs, intervenants, public vise..."
                        value={draft.description}
                        onChange={(e) =>
                            updateField('description', e.target.value)
                        }
                        rows={4}
                    />
                </section>

                <DetailCardFooter
                    onCancel={onClose}
                    onSave={() => void saveDraft()}
                    onAfterSaveConfirm={onClose}
                    onDelete={isCreate ? undefined : onDelete}
                    hasChanges={hasChanges}
                    saveLabel={saving ? 'Enregistrement...' : isCreate ? 'Creer' : 'Enregistrer'}
                    deleteLabel="Supprimer"
                    deleteTitle="Supprimer cet evenement"
                    deleteMessage={
                        <>
                            Vous allez supprimer{' '}
                            <strong>{draft.name || 'cet evenement'}</strong>.
                            <br />
                            Confirmer ?
                        </>
                    }
                    deleteConfirmLabel="Supprimer"
                    confirmTitle={
                        isCreate
                            ? 'Creer cet evenement'
                            : 'Confirmer les modifications'
                    }
                    confirmMessage={
                        isCreate ? (
                            <>
                                Vous Ãªtes sur le point de crÃ©er
                                l&apos;Ã©vÃ©nement{' '}
                                <strong>
                                    {draft.name || 'sans titre'}
                                </strong>
                                .
                                <br />
                                Confirmer&nbsp;?
                            </>
                        ) : (
                            <>
                                Vous Ãªtes sur le point d&apos;enregistrer les
                                modifications pour{' '}
                                <strong>{draft.name}</strong>.
                                <br />
                                Confirmer&nbsp;?
                            </>
                        )
                    }
                    confirmLabel={isCreate ? 'Creer' : 'Enregistrer'}
                    cancelLabel="Annuler"
                    cancelDirtyTitle="Modifications non enregistrees"
                    cancelDirtyMessage={
                        <>
                            <p>Vous avez modifie cette fiche evenement.</p>
                            <p>
                                Souhaitez-vous enregistrer les changements avant
                                de fermer ?
                            </p>
                        </>
                    }
                    cancelDirtyConfirmLabel={
                        isCreate ? 'Creer et fermer' : 'Enregistrer et fermer'
                    }
                    cancelDirtyDiscardLabel="Fermer sans enregistrer"
                    onBeforeSaveClick={() => {
                        if (isCreate && !isValid) {
                            window.alert(CREATE_EVENT_REQUIRED_FIELDS_ALERT)
                            return false
                        }
                        return true
                    }}
                />
            </DetailCardBody>

            <ConfirmDialog
                open={isConfirmOpen}
                title="Modifications non enregistrees"
                message={
                    <>
                        <p>Vous avez modifie cette fiche evenement.</p>
                        <p>
                            Souhaitez-vous enregistrer les changements avant de
                            fermer ?
                        </p>
                    </>
                }
                confirmLabel={
                    isCreate ? 'Creer et fermer' : 'Enregistrer et fermer'
                }
                cancelLabel="Fermer sans enregistrer"
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />
        </div>
    )
}
