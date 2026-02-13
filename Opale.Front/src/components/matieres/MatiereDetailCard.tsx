// src/components/matieres/MatiereDetailCard.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Matiere } from '../../models/Matiere'
import { Teacher } from '../../models/Teacher'
import { INTERNAL_TEACHERS_MOCK, VACATAIRE_TEACHERS_MOCK } from '../../mocks/teachers.mock'
import DetailCardBody from '../common/DetailCardBody'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardFooter from '../common/DetailCardFooter'
import ConfirmDialog from '../common/ConfirmDialog'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'
import MatiereBadge from './MatiereBadge'

interface MatiereDetailCardProps {
    matiere: Matiere
    onClose: () => void
}

type TeachKind = 'TD' | 'TP'

interface TeacherAssignment {
    rowId: string
    teacherId: string
    tdHours: number
    tpHours: number
}

const makeRowId = () => `assign-${Math.random().toString(16).slice(2)}`

const teacherLabel = (t: Teacher) => `${t.lastName.toUpperCase()} ${t.firstName}`

export default function MatiereDetailCard({ matiere, onClose }: MatiereDetailCardProps) {
    const teachers = useMemo(() => {
        const all = [...INTERNAL_TEACHERS_MOCK, ...VACATAIRE_TEACHERS_MOCK]
        return all.slice().sort((a, b) => teacherLabel(a).localeCompare(teacherLabel(b), 'fr'))
    }, [])

    const [name, setName] = useState(matiere.nom)
    const [volumeTotal, setVolumeTotal] = useState(matiere.volume_horaire)
    const [tdHours, setTdHours] = useState(matiere.heures_td)
    const [tpHours, setTpHours] = useState(matiere.heures_tp ?? 0)
    const [assignments, setAssignments] = useState<TeacherAssignment[]>(() => [
        { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 },
    ])

    useEffect(() => {
        setName(matiere.nom)
        setVolumeTotal(matiere.volume_horaire)
        setTdHours(matiere.heures_td)
        setTpHours(matiere.heures_tp ?? 0)
        setAssignments([{ rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 }])
    }, [matiere])

    const assignedTD = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tdHours) ? r.tdHours : 0), 0),
        [assignments],
    )
    const assignedTP = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tpHours) ? r.tpHours : 0), 0),
        [assignments],
    )

    const hasChanges =
        name !== matiere.nom ||
        volumeTotal !== matiere.volume_horaire ||
        tdHours !== matiere.heures_td ||
        tpHours !== (matiere.heures_tp ?? 0) ||
        assignments.some((a) => a.tdHours !== 0 || a.tpHours !== 0 || a.teacherId !== '')

    const handleAddAssignment = () => {
        setAssignments((prev) => [...prev, { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 }])
    }

    const handleRemoveAssignment = (rowId: string) => {
        setAssignments((prev) => prev.filter((r) => r.rowId !== rowId))
    }

    const handleAssignmentChange = (
        rowId: string,
        patch: Partial<Pick<TeacherAssignment, 'teacherId' | 'tdHours' | 'tpHours'>>,
    ) => {
        setAssignments((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)))
    }

    const handleToggleKind = (rowId: string, kind: TeachKind) => {
        setAssignments((prev) =>
            prev.map((r) => {
                if (r.rowId !== rowId) return r
                if (kind === 'TD') return { ...r, tdHours: r.tdHours > 0 ? 0 : 1 }
                return { ...r, tpHours: r.tpHours > 0 ? 0 : 1 }
            }),
        )
    }

    const handleSave = () => {
        const payload = {
            ...matiere,
            nom: name.trim() || matiere.nom,
            volume_horaire: Math.max(0, Number(volumeTotal) || 0),
            heures_td: Math.max(0, Number(tdHours) || 0),
            heures_tp: Math.max(0, Number(tpHours) || 0),
            assignments: assignments
                .filter((a) => a.teacherId)
                .map((a) => ({
                    teacherId: a.teacherId,
                    tdHours: Math.max(0, Number(a.tdHours) || 0),
                    tpHours: Math.max(0, Number(a.tpHours) || 0),
                })),
        }

        console.log('[MATIERES] Save matiere (mock)', payload)
    }

    const {
        handleRequestClose,
        isConfirmOpen,
        handleConfirmSaveAndClose,
        handleDiscardAndClose,
        handleConfirmDialogRequestClose,
    } = useDetailDirtyClose({
        hasChanges,
        onClose,
        onSaveAndClose: () => {
            handleSave()
            onClose()
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    return (
        <div className="matiere-detail-overlay" role="dialog" aria-modal="true">
            <DetailCardBody className="matiere-detail-card">
                <DetailCardHeader
                    onClose={handleRequestClose}
                    closeAriaLabel="Fermer la fiche matière"
                    closeButtonClassName="matiere-detail-close"
                    headerClassName="matiere-detail-header-badge"
                >
                    <MatiereBadge
                        semestre={matiere.semestre}
                        variant="header"
                        title="Détail matière"
                        subtitle={`${matiere.id_promo} · ${matiere.nom}`}
                        className="matiere-detail-header-badge"
                    />
                </DetailCardHeader>

                {/* Layout 2 colonnes générique */}
                <div className="detail-layout">
                    {/* Colonne gauche : infos matière */}
                    <div className="detail-main-column">
                        <section className="room-detail-section">
                            <h3 className="room-detail-section-title">Informations</h3>
                            <p className="room-detail-hint-small">
                                Ajuste les volumes puis répartis les heures par enseignant.
                            </p>

                            <div className="room-detail-identity-grid">
                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-name">
                                        Nom de la matière
                                    </label>
                                    <input
                                        id="matiere-name"
                                        className="room-detail-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex. Algorithmique"
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-volume-total">
                                        Volume total (h)
                                    </label>
                                    <input
                                        id="matiere-volume-total"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={volumeTotal}
                                        onChange={(e) => setVolumeTotal(Number(e.target.value))}
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-td">
                                        Volume TD (h)
                                    </label>
                                    <input
                                        id="matiere-td"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={tdHours}
                                        onChange={(e) => setTdHours(Number(e.target.value))}
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-tp">
                                        Volume TP (h)
                                    </label>
                                    <input
                                        id="matiere-tp"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={tpHours}
                                        onChange={(e) => setTpHours(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Colonne droite : affectations enseignants */}
                    <aside className="detail-aside-column">
                        <section className="room-detail-section">
                            <div className="matiere-detail-aside-header">
                                <div>
                                    <h3 className="room-detail-section-title">Enseignants</h3>
                                    <p className="room-detail-hint-xsmall">
                                        TD assigné : <strong>{assignedTD}h</strong> · TP assigné :{' '}
                                        <strong>{assignedTP}h</strong>
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-tertiary matiere-assign-add"
                                    onClick={handleAddAssignment}
                                >
                                    + Ajouter
                                </button>
                            </div>

                            <div className="matiere-assign-list">
                                {assignments.length === 0 && (
                                    <div className="matieres-empty-state">
                                        Aucun enseignant sélectionné.
                                    </div>
                                )}

                                {assignments.map((row) => {
                                    const tdChecked = row.tdHours > 0
                                    const tpChecked = row.tpHours > 0

                                    return (
                                        <div key={row.rowId} className="matiere-assign-row">
                                            <div className="matiere-assign-top">
                                                <select
                                                    className="room-detail-input matiere-assign-select"
                                                    value={row.teacherId}
                                                    onChange={(e) =>
                                                        handleAssignmentChange(row.rowId, {
                                                            teacherId: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">— Choisir un enseignant —</option>
                                                    {teachers.map((t) => (
                                                        <option key={t.id} value={t.id}>
                                                            {teacherLabel(t)}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    type="button"
                                                    className="btn-danger matiere-assign-remove"
                                                    onClick={() => handleRemoveAssignment(row.rowId)}
                                                    aria-label="Supprimer cet enseignant"
                                                >
                                                    −
                                                </button>
                                            </div>

                                            <div className="matiere-assign-hours">
                                                <button
                                                    type="button"
                                                    className={
                                                        tdChecked ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'
                                                    }
                                                    onClick={() => handleToggleKind(row.rowId, 'TD')}
                                                    aria-pressed={tdChecked}
                                                >
                                                    TD
                                                </button>
                                                <input
                                                    className="room-detail-input matiere-hours-input"
                                                    type="number"
                                                    min={0}
                                                    value={row.tdHours}
                                                    disabled={!tdChecked}
                                                    onChange={(e) =>
                                                        handleAssignmentChange(row.rowId, {
                                                            tdHours: Number(e.target.value),
                                                        })
                                                    }
                                                    aria-label="Heures TD"
                                                />

                                                <button
                                                    type="button"
                                                    className={
                                                        tpChecked ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'
                                                    }
                                                    onClick={() => handleToggleKind(row.rowId, 'TP')}
                                                    aria-pressed={tpChecked}
                                                >
                                                    TP
                                                </button>
                                                <input
                                                    className="room-detail-input matiere-hours-input"
                                                    type="number"
                                                    min={0}
                                                    value={row.tpHours}
                                                    disabled={!tpChecked}
                                                    onChange={(e) =>
                                                        handleAssignmentChange(row.rowId, {
                                                            tpHours: Number(e.target.value),
                                                        })
                                                    }
                                                    aria-label="Heures TP"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </aside>
                </div>

                <DetailCardFooter
                    saveLabel="Enregistrer"
                    cancelLabel="Annuler"
                    confirmTitle="Enregistrer la matière"
                    confirmMessage="Souhaites-tu enregistrer les modifications apportées à cette matière ?"
                    confirmLabel="Enregistrer"
                    hasChanges={hasChanges}
                    cancelDirtyTitle="Modifications non enregistrées"
                    cancelDirtyMessage={
                        <>
                            Tu as des modifications non enregistrées sur cette matière.
                            <br />
                            Souhaites-tu les enregistrer avant de fermer ?
                        </>
                    }
                    cancelDirtyConfirmLabel="Enregistrer et fermer"
                    cancelDirtyDiscardLabel="Fermer sans enregistrer"
                    onSave={handleSave}
                    onCancel={onClose}
                    onAfterSaveConfirm={onClose}
                />
            </DetailCardBody>

            <ConfirmDialog
                open={isConfirmOpen}
                title="Modifications non enregistrées"
                message={
                    <>
                        <p>Tu as des modifications non enregistrées sur cette matière.</p>
                        <p>Souhaites-tu les enregistrer avant de fermer&nbsp;?</p>
                    </>
                }
                confirmLabel="Enregistrer et fermer"
                cancelLabel="Fermer sans enregistrer"
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />
        </div>
    )
}