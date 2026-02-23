// src/components/matieres/MatiereSection.tsx
import React, { useMemo, useState } from 'react'
import SectionHeader from '../common/SectionHeader'
import { Matiere } from '../../models/Matiere'
import MatiereCard from './MatiereCard'

interface MatiereSectionProps {
    promoLabel: string
    matieres: Matiere[]
    onSelectMatiere: (m: Matiere) => void
    selectionMode?: boolean
    selectedMatiereIds?: Set<string>
    onToggleMatiereSelection?: (matiereId: string) => void
}

export default function MatiereSection({
    promoLabel,
    matieres,
    onSelectMatiere,
    selectionMode = false,
    selectedMatiereIds,
    onToggleMatiereSelection,
}: MatiereSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const totalHours = useMemo(
        () => matieres.reduce((sum, m) => sum + (m.volume_horaire || 0), 0),
        [matieres],
    )

    if (!matieres || matieres.length === 0) return null

    const title = promoLabel
    const subtitle = `${totalHours}h au total`

    return (
        <section className="rooms-section">
            <SectionHeader
                title={title}
                subtitle={subtitle}
                isOpen={isOpen}
                onToggle={() => setIsOpen((prev) => !prev)}
                wrapperClassName="rooms-section-header"
                titleClassName="rooms-section-title"
                subtitleClassName="rooms-section-sub"
                chevronClassName="rooms-section-chevron"
            />

            {isOpen && (
                <div className="rooms-grid">
                    {matieres.map((matiere) => (
                        <MatiereCard
                            key={matiere.id}
                            matiere={matiere}
                            onSelect={() => onSelectMatiere(matiere)}
                            selectionMode={selectionMode}
                            selected={selectedMatiereIds?.has(matiere.id) ?? false}
                            onToggleSelect={() => {
                                if (onToggleMatiereSelection) {
                                    onToggleMatiereSelection(matiere.id)
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
