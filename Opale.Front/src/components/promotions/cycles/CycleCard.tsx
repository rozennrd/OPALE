import React from 'react'
import icMoins from '../../../assets/ic-moins.png'
import icWarning from '../../../assets/ic-warning.png'
import icModif from '../../../assets/ic-modif.png'

import { hasPromoMismatch } from '../../../utils/promoUtils'
import { Cycle } from '../../../models'

interface CycleCardProps {
    cycle: Cycle
    renameCycle: (cycleId: string, name: string) => void
    removeCycle: (cycleId: string) => void
    openEditPromotion: (cycleId: string, promoId: string) => void
    removePromotion: (cycleId: string, promoId: string) => void
}

const CycleCard: React.FC<CycleCardProps> = ({
    cycle,
    renameCycle,
    removeCycle,
    openEditPromotion,
    removePromotion,
}) => {
    return (
        <section className="card cycle-card">
            <div className="cycle-head">
                <input
                    className="cycle-name"
                    value={cycle.name}
                    onChange={(e) => renameCycle(cycle.id, e.target.value)}
                />

                <div className="cycle-actions">
                    <button
                        className="btn-danger btn-icon-responsive"
                        onClick={() => removeCycle(cycle.id)}
                    >
                        <img src={icMoins} alt="" />
                        <span className="btn-label">Supprimer le cycle</span>
                    </button>
                </div>
            </div>

            <div className="promotions">
                {cycle.promotions.length === 0 && (
                    <div className="empty">Aucune promotion affichée pour ce cycle.</div>
                )}

                {cycle.promotions.map((promo) => (
                    <div key={promo.id} className="promo-row">
                        <div className="promo-main">
                            <span className="promo-label">{promo.label}</span>

                            {hasPromoMismatch(promo) && (
                                <img src={icWarning} className="promo-warning" alt="" />
                            )}
                        </div>

                        <div className="promo-actions">
                            <button
                                className="btn-tertiary btn-icon-responsive"
                                onClick={() => openEditPromotion(cycle.id, promo.id)}
                            >
                                <img src={icModif} alt="" />
                                <span className="btn-label">Modifier</span>
                            </button>

                            <button
                                className="btn-danger btn-icon-responsive"
                                onClick={() => removePromotion(cycle.id, promo.id)}
                            >
                                <img src={icMoins} alt="" />
                                <span className="btn-label">Supprimer</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
export default CycleCard
