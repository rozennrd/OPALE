import React from 'react'
import { EditingPromotion } from '../../../hooks/promotions/usePromotionEditing'

interface PromoMainInfoProps {
    editingPromo: EditingPromotion
    onFieldChange: (field: string, value: any) => void
    onStudentsBlur?: () => void
}

const PromoMainInfo: React.FC<PromoMainInfoProps> = ({
    editingPromo,
    onFieldChange,
    onStudentsBlur,
}) => {
    return (
        <section className="promo-section promo-section-main">
            <h4 className="promo-section-title">Informations principales</h4>

            <div className="promo-section-grid">

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Nom</span>
                    <input
                        type="text"
                        className="promo-edit-input"
                        value={editingPromo.name}
                        onChange={(e) => onFieldChange('name', e.target.value)}
                        required
                    />
                </label>

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Nombre d'étudiants</span>
                    <input
                        type="number"
                        min="0"
                        className="promo-edit-input"
                        value={editingPromo.students}
                        onChange={(e) => onFieldChange('students', e.target.value)}
                        onBlur={onStudentsBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                onStudentsBlur()
                            }
                        }}
                    />
                </label>

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Date de début</span>
                    <input
                        type="date"
                        className="promo-edit-input"
                        value={editingPromo.startDate}
                        onChange={(e) => onFieldChange('startDate', e.target.value)}
                    />
                </label>

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Date de fin</span>
                    <input
                        type="date"
                        className="promo-edit-input"
                        value={editingPromo.endDate}
                        onChange={(e) => onFieldChange('endDate', e.target.value)}
                    />
                </label>

            </div>
        </section>
    )
}
export default PromoMainInfo
