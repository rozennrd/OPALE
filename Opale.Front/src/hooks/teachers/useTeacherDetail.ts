// src/hooks/teachers/useTeacherDetail.ts
import { useEffect, useState } from 'react'
import { Teacher, TeacherAvailabilityPeriod } from '../../models/Teachers'
import { addProf, updateProf } from '../../services/api/professorsApi'

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
