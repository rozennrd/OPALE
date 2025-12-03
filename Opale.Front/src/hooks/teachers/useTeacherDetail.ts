// src/hooks/teachers/useTeacherDetail.ts
import { useEffect, useMemo, useState } from 'react'
import { Teacher, TeacherAvailabilityPeriod } from '../../models/Teacher'

const normalizeAvailability = (value?: string): string => {
    if (!value || value.length !== 10) return '0000000000'
    return value
}

const buildInitialPeriods = (teacher: Teacher): TeacherAvailabilityPeriod[] => {
    if (teacher.availabilityPeriods && teacher.availabilityPeriods.length > 0) {
        return teacher.availabilityPeriods.map((p, index) => ({
            id: p.id || `period-${index + 1}`,
            label: p.label || `Période ${index + 1}`,
            availability: normalizeAvailability(p.availability),
            start: p.start || '',
            end: p.end || '',
        }))
    }

    return [
        {
            id: 'period-1',
            label: 'Période 1',
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

export const useTeacherDetail = (teacher: Teacher) => {
    const [teacherDraft, setTeacherDraft] = useState<Teacher>(() => cloneTeacher(teacher))
    const [periods, setPeriods] = useState<TeacherAvailabilityPeriod[]>(() =>
        buildInitialPeriods(teacher),
    )
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(
        () => buildInitialPeriods(teacher)[0]?.id ?? null,
    )

    // Reset complet si on ouvre la card pour un autre enseignant
    useEffect(() => {
        const initial = buildInitialPeriods(teacher)
        setTeacherDraft(cloneTeacher(teacher))
        setPeriods(initial)
        setSelectedPeriodId(initial[0]?.id ?? null)
    }, [teacher])

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
                label: `Période ${nextIndex}`,
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

    const handleSave = () => {
        console.log('[TEACHERS] Enregistrer les données enseignant + périodes')
        console.log('→ demander au back de mettre à jour la BDD')
        console.log({
            originalTeacher: teacher,
            updatedTeacher: teacherDraft,
            availabilityPeriods: periods,
        })
    }

    // ✅ Calcul du "dirty state"
    const hasChanges = useMemo(() => {
        const initialTeacher = cloneTeacher(teacher)
        const currentTeacher = teacherDraft

        const sameTeacher =
            JSON.stringify(initialTeacher) === JSON.stringify(currentTeacher)

        const initialPeriods = buildInitialPeriods(teacher)
        const samePeriods =
            JSON.stringify(initialPeriods) === JSON.stringify(periods)

        return !(sameTeacher && samePeriods)
    }, [teacher, teacherDraft, periods])

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
        hasChanges, // 👈 exposé au composant
    }
}