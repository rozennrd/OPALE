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
    promoIsApprentissage: Boolean
    constraints: Constraints
    onAddConstraint: (type: string) => void
    onRemoveConstraint: (type: string, id: string) => void
    onUpdateConstraintRange: (type: string, id: string, field: 'start' | 'end', value: string) => void
    onAddEvent?: (type: string, startDate: string, endDate: string) => Promise<void>
    onUpdateEvent?: (eventId: string, type: string, startDate: string, endDate: string) => Promise<void>
    onDeleteEvent?: (eventId: string) => Promise<void>
    promoId?: string
}


const ConstraintsSection: React.FC<ConstraintsSectionProps> = ({
    promoIsApprentissage,
    constraints,
    onAddConstraint,
    onRemoveConstraint,
    onUpdateConstraintRange,
    promoId,
}) => {
    const [editingRange, setEditingRange] = useState<EditingRange | null>(null)

    const safeConstraints = constraints || {}
    const getRanges = (type: string) => safeConstraints[type as ConstraintType] || []

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

    const firstType = promoIsApprentissage ? 'entreprise' : 'vacances'
    const firstLabel = promoIsApprentissage ? 'Entreprise' : 'Vacances'
    const firstCardClass = `constraint-card ${
        promoIsApprentissage ? 'constraint-entreprise' : 'constraint-vacances'
    }`
    const firstPillClass = promoIsApprentissage
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
                    promoId={promoId}
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

                    promoId={promoId}
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
                    promoId={promoId}
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
                    promoId={promoId}
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
                    promoId={promoId}
                />
            </div>
        </section>
    )
}
export default ConstraintsSection
