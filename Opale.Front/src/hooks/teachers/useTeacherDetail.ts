// src/hooks/teachers/useTeacherDetail.ts
import { useEffect, useState } from 'react'
import { Teacher, TeacherAvailabilityPeriod } from '../../models/Teachers'
import { addProf, updateProf } from '../../services/api/professorsApi'
import {
    addEnseignement,
    getEnseignements,
} from '../../services/api/enseignementsApi'
import {
    addDisponibilite,
    deleteDisponibilite,
    getDisponibilites,
    updateDisponibilite,
} from '../../services/api/disponibilitesApi'
import { getMatieres } from '../../services/api/matieresApi'
import { promotionsApi } from '../../services/api/promotionsApi'

const normalizeAvailability = (value?: string): string => {
    if (!value || value.length !== 10) return '0000000000'
    return value
}

const buildInitialPeriods = (teacher: Teacher): TeacherAvailabilityPeriod[] => {
    if (teacher.availabilityPeriods && teacher.availabilityPeriods.length > 0) {
        return teacher.availabilityPeriods.map((p, index) => ({
            id: p.id || `period-${index + 1}`,
            label: p.label || `Période de disponibilité ${index + 1}`,
            availability: normalizeAvailability(p.availability),
            start: p.start || '',
            end: p.end || '',
        }))
    }

    return [
        {
            id: 'period-1',
            label: 'Période de disponibilité 1',
            availability: normalizeAvailability(teacher.availability),
            start: '',
            end: '',
        },
    ]
}

const cloneTeacher = (t: Teacher): Teacher => ({
    ...t,
    subjects: t.subjects ? t.subjects.map((s) => ({ ...s })) : [],
})

type TeacherSnapshot = {
    teacher: Teacher
    periods: TeacherAvailabilityPeriod[]
}

interface UseTeacherDetailOptions {
    onTeacherSaved?: (teacher: Teacher) => void
}

const normalizeType = (
    value?: Teacher['category'],
): 'Permanent' | 'Intervenant' | 'Invite' => {
    if (value === 'Intervenant' || value === 'Invite' || value === 'Permanent') {
        return value
    }
    return 'Permanent'
}

const normalizeMode = (
    value: Teacher['mode'],
): 'Distanciel' | 'Hybride' | 'Présentiel' => {
    if (value === 'Distanciel' || value === 'Hybride' || value === 'Présentiel') {
        return value
    }

    const raw = String(value).toLowerCase()
    if (raw === 'distanciel') return 'Distanciel'
    if (raw === 'hybride') return 'Hybride'
    return 'Présentiel'
}

const normalizeCampus = (
    value?: string,
): 'Bordeaux' | 'Lille' | 'Chateauroux' | undefined => {
    if (!value) return undefined
    const raw = value.trim().toLowerCase()
    if (raw.includes('lille')) return 'Lille'
    if (raw.includes('chateauroux') || raw.includes('châteauroux')) return 'Chateauroux'
    return 'Bordeaux'
}

const normalizeSubjectKey = (name: string, promo: string): string => {
    return `${name.trim().toLowerCase()}::${promo.trim().toLowerCase()}`
}

const normalizeDispoMicro = (value?: string): string => {
    if (!value || value.length !== 10) return '0000000000'
    return value
}

const toUtcDate = (isoDate: string): Date => {
    const [year, month, day] = isoDate.split('-').map((part) => Number(part))
    return new Date(Date.UTC(year, (month || 1) - 1, day || 1))
}

const getIsoWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf())
    const dayNumber = (target.getUTCDay() + 6) % 7
    target.setUTCDate(target.getUTCDate() - dayNumber + 3)

    const firstThursday = target.valueOf()
    target.setUTCMonth(0, 1)

    if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7)
    }

    return 1 + Math.round(((firstThursday - target.valueOf()) / 86400000 - 3) / 7)
}

const getWeeksInRange = (start: string, end: string): number[] => {
    if (!start || !end) return []

    const startDate = toUtcDate(start)
    const endDate = toUtcDate(end)
    if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
        return []
    }

    if (startDate > endDate) return []

    const cursor = new Date(startDate.valueOf())
    const weeks = new Set<number>()
    while (cursor <= endDate) {
        weeks.add(getIsoWeekNumber(cursor))
        cursor.setUTCDate(cursor.getUTCDate() + 1)
    }

    return Array.from(weeks).sort((a, b) => a - b)
}

