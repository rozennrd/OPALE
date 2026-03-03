import React from 'react'
import { EditingPromotion } from '../../../hooks/promotions/usePromotionEditing'
import DateInput from '../../common/DateInput'

interface PromoMainInfoProps {
    editingPromo: EditingPromotion
    onFieldChange: (field: string, value: string | number) => void
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
                    <span className="promo-edit-label">Nombre d&apos;étudiants</span>
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
                                onStudentsBlur?.()
                            }
                        }}
                    />
                </label>

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Date de début</span>
                    <DateInput
                        value={editingPromo.startDate}
                        onChange={(value) => onFieldChange('startDate', value)}
                        inputClassName="promo-edit-input"
                        max={editingPromo.endDate || undefined}
                    />
                </label>

                <label className="promo-edit-field">
                    <span className="promo-edit-label">Date de fin</span>
                    <DateInput
                        value={editingPromo.endDate}
                        onChange={(value) => onFieldChange('endDate', value)}
                        inputClassName="promo-edit-input"
                        min={editingPromo.startDate || undefined}
                    />
                </label>

            </div>
        </section>
    )
}
export default PromoMainInfo
