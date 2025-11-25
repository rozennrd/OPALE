import React from 'react'
import { GroupSpecialtyItem } from '../../../models'

interface PromoGroupsProps {
    groups: GroupSpecialtyItem[]
    onAddGroup: () => void
    onGroupChange: (index: number, field: string, value: any) => void
    onRemoveGroup: (index: number) => void
}

const PromoGroups: React.FC<PromoGroupsProps> = ({
    groups,
    onAddGroup,
    onGroupChange,
    onRemoveGroup,
}) => {
    return (
        <section className="promo-section">
            <h4 className="promo-section-title">Groupes</h4>

            <button type="button" className="btn-tertiary" onClick={onAddGroup}>
                + Ajouter un groupe
            </button>

            <ul className="promo-list">
                {groups.map((g, index) => (
                    <li key={g.id} className="promo-list-item">

                        <div className="promo-list-main">
                            <input
                                type="text"
                                className="promo-edit-input promo-list-name"
                                value={g.name}
                                onChange={(e) => onGroupChange(index, 'name', e.target.value)}
                            />
                            <input
                                type="number"
                                min="0"
                                className="promo-edit-input promo-list-count"
                                value={g.students}
                                onChange={(e) => onGroupChange(index, 'students', e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn-danger btn-icon-responsive"
                            onClick={() => onRemoveGroup(index)}
                        >
                            <span className="btn-label">Supprimer</span>
                        </button>

                    </li>
                ))}
            </ul>
        </section>
    )
}
export default PromoGroups
