export default function PromoSpecialties({
                                             specialties,
                                             onAddSpecialty,
                                             onSpecialtyChange,
                                             onRemoveSpecialty,
                                         }) {
    return (
        <section className="promo-section">
            <h4 className="promo-section-title">Spécialités</h4>

            <button type="button" className="btn-tertiary" onClick={onAddSpecialty}>
                + Ajouter une spécialité
            </button>

            <ul className="promo-list">
                {specialties.map((s, index) => (
                    <li key={s.id} className="promo-list-item">

                        <div className="promo-list-main">
                            <input
                                type="text"
                                className="promo-edit-input promo-list-name"
                                value={s.name}
                                onChange={(e) => onSpecialtyChange(index, 'name', e.target.value)}
                            />
                            <input
                                type="number"
                                min="0"
                                className="promo-edit-input promo-list-count"
                                value={s.students}
                                onChange={(e) => onSpecialtyChange(index, 'students', e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn-danger btn-icon-responsive"
                            onClick={() => onRemoveSpecialty(index)}
                        >
                            <span className="btn-label">Supprimer</span>
                        </button>

                    </li>
                ))}
            </ul>
        </section>
    )
}