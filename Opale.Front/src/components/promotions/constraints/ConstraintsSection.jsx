// src/components/promotions/constraints/ConstraintsSection.jsx
import React, { useState } from 'react'
import ConstraintCard from './ConstraintCard.jsx'

const isApPromo = (name) => /^AP/i.test(name || '')

export default function ConstraintsSection({
                                               promoName,
                                               constraints,
                                               onAddConstraint,
                                               onRemoveConstraint,
                                               onUpdateConstraintRange,
                                           }) {
    const [editingRange, setEditingRange] = useState(null) // { type, id } ou null

    const safeConstraints = constraints || {}
    const getRanges = (type) => safeConstraints[type] || []

    const handleRangeClick = (type, id) => {
        setEditingRange({ type, id })
    }

    const handleRangeDateChange = (type, id, field, value) => {
        if (onUpdateConstraintRange) {
            onUpdateConstraintRange(type, id, field, value)
        }
    }

    const handleRemoveRange = (type, id) => {
        if (onRemoveConstraint) {
            onRemoveConstraint(type, id)
        }
        if (editingRange && editingRange.type === type && editingRange.id === id) {
            setEditingRange(null)
        }
    }

    const useEntreprise = isApPromo(promoName)
    const firstType = useEntreprise ? 'entreprise' : 'vacances'
    const firstLabel = useEntreprise ? 'Entreprise' : 'Vacances'
    const firstCardClass = `constraint-card ${
        useEntreprise ? 'constraint-entreprise' : 'constraint-vacances'
    }`
    const firstPillClass = useEntreprise
        ? 'constraint-pill-entreprise'
        : 'constraint-pill-vacances'

    return (
        <section className="promo-section promo-section-constraints">
            <h4 className="promo-section-title">Contraintes académiques</h4>

            <div className="constraints-grid">
                {/* Vacances / Entreprise */}
                <ConstraintCard
                    type={firstType}
                    title={firstLabel}
                    cardClass={firstCardClass}
                    pillClass={firstPillClass}
                    ranges={getRanges(firstType)}
                    canRemove={true}
                    editingRange={editingRange}
                    onRangeClick={handleRangeClick}
                    onRangeDateChange={handleRangeDateChange}
                    onRemoveRange={handleRemoveRange}
                    onAddConstraint={onAddConstraint}
                />

                {/* Stages */}
                <ConstraintCard
                    type="stages"
                    title="Stages"
                    cardClass="constraint-card constraint-stages"
                    pillClass="constraint-pill-stages"
                    ranges={getRanges('stages')}
                    canRemove={true}
                    editingRange={editingRange}
                    onRangeClick={handleRangeClick}
                    onRangeDateChange={handleRangeDateChange}
                    onRemoveRange={handleRemoveRange}
                    onAddConstraint={onAddConstraint}
                />

                {/* International */}
                <ConstraintCard
                    type="international"
                    title="International"
                    cardClass="constraint-card constraint-international"
                    pillClass="constraint-pill-international"
                    ranges={getRanges('international')}
                    canRemove={true}
                    editingRange={editingRange}
                    onRangeClick={handleRangeClick}
                    onRangeDateChange={handleRangeDateChange}
                    onRemoveRange={handleRemoveRange}
                    onAddConstraint={onAddConstraint}
                />

                {/* Partiels */}
                <ConstraintCard
                    type="partiels"
                    title="Partiels"
                    cardClass="constraint-card constraint-partiels"
                    pillClass="constraint-pill-partiels"
                    ranges={getRanges('partiels')}
                    canRemove={true}
                    editingRange={editingRange}
                    onRangeClick={handleRangeClick}
                    onRangeDateChange={handleRangeDateChange}
                    onRemoveRange={handleRemoveRange}
                    onAddConstraint={onAddConstraint}
                />

                {/* Rattrapages */}
                <ConstraintCard
                    type="rattrapages"
                    title="Rattrapages"
                    cardClass="constraint-card constraint-rattrapages"
                    pillClass="constraint-pill-rattrapages"
                    ranges={getRanges('rattrapages')}
                    canRemove={true}
                    editingRange={editingRange}
                    onRangeClick={handleRangeClick}
                    onRangeDateChange={handleRangeDateChange}
                    onRemoveRange={handleRemoveRange}
                    onAddConstraint={onAddConstraint}
                />
            </div>
        </section>
    )
}