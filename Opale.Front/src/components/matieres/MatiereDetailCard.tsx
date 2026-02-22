// src/components/matieres/MatiereDetailCard.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react'
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

type TeachKind = 'TD' | 'TP' | 'PROJET' | 'E-LEARNING' | 'AUTRES'

interface TeacherAssignment {
    rowId: string
    enseignementId?: string
    teacherId: string
    tdHours: number
    tpHours: number
    projectHours: number
    elearningHours: number
    autresHours: number
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
    const [projectHours, setProjectHours] = useState(matiere.heures_projet ?? 0)
    const [eLearningHours, setELearningHours] = useState(matiere.heures_elearning ?? 0)
    const [autresHours, setAutresHours] = useState(matiere.heures_autre ?? 0)
    const [volumeIncreaseMessage, setVolumeIncreaseMessage] = useState<string | null>(null)
    const [assignments, setAssignments] = useState<TeacherAssignment[]>(() => [
        { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 },
    ])

    // --- right column (enseignements)
    const [loadingEns, setLoadingEns] = useState(false)
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
    const [initialAssignments, setInitialAssignments] = useState<TeacherAssignment[]>([])
    const [removedEnseignementIds, setRemovedEnseignementIds] = useState<string[]>([])

    const [volumeWarningMessage, setVolumeWarningMessage] = useState<string | null>(null)

    type CategoryKey = 'tdHours' | 'tpHours' | 'projectHours' | 'eLearningHours' | 'autresHours'

    const sumCategoriesExcept = (except: CategoryKey) => {
        const td = clamp0(tdHours)
        const tp = clamp0(tpHours)
        const pj = clamp0(projectHours)
        const el = clamp0(eLearningHours)
        const au = clamp0(autresHours)

        switch (except) {
            case 'tdHours':
                return tp + pj + el + au
            case 'tpHours':
                return td + pj + el + au
            case 'projectHours':
                return td + tp + el + au
            case 'eLearningHours':
                return td + tp + pj + au
            case 'autresHours':
                return td + tp + pj + el
            default:
                return td + tp + pj + el + au
        }
    }

    const showTotalBlockWarning = () => {
        setVolumeWarningMessage(
            "Impossible de dépasser le volume horaire total. Modifiez-le manuellement avant."
        )
        const t = window.setTimeout(() => setVolumeWarningMessage(null), 3500)
        return () => window.clearTimeout(t)
    }

    const setCategoryHours = (key: CategoryKey, rawValue: number) => {
        const nextValue = clamp0(rawValue)
        const total = clamp0(volumeTotal)

        const otherSum = sumCategoriesExcept(key)
        const remaining = Math.max(0, total - otherSum)

        // Si on tente de dépasser le reste dispo => clamp + warning
        if (nextValue > remaining) {
            // set le max autorisé
            const clamped = remaining

            if (key === 'tdHours') setTdHours(clamped)
            if (key === 'tpHours') setTpHours(clamped)
            if (key === 'projectHours') setProjectHours(clamped)
            if (key === 'eLearningHours') setELearningHours(clamped)
            if (key === 'autresHours') setAutresHours(clamped)

            showTotalBlockWarning()
            return
        }

        // Sinon: ok
        if (key === 'tdHours') setTdHours(nextValue)
        if (key === 'tpHours') setTpHours(nextValue)
        if (key === 'projectHours') setProjectHours(nextValue)
        if (key === 'eLearningHours') setELearningHours(nextValue)
        if (key === 'autresHours') setAutresHours(nextValue)
    }

