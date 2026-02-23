// src/hooks/teachers/useTeacherDetail.ts
import { useEffect, useState } from 'react'
import { Teacher, TeacherAvailabilityPeriod } from '../../models/Teachers'
import { addProf, updateProf } from '../../services/api/professorsApi'
import {
    addEnseignement,
    getEnseignements,
} from '../../services/api/enseignementsApi'
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

            setSnapshot({
                teacher: savedTeacher,
                periods,
            })
            setHasChanges(false)
            onTeacherSaved?.(savedTeacher)

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
