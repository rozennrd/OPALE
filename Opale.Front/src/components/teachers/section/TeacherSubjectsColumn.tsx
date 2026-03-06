// src/components/teachers/section/TeacherSubjectsColumn.tsx
import { useEffect, useMemo, useState } from 'react'
import { Teacher } from '../../../models/Teachers'
import { getMatieres } from '../../../services/api/matieresApi'
import { BackendEnseignement, getEnseignements } from '../../../services/api/enseignementsApi'
import { promotionsApi } from '../../../services/api/promotionsApi'

type SubjectField = 'name' | 'promo'

type MatiereOption = {
    id: string
    nom: string
    promoId?: string
}

type PromotionOption = {
    id: string
    nom: string
}

interface TeacherSubjectsColumnProps {
    teacherId: string
    subjects: Teacher['subjects']
    onSubjectChange: (index: number, field: SubjectField, value: string) => void
    onAddSubject: () => void
    onRemoveSubject: (index: number) => void
}

const TeacherSubjectsColumn = ({
    teacherId,
    subjects,
    onSubjectChange,
    onAddSubject,
    onRemoveSubject,
}: TeacherSubjectsColumnProps) => {
    const [matieres, setMatieres] = useState<MatiereOption[]>([])
    const [promotions, setPromotions] = useState<PromotionOption[]>([])
    const [enseignements, setEnseignements] = useState<BackendEnseignement[]>([])

    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                const [backendMatieres, promotionsRes, enseignementsRes] = await Promise.all([
                    getMatieres(),
                    promotionsApi.getPromotions(),
                    getEnseignements(),
                ])

                const backendEnseignements = enseignementsRes.data ?? []

                if (!mounted) return

                setMatieres(
                    (backendMatieres ?? []).map((m) => ({
                        id: String(m.id),
                        nom: (m.nom ?? '').trim(),
                        promoId: m.id_promo ?? undefined,
                    })),
                )

                setPromotions(
                    (promotionsRes.data ?? []).map((p) => ({
                        id: String(p.id),
                        nom: (p.nom ?? '').trim(),
                    })),
                )
                setEnseignements(backendEnseignements)
            } catch (error) {
                console.error('[TEACHERS][SUBJECTS] load options failed:', error)
                if (!mounted) return
                setMatieres([])
                setPromotions([])
                setEnseignements([])
            }
        })()

        return () => {
            mounted = false
        }
    }, [])

    const promoLabelById = useMemo(() => {
        const map = new Map<string, string>()
        for (const p of promotions) {
            map.set(p.id, p.nom)
        }
        return map
    }, [promotions])

    const promoIdByLabel = useMemo(() => {
        const map = new Map<string, string>()
        for (const p of promotions) {
            map.set(p.nom.toLowerCase(), p.id)
        }
        return map
    }, [promotions])

    const promoIdsByMatiereName = useMemo(() => {
        const map = new Map<string, Set<string>>()
        for (const matiere of matieres) {
            const key = matiere.nom.toLowerCase()
            const existing = map.get(key) ?? new Set<string>()
            if (matiere.promoId) existing.add(matiere.promoId)
            map.set(key, existing)
        }
        return map
    }, [matieres])

    const matiereNamesByPromoId = useMemo(() => {
        const map = new Map<string, Set<string>>()
        for (const matiere of matieres) {
            if (!matiere.promoId) continue
            const existing = map.get(matiere.promoId) ?? new Set<string>()
            existing.add(matiere.nom)
            map.set(matiere.promoId, existing)
        }
        return map
    }, [matieres])

    const totalHoursByMatiereId = useMemo(() => {
        const map = new Map<string, number>()
        for (const enseignement of enseignements) {
            if (enseignement.id_prof !== teacherId) continue
            const total =
                (enseignement.heures_td ?? 0) +
                (enseignement.heures_tp ?? 0) +
                (enseignement.heures_projet ?? 0) +
                (enseignement.heures_elearning ?? 0) +
                (enseignement.heures_autre ?? 0)
            map.set(
                enseignement.id_matiere,
                (map.get(enseignement.id_matiere) ?? 0) + total,
            )
        }
        return map
    }, [enseignements, teacherId])

    const allMatiereNames = useMemo(
        () => Array.from(new Set(matieres.map((m) => m.nom).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr')),
        [matieres],
    )

    const allPromoLabels = useMemo(
        () => Array.from(new Set(promotions.map((p) => p.nom).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr')),
        [promotions],
    )

    const getPromoIdFromSubject = (subject: Teacher['subjects'][number]): string | undefined => {
        const fromLabel = promoIdByLabel.get((subject.promo ?? '').trim().toLowerCase())
        if (fromLabel) return fromLabel

        const linkedPromoIds = promoIdsByMatiereName.get((subject.name ?? '').trim().toLowerCase())
        if (linkedPromoIds && linkedPromoIds.size === 1) {
            return Array.from(linkedPromoIds)[0]
        }

        return undefined
    }

    const getTotalHoursForSubject = (subject: Teacher['subjects'][number]): number => {
        const subjectName = (subject.name ?? '').trim().toLowerCase()
        if (!subjectName) return 0

        const promoId = getPromoIdFromSubject(subject)
        const matchingMatieres = matieres.filter((matiere) => {
            if (matiere.nom.trim().toLowerCase() !== subjectName) return false
            if (!promoId) return true
            return matiere.promoId === promoId
        })

        if (matchingMatieres.length === 0) return 0

        return matchingMatieres.reduce(
            (total, matiere) => total + (totalHoursByMatiereId.get(matiere.id) ?? 0),
            0,
        )
    }

    const formatHours = (totalHours: number) => {
        if (totalHours <= 0) return 'NA'
        const display = Number.isInteger(totalHours) ? totalHours.toString() : totalHours.toFixed(1)
        return `${display} h`
    }

    const handleMatiereChange = (index: number, selectedName: string) => {
        onSubjectChange(index, 'name', selectedName)

        const selected = subjects[index]
        if (!selected) return

        const possiblePromoIds = promoIdsByMatiereName.get(selectedName.trim().toLowerCase())
        if (!possiblePromoIds || possiblePromoIds.size === 0) {
            return
        }

        const currentPromoId = promoIdByLabel.get((selected.promo ?? '').trim().toLowerCase())
        if (currentPromoId && possiblePromoIds.has(currentPromoId)) {
            return
        }

        if (possiblePromoIds.size === 1) {
            const onlyPromoId = Array.from(possiblePromoIds)[0]
            const onlyPromoLabel = promoLabelById.get(onlyPromoId)
            if (onlyPromoLabel) {
                onSubjectChange(index, 'promo', onlyPromoLabel)
            }
            return
        }

        onSubjectChange(index, 'promo', '')
    }

    const handlePromoChange = (index: number, selectedPromoLabel: string) => {
        onSubjectChange(index, 'promo', selectedPromoLabel)

        const selected = subjects[index]
        if (!selected) return

        const promoId = promoIdByLabel.get(selectedPromoLabel.trim().toLowerCase())
        if (!promoId) return

        const allowedMatieres = matiereNamesByPromoId.get(promoId)
        if (!allowedMatieres || allowedMatieres.size === 0) return

        if (allowedMatieres.has(selected.name)) return

        if (allowedMatieres.size === 1) {
            onSubjectChange(index, 'name', Array.from(allowedMatieres)[0])
            return
        }

        onSubjectChange(index, 'name', '')
    }

    return (
        <div className="teacher-detail-col">
            <h4>Matières enseignées</h4>

            {subjects && subjects.length > 0 ? (
                <ul className="teacher-subjects-edit-list">
                    {subjects.map((subject, index) => (
                        <li key={`${index}-${subject.name}-${subject.promo}`} className="teacher-subject-row">
                            {(() => {
                                const promoId = getPromoIdFromSubject(subject)
                                const linkedPromoIds = promoIdsByMatiereName.get((subject.name ?? '').trim().toLowerCase())
                                const promoOptions =
                                    linkedPromoIds && linkedPromoIds.size > 0
                                        ? Array.from(linkedPromoIds)
                                              .map((id) => promoLabelById.get(id))
                                              .filter((label): label is string => Boolean(label))
                                              .sort((a, b) => a.localeCompare(b, 'fr'))
                                        : allPromoLabels

                                const matiereOptions = promoId
                                    ? Array.from(matiereNamesByPromoId.get(promoId) ?? [])
                                          .sort((a, b) => a.localeCompare(b, 'fr'))
                                    : allMatiereNames

                                const hoursLabel = formatHours(getTotalHoursForSubject(subject))

                                return (
                                    <>
                                        <select
                                            className="teacher-subject-input teacher-subject-input-promo"
                                            value={subject.promo}
                                            onChange={(e) =>
                                                handlePromoChange(index, e.target.value)
                                            }
                                        >
                                            <option value="">Sélectionner une promo</option>
                                            {promoOptions.map((promoLabel) => (
                                                <option key={promoLabel} value={promoLabel}>
                                                    {promoLabel}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            className="teacher-subject-input teacher-subject-input-name"
                                            value={subject.name}
                                            onChange={(e) =>
                                                handleMatiereChange(index, e.target.value)
                                            }
                                        >
                                            <option value="">Sélectionner une matière</option>
                                            {matiereOptions.map((matiereName) => (
                                                <option key={matiereName} value={matiereName}>
                                                    {matiereName}
                                                </option>
                                            ))}
                                        </select>

                                        <span className="teacher-subject-hours">
                                            {hoursLabel}
                                        </span>
                                    </>
                                )
                            })()}

                            <button
                                type="button"
                                className="teacher-subject-remove"
                                onClick={() => onRemoveSubject(index)}
                                aria-label="Supprimer cette matière"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="teacher-detail-muted">
                    Aucune matière associée pour l'instant.
                </p>
            )}

            <button
                type="button"
                className="teacher-subject-add-btn"
                onClick={onAddSubject}
            >
                + Ajouter une matière
            </button>
        </div>
    )
}

export default TeacherSubjectsColumn

