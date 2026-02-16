// src/components/matieres/MatiereDetailCard.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Matiere } from '../../models/Matiere'
import DetailCardBody from '../common/DetailCardBody'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardFooter from '../common/DetailCardFooter'
import ConfirmDialog from '../common/ConfirmDialog'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'
import MatiereBadge from './MatiereBadge'
import { updateMatiere } from '../../services/api/matieresApi'
import {
    addEnseignement,
    deleteEnseignement,
    getEnseignements,
    updateEnseignement,
} from '../../services/api/enseignementsApi'

type TeacherOption = { id: string; label: string }

interface MatiereDetailCardProps {
    matiere: Matiere
    onClose: () => void
    onAfterSave?: () => Promise<void> | void

    onDelete?: () => void
    teacherOptions: TeacherOption[]
}

type TeachKind = 'TD' | 'TP'

interface TeacherAssignment {
    rowId: string
    enseignementId?: string
    teacherId: string
    tdHours: number
    tpHours: number
}

const makeRowId = () => `assign-${Math.random().toString(16).slice(2)}`
const clamp0 = (v: number) => Math.max(0, Number(v) || 0)

export default function MatiereDetailCard({
                                              matiere,
                                              onClose,
                                              onAfterSave,
                                              teacherOptions,
                                          }: MatiereDetailCardProps) {
    // --- left column (matière)

    const [name, setName] = useState(matiere.nom)
    const [volumeTotal, setVolumeTotal] = useState(matiere.volume_horaire)
    const [tdHours, setTdHours] = useState(matiere.heures_td)
    const [tpHours, setTpHours] = useState(matiere.heures_tp ?? 0)
    const [assignments, setAssignments] = useState<TeacherAssignment[]>(() => [
        { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 },
    ])

    // --- right column (enseignements)
    const [loadingEns, setLoadingEns] = useState(false)
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
    const [initialAssignments, setInitialAssignments] = useState<TeacherAssignment[]>([])
    const [removedEnseignementIds, setRemovedEnseignementIds] = useState<string[]>([])

    // Reset local fields when matiere changes
    useEffect(() => {
        setName(matiere.nom)
        setVolumeTotal(matiere.volume_horaire)
        setTdHours(matiere.heures_td)
        setTpHours(matiere.heures_tp ?? 0)
    }, [matiere])

    // Load enseignements for this matiere
    useEffect(() => {
        let mounted = true

        ;(async () => {
            setLoadingEns(true)
            setRemovedEnseignementIds([])

            try {
                console.log('[MATIERE_DETAIL] loading enseignements for matiere:', matiere.id)

                const res = await getEnseignements()
                console.log('[MATIERE_DETAIL] getEnseignements response ->', res)

                if (!res.success) throw new Error(res.error?.message ?? 'getEnseignements failed')

                const all = res.data ?? []

                // ⚠️ Si ton backend n'utilise pas "id_matiere", change ici.
                const mine = all.filter((e) => String(e.id_matiere) === String(matiere.id))

                console.log('[MATIERE_DETAIL] enseignements filtered ->', mine)

                const rows: TeacherAssignment[] =
                    mine.length > 0
                        ? mine.map((e) => ({
                            rowId: makeRowId(),
                            enseignementId: String(e.id),
                            teacherId: String(e.id_prof ?? ''),
                            tdHours: clamp0(e.heures_td),
                            tpHours: clamp0(e.heures_tp),
                        }))
                        : [{ rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 }]

                if (!mounted) return
                setAssignments(rows)
                setInitialAssignments(rows.map((r) => ({ ...r })))
            } catch (err) {
                console.error('[MATIERE_DETAIL] load enseignements failed:', err)
                if (!mounted) return
                setAssignments([{ rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 }])
                setInitialAssignments([])
            } finally {
                if (mounted) setLoadingEns(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [matiere.id])

    const assignedTD = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tdHours) ? r.tdHours : 0), 0),
        [assignments],
    )
    const assignedTP = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tpHours) ? r.tpHours : 0), 0),
        [assignments],
    )

    const handleAddAssignment = () => {
        setAssignments((prev) => [...prev, { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 }])
    }

    const handleRemoveAssignment = (rowId: string) => {
        setAssignments((prev) => {
            const row = prev.find((r) => r.rowId === rowId)
            if (row?.enseignementId) {
                setRemovedEnseignementIds((ids) => Array.from(new Set([...ids, row.enseignementId!])))
            }
            return prev.filter((r) => r.rowId !== rowId)
        })
    }

    const handleAssignmentChange = (
        rowId: string,
        patch: Partial<Pick<TeacherAssignment, 'teacherId' | 'tdHours' | 'tpHours'>>,
    ) => {
        setAssignments((prev) => {
            const next = prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r))

            const row = next.find((r) => r.rowId === rowId)
            if (!row) return next

            const maxTD = Math.max(0, Number(tdHours) || 0)
            const maxTP = Math.max(0, Number(tpHours) || 0)

            // totaux sans la ligne courante (pour calculer le “reste” dispo)
            const tdOther = next.reduce((acc, r) => acc + (r.rowId === rowId ? 0 : (Number(r.tdHours) || 0)), 0)
            const tpOther = next.reduce((acc, r) => acc + (r.rowId === rowId ? 0 : (Number(r.tpHours) || 0)), 0)

            const tdRemaining = Math.max(0, maxTD - tdOther)
            const tpRemaining = Math.max(0, maxTP - tpOther)

            // clamp la ligne courante
            row.tdHours = Math.max(0, Math.min(Number(row.tdHours) || 0, tdRemaining))
            row.tpHours = Math.max(0, Math.min(Number(row.tpHours) || 0, tpRemaining))

            return next
        })
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

    const assignmentsChanged = useMemo(() => {
        const norm = (a: TeacherAssignment) => ({
            enseignementId: a.enseignementId ?? '',
            teacherId: String(a.teacherId ?? ''),
            td: clamp0(a.tdHours),
            tp: clamp0(a.tpHours),
        })
        return (
            JSON.stringify(assignments.map(norm)) !== JSON.stringify(initialAssignments.map(norm)) ||
            removedEnseignementIds.length > 0
        )
    }, [assignments, initialAssignments, removedEnseignementIds])

    const hasChanges =
        name !== matiere.nom ||
        volumeTotal !== matiere.volume_horaire ||
        tdHours !== matiere.heures_td ||
        tpHours !== (matiere.heures_tp ?? 0) ||
        assignmentsChanged

    const handleSave = async () => {
        // UUID promo obligatoire pour update côté back
        const promoUuid = (matiere).promo_id as string | undefined
        if (!promoUuid) {
            console.error('[MATIERES][update] Missing matiere.promo_id (UUID). matiere=', matiere)
            alert("Impossible d'enregistrer : promo_id (UUID) manquant sur la matière.")
            return
        }

        // 1) Update matière
        const matierePayload = {
            id: matiere.id,
            nom: name.trim() || matiere.nom,
            volume_horaire: clamp0(volumeTotal),
            id_promo: promoUuid,
            id_specialite: (matiere).id_specialite ?? null,
            semestre: Number(matiere.semestre) || 0,
            nb_partiels: Number((matiere).nb_partiels) || 0,
            nb_eval_intermediaire: (matiere).nb_eval_intermediaire ?? null,
            heures_td: clamp0(tdHours),
            heures_tp: clamp0(tpHours),
        }

        console.log('[MATIERE_DETAIL][save] updateMatiere payload ->', matierePayload)
        const matRes = await updateMatiere(matierePayload)
        console.log('[MATIERE_DETAIL][save] updateMatiere response ->', matRes)

        if (!matRes.success) {
            alert(matRes.error?.message ?? 'Erreur lors de la sauvegarde matière')
            return
        }

        // 2) Enseignements: delete + upsert
        const rows = assignments
            .map((r) => ({
                ...r,
                teacherId: String(r.teacherId ?? ''),
                tdHours: clamp0(r.tdHours),
                tpHours: clamp0(r.tpHours),
            }))
            // on ignore les lignes vides
            .filter((r) => r.teacherId.length > 0 && (r.tdHours > 0 || r.tpHours > 0))

        console.log('[MATIERE_DETAIL][save] rows upsert ->', rows)
        console.log('[MATIERE_DETAIL][save] rows removed ->', removedEnseignementIds)

        // deletes
        for (const id of removedEnseignementIds) {
            const delRes = await deleteEnseignement(id)
            console.log('[MATIERE_DETAIL][save] deleteEnseignement', id, '->', delRes)
            if (!delRes.success) {
                alert(delRes.error?.message ?? `Erreur suppression enseignement ${id}`)
                return
            }
        }

        // upserts
        for (const r of rows) {
            if (r.enseignementId) {
                const upRes = await updateEnseignement({
                    id: r.enseignementId,
                    id_matiere: matiere.id,
                    id_prof: r.teacherId,
                    heures_td: r.tdHours,
                    heures_tp: r.tpHours,
                })
                console.log('[MATIERE_DETAIL][save] updateEnseignement ->', upRes)
                if (!upRes.success) {
                    alert(upRes.error?.message ?? 'Erreur update enseignement')
                    return
                }
            } else {
                const addRes = await addEnseignement({
                    id_matiere: matiere.id,
                    id_prof: r.teacherId,
                    heures_td: r.tdHours,
                    heures_tp: r.tpHours,
                })
                console.log('[MATIERE_DETAIL][save] addEnseignement ->', addRes)
                if (!addRes.success) {
                    alert(addRes.error?.message ?? 'Erreur add enseignement')
                    return
                }
            }
        }

        // 3) Refresh parent list + close
        try {
            await onAfterSave?.()
        } catch (e) {
            console.error('[MATIERE_DETAIL][save] onAfterSave failed:', e)
        }

        onClose()
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
        onSaveAndClose: async () => {
            await handleSave()
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

                <div className="detail-layout">
                    {/* Colonne gauche : infos matière */}
                    <div className="detail-main-column">
                        <section className="room-detail-section">
                            <h3 className="room-detail-section-title">Informations</h3>
                            <p className="room-detail-hint-small">Ajuste les volumes puis répartis les heures par enseignant.</p>

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
                                        TD assigné : <strong>{assignedTD}h</strong> · TP assigné : <strong>{assignedTP}h</strong>
                                        {loadingEns ? ' · Chargement…' : ''}
                                    </p>
                                </div>

                                <button type="button" className="btn-tertiary matiere-assign-add" onClick={handleAddAssignment}>
                                    + Ajouter
                                </button>
                            </div>

                            <div className="matiere-assign-list">
                                {assignments.length === 0 && <div className="matieres-empty-state">Aucun enseignant sélectionné.</div>}

                                {assignments.map((row) => {
                                    const tdChecked = row.tdHours > 0
                                    const tpChecked = row.tpHours > 0

                                    return (
                                        <div key={row.rowId} className="matiere-assign-row">
                                            <div className="matiere-assign-top">
                                                <select
                                                    className="room-detail-input matiere-assign-select"
                                                    value={row.teacherId}
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { teacherId: e.target.value })}
                                                >
                                                    <option value="">— Choisir un enseignant —</option>
                                                    {teacherOptions.map((t) => (
                                                        <option key={t.id} value={String(t.id)}>
                                                            {t.label}
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
                                                    className={tdChecked ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'}
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
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { tdHours: Number(e.target.value) })}
                                                    aria-label="Heures TD"
                                                />

                                                <button
                                                    type="button"
                                                    className={tpChecked ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'}
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
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { tpHours: Number(e.target.value) })}
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
                    onDelete={onDelete}
                    deleteLabel="Supprimer"
                    deleteTitle="Supprimer cette matière"
                    deleteMessage="Souhaites-tu supprimer cette matière ?"
                    deleteConfirmLabel="Supprimer"
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
