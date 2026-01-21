// src/components/matieres/MatiereCard.tsx
import React from 'react'
import EntityCard from '../common/EntityCard'
import EntityBadge from '../common/EntityBadge'
import icOther from '../../assets/ic-event-other.png'
import { Matiere } from '../../models/Matiere'

interface MatiereCardProps {
    matiere: Matiere
    onSelect: () => void
}

export default function MatiereCard({ matiere, onSelect }: MatiereCardProps) {
    const tp = matiere.heures_tp ?? 0

    return (
        <EntityCard
            onClick={onSelect}
            className="matiere-card"
            mainClassName="matiere-card-main"
            asideClassName="matiere-card-badge"
            badge={<EntityBadge iconSrc={icOther} label={`S${matiere.semestre}`} />}
            variant="compact"
        >
            <div className="matiere-card-name">{matiere.nom}</div>
            <div className="matiere-card-meta">
                {matiere.volume_horaire}h · TD {matiere.heures_td}h · TP {tp}h
            </div>
        </EntityCard>
    )
}