const mapDisponibilitesToPeriods = (
    items: Array<{ id: string; num_semaine: number; dispo_micro: string | null }>,
): TeacherAvailabilityPeriod[] => {
    return [...items]
        .sort((a, b) => Number(a.num_semaine) - Number(b.num_semaine))
        .map((item, index) => ({
            id: `dispo-${String(item.id)}`,
            label: `Semaine ${Number(item.num_semaine)}`,
            availability: normalizeDispoMicro(item.dispo_micro ?? undefined),
            start: '',
            end: '',
        }))
        .map((period, index) => ({
            ...period,
            label: period.label || `Période de disponibilité ${index + 1}`,
        }))
}

export const useTeacherDetail = (
    teacher: Teacher,
    options: UseTeacherDetailOptions = {},
) => {
    const { onTeacherSaved } = options
    const [teacherDraft, setTeacherDraft] = useState<Teacher>(() => cloneTeacher(teacher))
    const [periods, setPeriods] = useState<TeacherAvailabilityPeriod[]>(() =>
        buildInitialPeriods(teacher),
    )
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(() =>
        buildInitialPeriods(teacher)[0]?.id ?? null,
    )

    // ✅ snapshot "dernière sauvegarde"
    const [snapshot, setSnapshot] = useState<TeacherSnapshot | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Reset complet quand on change d’enseignant
    useEffect(() => {
        const initialPeriods = buildInitialPeriods(teacher)
        const cloned = cloneTeacher(teacher)

        setTeacherDraft(cloned)
        setPeriods(initialPeriods)
        setSelectedPeriodId(initialPeriods[0]?.id ?? null)

        setSnapshot({
            teacher: cloned,
            periods: initialPeriods,
        })
        setHasChanges(false)
    }, [teacher])

    // ✅ Détection des changements par rapport au snapshot
    useEffect(() => {
        if (!snapshot) return

        const current = JSON.stringify({
            teacher: teacherDraft,
            periods,
        })
        const base = JSON.stringify(snapshot)

        setHasChanges(current !== base)
    }, [teacherDraft, periods, snapshot])

    /* ------------ Edition colonnes 1 & 2 ------------ */

    const handleInfoChange = (field: keyof Teacher, value: string) => {
        setTeacherDraft((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubjectChange = (
        index: number,
        field: 'name' | 'promo',
        value: string,
    ) => {
        setTeacherDraft((prev) => {
            const subjects = prev.subjects ? [...prev.subjects] : []
            const current = subjects[index] || { name: '', promo: '' }
            subjects[index] = { ...current, [field]: value }
            return { ...prev, subjects }
        })
    }

    const handleAddSubject = () => {
        setTeacherDraft((prev) => ({
            ...prev,
            subjects: [...(prev.subjects || []), { name: '', promo: '' }],
        }))
    }

    const handleRemoveSubject = (index: number) => {
        setTeacherDraft((prev) => ({
            ...prev,
            subjects: (prev.subjects || []).filter((_, i) => i !== index),
        }))
    }

    /* ------------ Dispos / périodes ------------ */

    const handleToggleSlot = (slotIndex: number) => {
        setPeriods((prev) => {
            const selected = prev.find((p) => p.id === selectedPeriodId) ?? prev[0]
            if (!selected) return prev

            return prev.map((p) => {
                if (p.id !== selected.id) return p
                const chars = p.availability.split('')
                const current = chars[slotIndex] === '1' ? '1' : '0'
                chars[slotIndex] = current === '1' ? '0' : '1'
                return { ...p, availability: chars.join('') }
            })
        })
    }

    const handleSelectPeriod = (periodId: string) => {
        setSelectedPeriodId(periodId)
    }

    const handleAddPeriod = () => {
        setPeriods((prev) => {
            const nextIndex = prev.length + 1
            const newPeriod: TeacherAvailabilityPeriod = {
                id: `period-${nextIndex}`,
                label: `Période de disponibilité ${nextIndex}`,
                availability: '0000000000',
                start: '',
                end: '',
            }
            const updated = [...prev, newPeriod]
            setSelectedPeriodId(newPeriod.id)
            return updated
        })
    }

    const handleRemovePeriod = (id: string) => {
        setPeriods((prev) => {
            if (prev.length <= 1) return prev
            const filtered = prev.filter((p) => p.id !== id)
            if (filtered.length === 0) return prev
            if (id === selectedPeriodId) {
                setSelectedPeriodId(filtered[0].id)
            }
            return filtered
        })
    }

    const handlePeriodDateChange = (
        id: string,
        field: 'start' | 'end',
        value: string,
    ) => {
        setPeriods((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        [field]: value,
                    }
                    : p,
            ),
        )
    }

    const handleSave = async (): Promise<boolean> => {
        try {
            let savedTeacher = teacherDraft
            let savedTeacherId = teacherDraft.id

            if (teacherDraft.id === 'new-teacher') {
                const insertedId = await addProf({
                    nom: teacherDraft.lastName,
                    prenom: teacherDraft.firstName,
                    email: teacherDraft.emailJunia || undefined,
                    email_perso: teacherDraft.email || undefined,
                    telephone: teacherDraft.phone || undefined,
                    type: normalizeType(teacherDraft.category),
                    modalite_enseignement: normalizeMode(teacherDraft.mode),
                    campus_origin: normalizeCampus(teacherDraft.campus),
                })

                savedTeacher = {
                    ...teacherDraft,
                    id: String(insertedId),
                }
                savedTeacherId = String(insertedId)
                setTeacherDraft(savedTeacher)
            } else {
                await updateProf(teacherDraft.id, {
                    nom: teacherDraft.lastName,
                    prenom: teacherDraft.firstName,
                    email: teacherDraft.emailJunia || undefined,
                    email_perso: teacherDraft.email || undefined,
                    telephone: teacherDraft.phone || undefined,
                    type: normalizeType(teacherDraft.category),
                    modalite_enseignement: normalizeMode(teacherDraft.mode),
                    campus_origin: normalizeCampus(teacherDraft.campus),
                })
            }

            const normalizedSubjects = (savedTeacher.subjects ?? [])
                .map((s) => ({
                    name: (s.name ?? '').trim(),
                    promo: (s.promo ?? '').trim(),
                }))
                .filter((s) => s.name.length > 0 && s.promo.length > 0)

            if (normalizedSubjects.length > 0 && savedTeacherId !== 'new-teacher') {
                const [enseignementsRes, matieres, promotionsRes] = await Promise.all([
                    getEnseignements(),
                    getMatieres(),
                    promotionsApi.getPromotions(),
                ])

                const promoIdByLabel = new Map<string, string>()
                for (const p of promotionsRes.data ?? []) {
                    promoIdByLabel.set((p.nom ?? '').trim().toLowerCase(), String(p.id))
                }

                const matiereIdBySubjectKey = new Map<string, string>()
                for (const m of matieres ?? []) {
                    const nom = (m.nom ?? '').trim()
                    const promoId = String(m.id_promo ?? '')
                    if (!nom || !promoId) continue

                    const promoLabel = Array.from(promoIdByLabel.entries()).find(
                        ([, id]) => id === promoId,
                    )?.[0]

                    if (!promoLabel) continue
                    matiereIdBySubjectKey.set(
                        normalizeSubjectKey(nom, promoLabel),
                        String(m.id),
                    )
                }

                const existingPairs = new Set<string>()
                for (const e of enseignementsRes.data ?? []) {
                    existingPairs.add(`${String(e.id_prof)}::${String(e.id_matiere)}`)
                }

                for (const subject of normalizedSubjects) {
                    const subjectPromoId = promoIdByLabel.get(subject.promo.toLowerCase())

                    let matiereId = matiereIdBySubjectKey.get(
                        normalizeSubjectKey(subject.name, subject.promo),
                    )

                    if (!matiereId && subjectPromoId) {
                        const found = (matieres ?? []).find(
                            (m) =>
                                (m.nom ?? '').trim().toLowerCase() ===
                                    subject.name.toLowerCase() &&
                                String(m.id_promo ?? '') === subjectPromoId,
                        )
                        if (found) {
                            matiereId = String(found.id)
                        }
                    }

                    if (!matiereId) continue

                    const pairKey = `${savedTeacherId}::${matiereId}`
                    if (existingPairs.has(pairKey)) continue

                    const addRes = await addEnseignement({
                        id_matiere: matiereId,
                        id_prof: savedTeacherId,
                        heures_td: 0,
                        heures_tp: 0,
                        heures_projet: 0,
                        heures_elearning: 0,
                        heures_autre: 0,
                    })

                    if (!addRes.success) {
                        throw new Error(
                            addRes.error?.message ?? 'Failed to create enseignement',
                        )
                    }

                    existingPairs.add(pairKey)
                }
            }

            if (savedTeacherId !== 'new-teacher') {
                const desiredWeekToMicro = new Map<number, string>()

                for (const period of periods) {
                    if (!period.start || !period.end) continue

                    const weeks = getWeeksInRange(period.start, period.end)
                    const micro = normalizeDispoMicro(period.availability)
                    for (const week of weeks) {
                        desiredWeekToMicro.set(week, micro)
                    }
                }

                if (desiredWeekToMicro.size > 0) {
                    const disponibilityRes = await getDisponibilites()
                    if (!disponibilityRes.success) {
                        throw new Error(
                            disponibilityRes.error?.message ??
                                'Failed to fetch disponibilites',
                        )
                    }

                    const existingTeacherDispos = (disponibilityRes.data ?? []).filter(
                        (item) => String(item.id_prof) === String(savedTeacherId),
                    )

                    const existingByWeek = new Map<number, { id: string; micro: string }>()
                    for (const existing of existingTeacherDispos) {
                        existingByWeek.set(Number(existing.num_semaine), {
                            id: String(existing.id),
                            micro: normalizeDispoMicro(existing.dispo_micro ?? undefined),
                        })
                    }

                    for (const [week, micro] of desiredWeekToMicro.entries()) {
                        const current = existingByWeek.get(week)

                        if (!current || !current.id) {
                            const addRes = await addDisponibilite({
                                id_prof: String(savedTeacherId),
                                num_semaine: week,
                                dispo_micro: micro,
                            })
                            if (!addRes.success) {
                                throw new Error(
                                    addRes.error?.message ??
                                        `Failed to create disponibilite for week ${week}`,
                                )
                            }
                            continue
                        }

                        if (current.micro !== micro) {
                            const updateRes = await updateDisponibilite({
                                id: current.id,
                                id_prof: String(savedTeacherId),
                                num_semaine: week,
                                dispo_micro: micro,
                            })
                            if (!updateRes.success) {
                                throw new Error(
                                    updateRes.error?.message ??
                                        `Failed to update disponibilite for week ${week}`,
                                )
                            }
                        }
                    }

                    // ⚠️ Important: on ne supprime plus automatiquement les semaines
                    // absentes du mapping local. Dans l'UI actuelle, les disponibilités
                    // récupérées depuis la BDD sont rematérialisées en périodes hebdo
                    // sans plage start/end, ce qui pouvait entraîner des suppressions
                    // involontaires lors d'un simple ajout.
                    //
                    // Le comportement attendu ici est donc:
                    // - add/update pour les semaines calculées depuis les périodes saisies
                    // - conservation des autres semaines déjà présentes en BDD
                }
            }

            let refreshedPeriods = periods.map((period) => ({ ...period }))
            if (savedTeacherId !== 'new-teacher') {
                const latestDisponibilitesRes = await getDisponibilites()
                if (latestDisponibilitesRes.success) {
                    const latestTeacherDispos = (latestDisponibilitesRes.data ?? []).filter(
                        (item) => String(item.id_prof) === String(savedTeacherId),
                    )
                    if (latestTeacherDispos.length > 0) {
                        refreshedPeriods = mapDisponibilitesToPeriods(latestTeacherDispos)
                        setPeriods(refreshedPeriods)
                        setSelectedPeriodId(refreshedPeriods[0]?.id ?? null)
                    }
                }
            }

            const savedTeacherWithPeriods: Teacher = {
                ...savedTeacher,
                availabilityPeriods: refreshedPeriods,
                availability:
                    refreshedPeriods.find((p) => p.id === selectedPeriodId)
                        ?.availability ??
                    refreshedPeriods[0]?.availability ??
                    savedTeacher.availability ??
                    '0000000000',
            }

            setSnapshot({
                teacher: savedTeacherWithPeriods,
                periods: refreshedPeriods,
            })
            setHasChanges(false)
            onTeacherSaved?.(savedTeacherWithPeriods)

            return true
        } catch (error) {
            console.error('[TEACHERS] save failed:', error)
            return false
        }
    }

    return {
        teacherDraft,
        periods,
        selectedPeriodId,
        handleInfoChange,
        handleSubjectChange,
        handleAddSubject,
        handleRemoveSubject,
        handleToggleSlot,
        handleSelectPeriod,
        handleAddPeriod,
        handleRemovePeriod,
        handlePeriodDateChange,
        handleSave,
        hasChanges, // 👈 utilisé par TeacherDetailCard
    }
}
