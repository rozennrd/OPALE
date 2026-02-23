// src/components/matieres/MatiereCard.tsx
import React from 'react'
import EntityCard from '../common/EntityCard'
import EntityBadge from '../common/EntityBadge'
import icOther from '../../assets/ic-event-other.png'
import { Matiere } from '../../models/Matiere'

interface MatiereCardProps {
    matiere: Matiere
    onSelect: () => void
    selectionMode?: boolean
    selected?: boolean
    onToggleSelect?: () => void
}

export default function MatiereCard({
    matiere,
    onSelect,
    selectionMode = false,
    selected = false,
    onToggleSelect,
}: MatiereCardProps) {
    const tp = matiere.heures_tp ?? 0

    const handleClick = () => {
        if (selectionMode) {
            if (onToggleSelect) onToggleSelect()
            return
        }

        onSelect()
    }

    return (
        <EntityCard
            onClick={handleClick}
            className="matiere-card"
            mainClassName="matiere-card-main"
            asideClassName="matiere-card-badge"
            badge={<EntityBadge iconSrc={icOther} label={`S${matiere.semestre}`} />}
            variant="compact"
            selectionMode={selectionMode}
            selected={selected}
        >
            <div className="matiere-card-name">{matiere.nom}</div>
            <div className="matiere-card-meta">
                {matiere.volume_horaire}h | TD {matiere.heures_td}h | TP {tp}h
            </div>
        </EntityCard>
    )
}
