// src/components/promotions/cycles/CycleCard.tsx
import React, { useState } from 'react'
import icTrash from '../../../assets/ic-trash.png'
import icWarning from '../../../assets/ic-warning.png'
import icModif from '../../../assets/ic-modif.png'
import icPlus from '../../../assets/ic-plus.png'

import { hasPromoMismatch } from '../../../utils/promoUtils'
import { Cycle } from '../../models'
import CycleImportDropzone from './CycleImportDropZone'
import ConfirmDialog from '../../common/ConfirmDialog'


interface CycleCardProps {
    cycle: Cycle
    renameCycle: (cycleId: string, name: string) => void
    removeCycle: (cycleId: string) => void
    openEditPromotion: (cycleId: string, promoId: string) => void
    removePromotion: (promoId: string) => void
    addPromotion: (cycleId: string, label: string) => void
}

const CycleCard: React.FC<CycleCardProps> = ({
                                                 cycle,
                                                 renameCycle,
                                                 removeCycle,
                                                 openEditPromotion,
                                                 removePromotion,
                                                 addPromotion,
                                             }) => {
    const [cycleName, setCycleName] = useState(cycle.name);
    const [isAddPromoOpen, setIsAddPromoOpen] = useState(false)
    const [promoName, setPromoName] = useState('')

    const openAddPromoDialog = () => {
        const nextIndex = (cycle.promotions?.length || 0) + 1
        setPromoName(`${cycleName} ${nextIndex}`)
        setIsAddPromoOpen(true)
    }

    const closeAddPromoDialog = () => {
        setIsAddPromoOpen(false)
    }

    const handleConfirmAddPromo = () => {
        if (!promoName.trim()) return
        addPromotion(cycle.id, promoName)
        setIsAddPromoOpen(false)
    }
    return (
        <section className="card cycle-card">
            <div className="cycle-head">
                <input
                className="cycle-name"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                onBlur={() => renameCycle(cycle.id, cycleName)}
            />

                <div className="cycle-actions">
                    <button
                        className="btn-danger btn-icon-only"
                        onClick={() => removeCycle(cycle.id)}
                        aria-label="Supprimer le cycle"
                        title="Supprimer le cycle"
                    >
                        <img src={icTrash} alt="" aria-hidden="true" />
                        <span className="btn-label">Supprimer le cycle</span>
                    </button>
                </div>
            </div>

            <div className="promotions">
                {cycle.promotions.length === 0 && (
                    <div className="empty">
                        Aucune promotion affichée pour ce cycle.
                    </div>
                )}

                {cycle.promotions.map((promo) => (
                    <div key={promo.id} className="promo-row">
                        <div className="promo-main">
                            <span className="promo-label">{promo.label}</span>

                            {hasPromoMismatch(promo) && (
                                <img
                                    src={icWarning}
                                    alt="Répartition d'étudiants incohérente"
                                    className="promo-warning"
                                />
                            )}
                        </div>

                        <div className="promo-actions">
                            <button
                                className="btn-tertiary btn-icon-only"
                                onClick={() => openEditPromotion(cycle.id, promo.id)}
                                aria-label="Modifier la promotion"
                                title="Modifier la promotion"
                            >
                                <img src={icModif} alt="" aria-hidden="true" />
                                <span className="btn-label">Modifier</span>
                            </button>

                            <button
                                className="btn-danger btn-icon-only"
                                onClick={() => removePromotion(promo.id)}
                                aria-label="Supprimer la promotion"
                                title="Supprimer la promotion"
                            >
                                <img src={icTrash} alt="" aria-hidden="true" />
                                <span className="btn-label">Supprimer</span>
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className="btn-tertiary btn-add-promo btn-icon-responsive"
                    onClick={openAddPromoDialog}
                    aria-label="Ajouter une promotion"
                    title="Ajouter une promotion"
                >
                    <img src={icPlus} alt="" aria-hidden="true" />
                    <span className="btn-label">Ajouter une promotion</span>
                </button>
                {/* Dropzone Excel sous la dernière promo */}
                <CycleImportDropzone
                    cycleId={cycle.id}
                    onFilesSelected={(files) => {
                        // Pour l’instant : logique simulée côté front
                        console.log(
                            '[CycleCard] Fichiers Excel reçus pour le cycle',
                            cycle.id,
                            files,
                        )
                    }}
                />
            </div>

            <ConfirmDialog
                open={isAddPromoOpen}
                title="Ajouter une promotion"
                message={(
                    <div className="promo-edit-field">
                        <label className="promo-edit-label" htmlFor={`promo-name-${cycle.id}`}>
                            Nom de la promotion
                        </label>
                        <input
                            id={`promo-name-${cycle.id}`}
                            className="promo-edit-input"
                            value={promoName}
                            onChange={(e) => setPromoName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleConfirmAddPromo()
                                }
                            }}
                            autoFocus
                        />
                    </div>
                )}
                confirmLabel="Ajouter"
                cancelLabel="Annuler"
                cardClassName="promo-add-dialog"
                onConfirm={handleConfirmAddPromo}
                onCancel={closeAddPromoDialog}
                onRequestClose={closeAddPromoDialog}
            />
        </section>
    )
}

export default CycleCard
