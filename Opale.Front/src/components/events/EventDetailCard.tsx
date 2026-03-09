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
import { useEffect, useMemo, useRef, useState } from 'react'
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
    'Merci de remplir tous les champs obligatoires (nom, dates, lieu, type, cible) avant de créer cet événement.'
const INVALID_EVENT_DATES_ALERT =
    "La date/heure de fin doit être strictement postérieure à la date/heure de début."

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
    const [isPromotionsOpen, setIsPromotionsOpen] = useState(false)
    const promotionsDropdownRef = useRef<HTMLDivElement | null>(null)

    const {
        draft,
        hasChanges,
        saving,
        updateField,
        updateFields,
        handleSave,
    } = useEventDetail(event, onSave)

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const isValid =
        draft.name.trim().length > 0 &&
        draft.startDate.trim().length > 0 &&
        draft.endDate.trim().length > 0 &&
        draft.location.trim().length > 0 &&
        !!draft.type &&
        !!draft.source

    const hasInvalidDates = (() => {
        if (!draft.startDate || !draft.endDate) return false
        const start = new Date(draft.startDate)
        const end = new Date(draft.endDate)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true
        return end.getTime() <= start.getTime()
    })()

    const promotionTargets = cycles.flatMap((cycle) =>
        cycle.promotions.map((promotion) => ({
            promotionId: promotion.id,
            promotionLabel: promotion.label,
            cycleId: cycle.id,
        })),
    )

    const selectedPromotionLabels = useMemo(() => {
        const selectedSet = new Set(draft.concernedPromotionIds)
        return promotionTargets
            .filter((target) => selectedSet.has(target.promotionId))
            .map((target) => target.promotionLabel)
    }, [draft.concernedPromotionIds, promotionTargets])

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

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!isPromotionsOpen) return
            if (
                promotionsDropdownRef.current &&
                !promotionsDropdownRef.current.contains(event.target as Node)
            ) {
                setIsPromotionsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [isPromotionsOpen])

    const saveDraft = async (closeOnSuccess = true): Promise<boolean> => {
        const result = await handleSave()
        if (!result.success) {
            console.error('[EVENTS] Save failed:', result.error)
            return false
        }

        if (closeOnSuccess) {
            onClose()
        }

        return true
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

    const togglePromotionSelection = (promotionId: string) => {
        const currentSet = new Set(draft.concernedPromotionIds)
        if (currentSet.has(promotionId)) {
            currentSet.delete(promotionId)
        } else {
            currentSet.add(promotionId)
        }
        handlePromotionChange(Array.from(currentSet))
    }

    const headerTitle =
        draft.name || (isCreate ? 'Nouvel événement' : 'Événement sans titre')

    const headerSubtitle = (() => {
        const start = formatDate(draft.startDate)
        const end =
            draft.startDate &&
            draft.endDate &&
            draft.startDate !== draft.endDate
                ? ` -> ${formatDate(draft.endDate)}`
                : ''
        const location = draft.location ? ` · ${draft.location}` : ''
        return `${start}${end}${location}`
    })()

    const eventDisplayName = draft.name.trim() || 'sans titre'

    const cancelCreateTitle = 'Création non enregistrée'
    const cancelCreateMessage = (
        <>
            <p>
                Vous êtes en train de créer l&apos;événement{' '}
                <strong>{eventDisplayName}</strong>.
            </p>
            <p>Souhaitez-vous créer avant de fermer ?</p>
        </>
    )

    const cancelEditTitle = 'Modifications non enregistrées'
    const cancelEditMessage = (
        <>
            <p>Vous avez modifié cette fiche événement.</p>
            <p>
                Souhaitez-vous enregistrer les changements avant de fermer ?
            </p>
        </>
    )

    const openErrorDialog = (message: string) => {
        setErrorMessage(message)
    }

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
                openErrorDialog(CREATE_EVENT_REQUIRED_FIELDS_ALERT)
                return
            }
            if (hasInvalidDates) {
                openErrorDialog(INVALID_EVENT_DATES_ALERT)
                return
            }
            void saveDraft(true)
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    return (
        <div className="event-detail-overlay" role="dialog" aria-modal="true">
            <DetailCardBody className="event-detail-card">
                <DetailCardHeader
                    onClose={handleRequestClose}
                    closeAriaLabel="Fermer la fiche événement"
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
                                    <div
                                        className="event-detail-multiselect"
                                        ref={promotionsDropdownRef}
                                    >
                                        <button
                                            type="button"
                                            className="event-detail-multiselect-trigger"
                                            onClick={() =>
                                                setIsPromotionsOpen((prev) => !prev)
                                            }
                                            aria-expanded={isPromotionsOpen}
                                            aria-haspopup="listbox"
                                        >
                                            <span className="event-detail-multiselect-value">
                                                {selectedPromotionLabels.length > 0
                                                    ? selectedPromotionLabels.join(', ')
                                                    : 'Sélectionnez une ou plusieurs promotions'}
                                            </span>
                                            <span
                                                className={
                                                    'event-detail-multiselect-chevron' +
                                                    (isPromotionsOpen ? ' is-open' : '')
                                                }
                                                aria-hidden="true"
                                            >
                                                ▾
                                            </span>
                                        </button>

                                        {isPromotionsOpen && (
                                            <div
                                                className="event-detail-multiselect-menu"
                                                role="listbox"
                                                aria-multiselectable="true"
                                            >
                                                {promotionTargets.map((promotionTarget) => {
                                                    const isSelected = draft.concernedPromotionIds.includes(
                                                        promotionTarget.promotionId,
                                                    )
                                                    return (
                                                        <button
                                                            key={promotionTarget.promotionId}
                                                            type="button"
                                                            className={
                                                                'event-detail-multiselect-option' +
                                                                (isSelected
                                                                    ? ' is-selected'
                                                                    : '')
                                                            }
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            onClick={() =>
                                                                togglePromotionSelection(
                                                                    promotionTarget.promotionId,
                                                                )
                                                            }
                                                        >
                                                            <span className="event-detail-multiselect-option-label">
                                                                {
                                                                    promotionTarget.promotionLabel
                                                                }
                                                            </span>
                                                            {isSelected && (
                                                                <span
                                                                    className="event-detail-multiselect-option-check"
                                                                    aria-hidden="true"
                                                                >
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {draft.concernedPromotionIds.length === 0 && (
                                        <small className="event-detail-input-help">
                                            Sélectionnez une ou plusieurs promotions.
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

                        {/* NOTE: toggleSalle est disponible si tu ajoutes une UI de sélection des salles */}
                        {/* toggleSalle('room-id') */}
                    </dl>
                </section>

                <section className="event-detail-section event-detail-section-right">
                    <h3 className="event-detail-section-title">
                        Description / commentaires
                    </h3>
                    <textarea
                        className="event-detail-textarea"
                        placeholder="Notes sur l'événement, objectifs, intervenants, public visé..."
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
                        onSave={() => saveDraft(true)}
                        onDelete={isCreate ? undefined : onDelete}
                        hasChanges={hasChanges}
                        hideCancel
                        saveLabel={
                            saving
                                ? 'Enregistrement...'
                                : isCreate
                                  ? 'Créer'
                                  : 'Enregistrer'
                        }
                        deleteLabel="Supprimer"
                        deleteTitle="Supprimer cet événement"
                        deleteMessage={
                            <>
                                Vous allez supprimer{' '}
                                <strong>{draft.name || 'cet événement'}</strong>
                                .
                                <br />
                                Confirmer ?
                            </>
                        }
                        deleteConfirmLabel="Supprimer"
                        confirmTitle={
                            isCreate
                                ? 'Créer cet événement'
                                : 'Confirmer les modifications'
                        }
                        confirmMessage={
                            isCreate ? (
                                <>
                                    Vous êtes sur le point de créer
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
                        confirmLabel={isCreate ? 'Créer' : 'Enregistrer'}
                        cancelLabel="Annuler"
                        cancelDirtyTitle={
                            isCreate ? cancelCreateTitle : cancelEditTitle
                        }
                        cancelDirtyMessage={
                            isCreate ? cancelCreateMessage : cancelEditMessage
                        }
                        cancelDirtyConfirmLabel={
                            isCreate ? 'Fermer et créer' : 'Enregistrer et fermer'
                        }
                        cancelDirtyDiscardLabel={
                            isCreate ? 'Fermer sans créer' : 'Fermer sans enregistrer'
                        }
                        onBeforeSaveClick={() => {
                            if (isCreate && !isValid) {
                                openErrorDialog(CREATE_EVENT_REQUIRED_FIELDS_ALERT)
                                return false
                            }
                            if (hasInvalidDates) {
                                openErrorDialog(INVALID_EVENT_DATES_ALERT)
                                return false
                            }
                            return true
                        }}
                    />
                </div>
            </DetailCardBody>

            <ConfirmDialog
                open={isConfirmOpen}
                title={isCreate ? cancelCreateTitle : cancelEditTitle}
                message={isCreate ? cancelCreateMessage : cancelEditMessage}
                confirmLabel={
                    isCreate ? 'Fermer et créer' : 'Enregistrer et fermer'
                }
                cancelLabel={
                    isCreate ? 'Fermer sans créer' : 'Fermer sans enregistrer'
                }
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />

            <ConfirmDialog
                open={!!errorMessage}
                title="Erreur"
                message={errorMessage ?? ''}
                confirmLabel="OK"
                confirmClassName="btn-primary"
                onConfirm={() => setErrorMessage(null)}
                onCancel={() => setErrorMessage(null)}
                onRequestClose={() => setErrorMessage(null)}
                hideCancel
                variant="danger"
            />
        </div>
    )
}