    // Reset local fields when matiere changes
    useEffect(() => {
        setName(matiere.nom)
        setVolumeTotal(matiere.volume_horaire)
        setTdHours(matiere.heures_td)
        setTpHours(matiere.heures_tp ?? 0)
        setProjectHours(matiere.heures_projet ?? 0)
        setELearningHours(matiere.heures_elearning ?? 0)
        setAutresHours(matiere.heures_autre ?? 0)
    }, [matiere.id])

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
                            projectHours: clamp0(e.heures_projet ?? 0),
                            elearningHours: clamp0(e.heures_elearning ?? 0),
                            autresHours: clamp0(e.heures_autre ?? 0),
                        }))
                        : [{ rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 , projectHours: 0, elearningHours: 0, autresHours: 0 }]

                if (!mounted) return
                setAssignments(rows)
                setInitialAssignments(rows.map((r) => ({ ...r })))
            } catch (err) {
                console.error('[MATIERE_DETAIL] load enseignements failed:', err)
                if (!mounted) return
                setAssignments([{ rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0, projectHours: 0, elearningHours: 0, autresHours: 0 }])
                setInitialAssignments([])
            } finally {
                if (mounted) setLoadingEns(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [matiere.id])

    // Cours assignés par type (TD/TP/Projet/E-learning/Autres)
    const assignedTD = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tdHours) ? r.tdHours : 0), 0),
        [assignments],
    )
    const assignedTP = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.tpHours) ? r.tpHours : 0), 0),
        [assignments],
    )

    const assignedProject = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.projectHours) ? r.projectHours : 0), 0),
        [assignments],
    )

    const assignedELearning = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.elearningHours) ? r.elearningHours : 0), 0),
        [assignments],
    )

    const assignedAutres = useMemo(
        () => assignments.reduce((acc, r) => acc + (Number.isFinite(r.autresHours) ? r.autresHours : 0), 0),
        [assignments],
    )

    const handleAddAssignment = () => {
        setAssignments((prev) => [...prev, { rowId: makeRowId(), teacherId: '', tdHours: 0, tpHours: 0 , projectHours:0, elearningHours:0, autresHours:0}])
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

    type HoursKey =
        | 'tdHours'
        | 'tpHours'
        | 'projectHours'
        | 'elearningHours'
        | 'autresHours'

    const hoursCaps = (): Record<HoursKey, number> => ({
        tdHours: clamp0(tdHours),
        tpHours: clamp0(tpHours),
        projectHours: clamp0(projectHours),
        elearningHours: clamp0(eLearningHours),
        autresHours: clamp0(autresHours),
    })

    useEffect(() => {
        const caps = hoursCaps()

        setAssignments((prev) =>
            prev.map((r) => ({
                ...r,
                tdHours: caps.tdHours === 0 ? 0 : r.tdHours,
                tpHours: caps.tpHours === 0 ? 0 : r.tpHours,
                projectHours: caps.projectHours === 0 ? 0 : r.projectHours,
                elearningHours: caps.elearningHours === 0 ? 0 : r.elearningHours,
                autresHours: caps.autresHours === 0 ? 0 : r.autresHours,
            })),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tdHours, tpHours, projectHours, eLearningHours, autresHours])

    const clampRowAgainstTypeCap = (
        next: TeacherAssignment[],
        rowId: string,
        caps: Record<HoursKey, number>,
        key: HoursKey,
    ): TeacherAssignment[] => {
        const row = next.find((r) => r.rowId === rowId)
        if (!row) return next

        const otherSum = next.reduce(
            (acc, r) => acc + (r.rowId === rowId ? 0 : clamp0(r[key])),
            0
        )

        const remaining = Math.max(0, caps[key] - otherSum)
        row[key] = Math.min(clamp0(row[key]), remaining)

        return next
    }


    const isHoursKey = (k: string): k is HoursKey =>
        ['tdHours', 'tpHours', 'projectHours', 'elearningHours', 'autresHours'].includes(k)

    const handleAssignmentChange = (
        rowId: string,
        patch: Partial<Pick<TeacherAssignment, 'teacherId' | HoursKey>>,
    ) => {
        setAssignments((prev) => {
            const next = prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r))

            const changedHourKeys = Object.keys(patch).filter(isHoursKey) as HoursKey[]
            if (changedHourKeys.length === 0) return next

            const caps = hoursCaps()

            let out = next
            for (const k of changedHourKeys) {
                out = clampRowAgainstTypeCap(out, rowId, caps, k)
            }
            return out
        })
    }


    const handleToggleKind = (rowId: string, kind: TeachKind) => {
        const mapKindToKey: Record<TeachKind, HoursKey> = {
            TD: 'tdHours',
            TP: 'tpHours',
            PROJET: 'projectHours',
            'E-LEARNING': 'elearningHours',
            AUTRES: 'autresHours',
        }

        const key = mapKindToKey[kind]

        setAssignments((prev) => {
            const next = prev.map((r) => {
                if (r.rowId !== rowId) return r
                const current = clamp0(r[key])
                return { ...r, [key]: current > 0 ? 0 : 1 } as TeacherAssignment
            })

            const caps = hoursCaps()
            return clampRowAgainstTypeCap(next, rowId, caps, key)
        })
    }


    const assignmentsChanged = useMemo(() => {
        const norm = (a: TeacherAssignment) => ({
            enseignementId: a.enseignementId ?? '',
            teacherId: String(a.teacherId ?? ''),
            td: clamp0(a.tdHours),
            tp: clamp0(a.tpHours),
            project: clamp0(a.projectHours),
            elearning: clamp0(a.elearningHours),
            autres: clamp0(a.autresHours),
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
        projectHours !== (matiere.heures_projet ?? 0) ||
        eLearningHours !== (matiere.heures_elearning ?? 0) ||
        autresHours !== (matiere.heures_autre ?? 0) ||
        assignmentsChanged

    const handleSave = async () => {
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
            heures_projet: clamp0(projectHours),
            heures_elearning: clamp0(eLearningHours),
            heures_autre: clamp0(autresHours),
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
                projectHours: clamp0(r.projectHours),
                elearningHours: clamp0(r.elearningHours),
                autresHours: clamp0(r.autresHours),
            }))
            // on ignore les lignes vides
            .filter((r) => r.teacherId.length > 0 && (r.tdHours > 0 || r.tpHours > 0 || r.projectHours > 0 || r.elearningHours > 0 || r.autresHours > 0))

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
                    heures_projet: r.projectHours,
                    heures_elearning: r.elearningHours,
                    heures_autre: r.autresHours,
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
                    heures_projet: r.projectHours,
                    heures_elearning: r.elearningHours,
                    heures_autre: r.autresHours,
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

    // garde la dernière valeur de volumeTotal
    const volumeTotalRef = useRef(clamp0(volumeTotal))
    useEffect(() => {
        volumeTotalRef.current = clamp0(volumeTotal)
    }, [volumeTotal])

    useEffect(() => {
        const sum =
            clamp0(tdHours) +
            clamp0(tpHours) +
            clamp0(projectHours) +
            clamp0(eLearningHours) +
            clamp0(autresHours)

        const total = clamp0(volumeTotal)

        if (sum > total) {
            const diff = sum - total

            setVolumeTotal(sum) // on aligne le total sur la somme réelle

            setVolumeIncreaseMessage(
                `Votre dernier changement augmente le volume horaire de ${diff} heure${diff > 1 ? 's' : ''}.`
            )

            const t = window.setTimeout(() => {
                setVolumeIncreaseMessage(null)
            }, 3000)

            return () => clearTimeout(t)
        }
    }, [tdHours, tpHours, projectHours, eLearningHours, autresHours])

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
                                        onChange={(e) => setCategoryHours('tdHours', Number(e.target.value))}
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
                                        onChange={(e) => setCategoryHours('tpHours', Number(e.target.value))}
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-projet">
                                        Volume Projet (h)
                                    </label>
                                    <input
                                        id="matiere-projet"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={projectHours}
                                        onChange={(e) => setCategoryHours('projectHours', Number(e.target.value))}
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-projet">
                                        Volume E-Learning (h)
                                    </label>
                                    <input
                                        id="matiere-elearning"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={eLearningHours}
                                        onChange={(e) => setCategoryHours('eLearningHours', Number(e.target.value))}
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="matiere-projet">
                                        Volume Autres (h)
                                    </label>
                                    <input
                                        id="matiere-autres"
                                        className="room-detail-input"
                                        type="number"
                                        min={0}
                                        value={autresHours}
                                        onChange={(e) => setCategoryHours('autresHours', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            {volumeWarningMessage && (
                                <div className="volume-warning" role="status" aria-live="polite">
                                    <span aria-hidden="true">⚠</span>
                                    <span>{volumeWarningMessage}</span>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Colonne droite : affectations enseignants */}
                    <aside className="detail-aside-column">
                        <section className="room-detail-section">
                            <div className="matiere-detail-aside-header">
                                <div>
                                    <h3 className="room-detail-section-title">Enseignants</h3>
                                    <p className="room-detail-hint-xsmall">
                                        TD assigné : <strong>{assignedTD}h</strong> · TP assigné : <strong>{assignedTP}h</strong> · Projet assigné : <strong>{assignedProject}h</strong> · E-learning assigné : <strong>{assignedELearning}h</strong> · Autres assigné : <strong>{assignedAutres}h</strong>
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

                                                {/* PROJET */}
                                                <button
                                                    type="button"
                                                    className={row.projectHours > 0 ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'}
                                                    onClick={() => handleToggleKind(row.rowId, 'PROJET')}
                                                    aria-pressed={row.projectHours > 0}
                                                >
                                                    PROJET
                                                </button>
                                                <input
                                                    className="room-detail-input matiere-hours-input"
                                                    type="number"
                                                    min={0}
                                                    value={row.projectHours}
                                                    disabled={row.projectHours <= 0}
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { projectHours: Number(e.target.value) })}
                                                    aria-label="Heures projet"
                                                />

                                                {/* E-LEARNING */}
                                                <button
                                                    type="button"
                                                    className={row.elearningHours > 0 ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'}
                                                    onClick={() => handleToggleKind(row.rowId, 'E-LEARNING')}
                                                    aria-pressed={row.elearningHours > 0}
                                                >
                                                    E-LEARNING
                                                </button>
                                                <input
                                                    className="room-detail-input matiere-hours-input"
                                                    type="number"
                                                    min={0}
                                                    value={row.elearningHours}
                                                    disabled={row.elearningHours <= 0}
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { elearningHours: Number(e.target.value) })}
                                                    aria-label="Heures e-learning"
                                                />

                                                {/* AUTRES */}
                                                <button
                                                    type="button"
                                                    className={row.autresHours > 0 ? 'matiere-kind-chip is-active' : 'matiere-kind-chip'}
                                                    onClick={() => handleToggleKind(row.rowId, 'AUTRES')}
                                                    aria-pressed={row.autresHours > 0}
                                                >
                                                    AUTRES
                                                </button>
                                                <input
                                                    className="room-detail-input matiere-hours-input"
                                                    type="number"
                                                    min={0}
                                                    value={row.autresHours}
                                                    disabled={row.autresHours <= 0}
                                                    onChange={(e) => handleAssignmentChange(row.rowId, { autresHours: Number(e.target.value) })}
                                                    aria-label="Heures autres"
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