import { CampusEvent } from '../../models/CampusEvent'
import { EventType, EVENT_TYPE_LABELS } from '../../models/EventTypes'
import { useEventDetail } from '../../hooks/events/useEventDetail'
import { Cycle } from '../../models/Cycle'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardBody from '../common/DetailCardBody'
import ActionButtonsWithConfirm from '../common/ActionButtonsWithConfirm'
import EventTypeBadge from './EventTypeBadge'
import ConfirmDialog from '../common/ConfirmDialog'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'
import { useEffect } from 'react'
import DateInput from '../common/DateInput'
import {eventPageTypes} from "../../pages/Events.tsx";
import type { Salle } from '../../services/api/sallesApi'

type SaveResult = { success: boolean; error?: string }

interface EventDetailCardProps {
    event: CampusEvent
    cycles?: Cycle[]
    salles?: Salle[]
    onDelete?: () => void
    mode?: 'edit' | 'create'
    onClose: () => void
    onSave: (event: Partial<CampusEvent>, salleIds: string[]) => Promise<SaveResult>
}

export const constraintEventTypes: EventType[] = [
    'Forum',
    'JPO',
    'Salon',
    'Examen',
    'Conference',
    'Autre',
]

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

const EVENT_LOCATION_DATALIST_ID = 'event-location-suggestions'

const buildRoomLocationSuggestions = (salles: Salle[]): string[] =>
    Array.from(
        new Set(
            salles
                .map((salle) => salle.nom_complet ?? salle.nom)
                .filter((label): label is string => Boolean(label && label.trim())),
        ),
    ).sort((a, b) =>
        a.localeCompare(b, 'fr', {
            numeric: true,
            sensitivity: 'base',
        }),
    )

function getSalleIdsForLocation(location: string, salles: Salle[]): string[] {
    const normalizedLocation = location.trim().toLowerCase()
    if (!normalizedLocation) return []

    return salles
        .filter((salle) => {
            const labels = [salle.nom_complet, salle.nom]
                .filter((label): label is string => Boolean(label))
                .map((label) => label.trim().toLowerCase())
            return labels.includes(normalizedLocation)
        })
        .map((salle) => salle.id)
}

const CREATE_EVENT_REQUIRED_FIELDS_ALERT =
    'Merci de remplir tous les champs obligatoires (nom, dates, lieu, type, cible) avant de creer cet evenement.'

export default function EventDetailCard({
                                            event,
                                            cycles = [],
                                            salles = [],
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

    const roomLocationSuggestions = buildRoomLocationSuggestions(salles)

    useEffect(() => {
        const nextSalleIds = getSalleIdsForLocation(draft.location, salles)
        const currentSalleIds = draft.selectedSalleIds

        const sameLength = currentSalleIds.length === nextSalleIds.length
        const sameValues =
            sameLength && currentSalleIds.every((id) => nextSalleIds.includes(id))

        if (!sameValues) {
            updateField('selectedSalleIds', nextSalleIds)
        }
    }, [draft.location, draft.selectedSalleIds, salles, updateField])

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

    const handlePromotionChange = (promotionIds: string[]) => {
        if (promotionIds.length === 0) {
            updateFields({
                concernedCycleIds: [],
                concernedPromotionIds: [],
            })
            return
        }

        const selectedTargets = promotionTargets.filter((promotionTarget) =>
            promotionIds.includes(promotionTarget.promotionId),
        )

        if (selectedTargets.length === 0) return

        const selectedCycleIds = Array.from(
            new Set(selectedTargets.map((target) => target.cycleId)),
        )
        const selectedPromotionIds = selectedTargets.map(
            (target) => target.promotionId,
        )

        updateFields({
            source: 'JUNIA',
            concernedCycleIds: selectedCycleIds,
            concernedPromotionIds: selectedPromotionIds,
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
                                <DateInput
                                    mode="datetime"
                                    value={draft.startDate}
                                    onChange={(value) =>
                                        updateField('startDate', value)
                                    }
                                    inputClassName="event-detail-input"
                                    max={draft.endDate || undefined}
                                />
                            </dd>
                        </div>

                        <div className="event-detail-info-row">
                            <dt>Date de fin</dt>
                            <dd>
                                <DateInput
                                    mode="datetime"
                                    value={draft.endDate}
                                    onChange={(value) =>
                                        updateField('endDate', value)
                                    }
                                    inputClassName="event-detail-input"
                                    min={draft.startDate || undefined}
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
                                    onChange={(e) => {
                                        const nextLocation = e.target.value
                                        updateFields({
                                            location: nextLocation,
                                            selectedSalleIds: getSalleIdsForLocation(
                                                nextLocation,
                                                salles,
                                            ),
                                        })
                                    }}
                                />
                                <datalist id={EVENT_LOCATION_DATALIST_ID}>
                                    {roomLocationSuggestions.map(
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
                                    {eventPageTypes.map((value) => (
                                        <option key={value} value={value}>
                                            {EVENT_TYPE_LABELS[value]}
                                        </option>
                                    ))}
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
                                        multiple
                                        value={draft.concernedPromotionIds}
                                        onChange={(e) =>
                                            handlePromotionChange(
                                                Array.from(
                                                    e.target.selectedOptions,
                                                    (option) => option.value,
                                                ),
                                            )
                                        }
                                    >
                                        {promotionTargets.map((promotionTarget) => (
                                            <option
                                                key={promotionTarget.promotionId}
                                                value={promotionTarget.promotionId}
                                            >
                                                {promotionTarget.promotionLabel}
                                            </option>
                                        ))}
                                    </select>
                                    {draft.concernedPromotionIds.length === 0 && (
                                        <small className="event-detail-input-help">
                                            Selectionnez une ou plusieurs promotions.
                                        </small>
                                    )}
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

                <div className="event-detail-footer">
                    <ActionButtonsWithConfirm
                        onCancel={handleRequestClose}
                        onSave={() => void saveDraft()}
                        onAfterSaveConfirm={isCreate ? onClose : undefined}
                        onDelete={isCreate ? undefined : onDelete}
                        hasChanges={hasChanges}
                        saveLabel={
                            saving
                                ? 'Enregistrement...'
                                : isCreate
                                  ? 'Creer'
                                  : 'Enregistrer'
                        }
                        deleteLabel="Supprimer"
                        deleteTitle="Supprimer cet evenement"
                        deleteMessage={
                            <>
                                Vous allez supprimer{' '}
                                <strong>{draft.name || 'cet evenement'}</strong>
                                .
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
                                    Vous etes sur le point de créer
                                    l&apos;événement{' '}
                                    <strong>
                                        {draft.name || 'sans titre'}
                                    </strong>
                                    .
                                    <br />
                                    Confirmer&nbsp;?
                                </>
                            ) : (
                                <>
                                    Vous êtes sur le point d&apos;enregistrer les
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
                                    Souhaitez-vous enregistrer les changements
                                    avant de fermer ?
                                </p>
                            </>
                        }
                        cancelDirtyConfirmLabel={
                            isCreate
                                ? 'Creer et fermer'
                                : 'Enregistrer et fermer'
                        }
                        cancelDirtyDiscardLabel="Fermer sans enregistrer"
                        onBeforeSaveClick={() => {
                            if (isCreate && !isValid) {
                                window.alert(
                                    CREATE_EVENT_REQUIRED_FIELDS_ALERT,
                                )
                                return false
                            }
                            return true
                        }}
                    />
                </div>
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
