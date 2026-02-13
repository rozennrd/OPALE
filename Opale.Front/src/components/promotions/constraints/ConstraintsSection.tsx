// src/components/promotions/constraints/ConstraintsSection.tsx
import React, { useState } from 'react'
import ConstraintCard from './ConstraintCard'
import { Constraints } from '../../../models'

interface EditingRange {
    type: string
    id: string
}

type ConstraintType = keyof Constraints

interface ConstraintsSectionProps {
    promoName: string
    constraints: Constraints
    onAddConstraint: (type: string) => void
    onRemoveConstraint: (type: string, id: string) => void
    onUpdateConstraintRange: (type: string, id: string, field: 'start' | 'end', value: string) => void
}

const isApPromo = (name: string): boolean => /^AP/i.test(name || '')

const ConstraintsSection: React.FC<ConstraintsSectionProps> = ({
    promoName,
    constraints,
    onAddConstraint,
    onRemoveConstraint,
    onUpdateConstraintRange,
}) => {
    const [editingRange, setEditingRange] = useState<EditingRange | null>(null)

    const safeConstraints = constraints || {}
    const getRanges = (type: string) => safeConstraints[type] || []

    const handleRangeClick = (type: string, id: string): void => {
        setEditingRange({ type, id })
    }

    const handleRangeDateChange = (type: string, id: string, field: 'start' | 'end', value: string): void => {
        if (onUpdateConstraintRange) {
            onUpdateConstraintRange(type, id, field, value)
        }
    }

    const handleRemoveRange = (type: string, id: string): void => {
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
export default ConstraintsSection
