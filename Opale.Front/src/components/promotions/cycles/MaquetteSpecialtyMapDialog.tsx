import React from 'react'
import ConfirmDialog from '../../common/ConfirmDialog'
import { Promotion } from '../../../models'
import { DetectedSpecialtyItem, SpecialtyDraft } from './maquetteImportTypes'

interface MaquetteSpecialtyMapDialogProps {
    open: boolean
    fileName: string | null
    mappingSaving: boolean
    mappingError: string | null
    detectedItems: DetectedSpecialtyItem[]
    draftSpecialtiesByPromoId: Record<string, SpecialtyDraft[]>
    mappingSelectionsByPromo: Record<string, Set<string>>
    mapping: Record<string, string | null>
    mappingPromoIds: string[]
    promotions: Promotion[]
    confirmDisabled: boolean
    onSelectionChange: (detectedKey: string, value: string) => void
    onAddDraftSpecialty: (promoId: string) => void
    onSpecialtyNameChange: (promoId: string, index: number, value: string) => void
    onSpecialtyEffectifsChange: (promoId: string, index: number, value: string) => void
    onRemoveDraftSpecialty: (promoId: string, index: number) => void
    onConfirm: () => void
    onSkip: () => void
    onCancel: () => void
}

const MaquetteSpecialtyMapDialog: React.FC<MaquetteSpecialtyMapDialogProps> = ({
    open,
    fileName,
    mappingSaving,
    mappingError,
    detectedItems,
    draftSpecialtiesByPromoId,
    mappingSelectionsByPromo,
    mapping,
    mappingPromoIds,
    promotions,
    confirmDisabled,
    onSelectionChange,
    onAddDraftSpecialty,
    onSpecialtyNameChange,
    onSpecialtyEffectifsChange,
    onRemoveDraftSpecialty,
    onConfirm,
    onSkip,
    onCancel,
}) => (
    <ConfirmDialog
        open={open}
        title="Associer les spécialités détectées"
        message={(
            <div className="maquette-specialty-map">
                <div className="maquette-specialty-map-header">
                    {fileName && (
                        <div className="maquette-specialty-map-file">
                            Fichier : <strong>{fileName}</strong>
                        </div>
                    )}
                    {mappingSaving && (
                        <div className="maquette-specialty-map-status">
                            Enregistrement des spécialités...
                        </div>
                    )}
                    {mappingError && (
                        <div className="maquette-specialty-map-error">
                            {mappingError}
                        </div>
                    )}
                </div>

                <div className="maquette-specialty-map-columns">
                    <div className="maquette-specialty-map-column">
                        <h4>Spécialités détectées</h4>
                        {detectedItems.map((item) => {
                            const promoSpecialties = item.promotionId
                                ? (draftSpecialtiesByPromoId[item.promotionId] || [])
                                : []
                            const usedSelections = item.promotionId
                                ? mappingSelectionsByPromo[item.promotionId] || new Set()
                                : new Set()
                            const selectedValue = mapping[item.key] || ''

                            return (
                                <div className="maquette-specialty-map-row" key={item.key}>
                                    <div className="maquette-specialty-map-promo">
                                        <span className="maquette-specialty-map-promo-code">
                                            {item.promotionCode}
                                        </span>
                                        {item.promotionLabel && (
                                            <span className="maquette-specialty-map-promo-label">
                                                {item.promotionLabel}
                                            </span>
                                        )}
                                    </div>
                                    <div className="maquette-specialty-map-detected">
                                        {item.detectedLabel}
                                    </div>
                                    <div className="maquette-specialty-map-select">
                                        {item.promotionId ? (
                                            <select
                                                className="promo-edit-input"
                                                value={selectedValue}
                                                onChange={(event) =>
                                                    onSelectionChange(item.key, event.target.value)
                                                }
                                                disabled={mappingSaving}
                                            >
                                                <option value="">
                                                    Tronc commun
                                                </option>
                                                {promoSpecialties.map((specialty) => {
                                                    const optionValue =
                                                        specialty.id || specialty.tempId || ''
                                                    const isUsed =
                                                        optionValue &&
                                                        usedSelections.has(optionValue) &&
                                                        optionValue !== selectedValue

                                                    return (
                                                        <option
                                                            key={optionValue}
                                                            value={optionValue}
                                                            disabled={isUsed}
                                                        >
                                                            {specialty.nom}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        ) : (
                                            <span className="maquette-specialty-map-unknown">
                                                Promotion inconnue
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="maquette-specialty-map-column">
                        <h4>Spécialités déclarées (card promo)</h4>
                        {mappingPromoIds.length === 0 && (
                            <div className="maquette-specialty-map-empty">
                                Aucune promotion associée aux spécialités détectées.
                            </div>
                        )}
                        {mappingPromoIds.map((promoId) => {
                            const promo = promotions.find((promotion) => promotion.id === promoId)
                            const specialties = draftSpecialtiesByPromoId[promoId] || []

                            return (
                                <div className="maquette-specialty-map-group" key={promoId}>
                                    <div className="maquette-specialty-map-group-head">
                                        <div>
                                            <span className="maquette-specialty-map-group-title">
                                                Promotion
                                            </span>
                                            <strong>
                                                {promo?.label || promoId}
                                            </strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-tertiary"
                                            onClick={() => onAddDraftSpecialty(promoId)}
                                            disabled={mappingSaving}
                                        >
                                            + Ajouter
                                        </button>
                                    </div>

                                    {specialties.length === 0 && (
                                        <div className="maquette-specialty-map-empty">
                                            Aucune spécialité pour cette promotion.
                                        </div>
                                    )}

                                    <div className="maquette-specialty-map-list">
                                        {specialties.map((specialty, index) => (
                                            <div
                                                key={specialty.id || specialty.tempId}
                                                className="maquette-specialty-map-item"
                                            >
                                                <input
                                                    type="text"
                                                    className="promo-edit-input"
                                                    value={specialty.nom}
                                                    onChange={(event) =>
                                                        onSpecialtyNameChange(
                                                            promoId,
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={mappingSaving}
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="promo-edit-input maquette-specialty-map-count"
                                                    value={specialty.effectifs}
                                                    onChange={(event) =>
                                                        onSpecialtyEffectifsChange(
                                                            promoId,
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={mappingSaving}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-danger btn-icon-only"
                                                    onClick={() =>
                                                        onRemoveDraftSpecialty(promoId, index)
                                                    }
                                                    disabled={mappingSaving}
                                                    aria-label="Supprimer la spécialité"
                                                    title="Supprimer"
                                                >
                                                    <span className="btn-label">Supprimer</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="maquette-specialty-map-note">
                    Les spécialités non associées seront importées en tronc commun.
                </div>
            </div>
        )}
        confirmLabel="Appliquer & importer"
        cancelLabel="Importer sans lier"
        confirmClassName="btn-primary"
        cancelClassName="btn-tertiary"
        cardClassName="maquette-specialty-map-dialog"
        onConfirm={onConfirm}
        onCancel={onSkip}
        onRequestClose={onCancel}
        confirmDisabled={mappingSaving || confirmDisabled}
        cancelDisabled={mappingSaving}
    />
)

export default MaquetteSpecialtyMapDialog
