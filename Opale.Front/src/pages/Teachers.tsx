import { useEffect, useMemo, useState } from 'react'
import TeachersToolbar, { ModeFilter } from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import TeacherDetailCard from '../components/teachers/TeacherDetailCard'
import SelectionToolbar from '../components/common/SelectionToolbar'

import { deleteProf, getProfsData } from '../services/api/professorsApi'
import { getEnseignements } from '../services/api/enseignementsApi'
import { getMatieres } from '../services/api/matieresApi'
import { promotionsApi } from '../services/api/promotionsApi'
import { getDisponibilites } from '../services/api/disponibilitesApi'

import { Teacher, TeacherAvailabilityPeriod } from '../models/Teachers'
import PageHeader from '../components/common/PageHeader'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'

const DEFAULT_TEACHERS_FILTERS: {
    searchValue: string
    modeFilter: ModeFilter
    promotionFilter: string
    subjectFilter: string
    dateFrom: string
    dateTo: string
} = {
    searchValue: '',
    modeFilter: 'ALL',
    promotionFilter: '',
    subjectFilter: '',
    dateFrom: '',
    dateTo: '',
}

const getIsoWeekDateRange = (
    weekNumber: number,
    year: number,
): { start: string; end: string } => {
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const jan4Day = jan4.getUTCDay() || 7
    const mondayWeek1 = new Date(jan4)
    mondayWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1))

    const monday = new Date(mondayWeek1)
    monday.setUTCDate(mondayWeek1.getUTCDate() + (weekNumber - 1) * 7)

    const friday = new Date(monday)
    friday.setUTCDate(monday.getUTCDate() + 4)

    const toIso = (d: Date) => d.toISOString().slice(0, 10)
    return {
        start: toIso(monday),
        end: toIso(friday),
    }
}

export default function Teachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL')
    const [promotionFilter, setPromotionFilter] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [promotionOptions, setPromotionOptions] = useState<string[]>([])

    useEffect(() => {
        let mounted = true

        const normalizeCategory = (
            value?: string,
        ): 'Permanent' | 'Intervenant' | 'Invite' => {
            const raw = (value ?? '').trim().toLowerCase()
            if (raw === 'intervenant') return 'Intervenant'
            if (raw === 'invité' || raw === 'invite') return 'Invite'
            if (raw === 'permanent' || raw === 'interne') return 'Permanent'
            return 'Permanent'
        }

        ;(async () => {
            try {
                const [apiTeachers, enseignementsRes, matieres, promotionsRes] = await Promise.all([
                    getProfsData(),
                    getEnseignements(),
                    getMatieres(),
                    promotionsApi.getPromotions(),
                ])

                const disponibilitesRes = await getDisponibilites()

                if (!mounted) return

                const promoLabelById = new Map<string, string>()
                for (const p of promotionsRes.data ?? []) {
                    promoLabelById.set(String(p.id), p.nom)
                }
                const promotionLabels = (promotionsRes.data ?? [])
                    .map((promo) => promo.nom ?? '')
                    .filter((label) => label.trim().length > 0)
                const uniquePromotionLabels = Array.from(
                    new Set(promotionLabels),
                ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }))
                setPromotionOptions(uniquePromotionLabels)

                const matiereById = new Map<string, { nom: string; promoLabel: string }>()
                for (const m of matieres ?? []) {
                    matiereById.set(String(m.id), {
                        nom: m.nom ?? '',
                        promoLabel: promoLabelById.get(String(m.id_promo ?? '')) ?? '',
                    })
                }

                const teacherSubjectsById = new Map<string, Teacher['subjects']>()
                for (const e of enseignementsRes.data ?? []) {
                    const profId = String(e.id_prof)
                    const matiereInfo = matiereById.get(String(e.id_matiere))
                    if (!matiereInfo) continue

                    const existing = teacherSubjectsById.get(profId) ?? []
                    const alreadyExists = existing.some(
                        (s) =>
                            s.name.toLowerCase() === matiereInfo.nom.toLowerCase() &&
                            s.promo.toLowerCase() === matiereInfo.promoLabel.toLowerCase(),
                    )
                    if (!alreadyExists) {
                        existing.push({ name: matiereInfo.nom, promo: matiereInfo.promoLabel })
                    }
                    teacherSubjectsById.set(profId, existing)
                }

                const teacherPeriodsById = new Map<string, TeacherAvailabilityPeriod[]>()
                const disponibilites = disponibilitesRes.success
                    ? disponibilitesRes.data ?? []
                    : []
                const currentYear = new Date().getUTCFullYear()

                for (const dispo of disponibilites) {
                    const profId = String(dispo.id_prof)
                    const week = Number(dispo.num_semaine)
                    const { start, end } = getIsoWeekDateRange(week, currentYear)
                    const micro =
                        typeof dispo.dispo_micro === 'string' && dispo.dispo_micro.length === 10
                            ? dispo.dispo_micro
                            : '0000000000'

                    const existing = teacherPeriodsById.get(profId) ?? []
                    existing.push({
                        id: `dispo-${String(dispo.id)}`,
                        label: `Semaine ${week}`,
                        availability: micro,
                        start,
                        end,
                    })
                    teacherPeriodsById.set(profId, existing)
                }

                for (const [profId, periods] of teacherPeriodsById.entries()) {
                    periods.sort((a, b) => {
                        const aWeek = Number(a.label.replace('Semaine ', ''))
                        const bWeek = Number(b.label.replace('Semaine ', ''))
                        return aWeek - bWeek
                    })
                    teacherPeriodsById.set(profId, periods)
                }

                const mappedTeachers: Teacher[] = (apiTeachers ?? []).map((teacher) => ({
                    id: String(teacher.id),
                    firstName: teacher.prenom ?? '',
                    lastName: teacher.nom ?? '',
                    phone: teacher.telephone ?? '',
                    email: teacher.email_perso ?? '',
                    emailJunia: teacher.email ?? '',
                    campus: teacher.campus_origin ?? 'Bordeaux',
                    category: normalizeCategory(teacher.type),
                    mode: teacher.modalite_enseignement ?? 'Présentiel',
                    subjects: teacherSubjectsById.get(String(teacher.id)) ?? teacher.subjects ?? [],
                    availability: teacher.availability ?? '0000000000',
                    availabilityPeriods: teacherPeriodsById.get(String(teacher.id)) ?? [],
                }))

                setTeachers(mappedTeachers)
            } catch (error) {
                console.error('[TEACHERS] load failed:', error)
                if (!mounted) return
                setTeachers([])
            }
        })()

        return () => {
            mounted = false
        }
    }, [])

    const {
        selectionMode,
        selectedIds: selectedTeacherIds,
        selectedIdsSet: selectedTeacherIdsSet,
        selectedCount: selectedTeacherCount,
        toggleSelectionMode: toggleTeacherSelectionMode,
        toggleSelection: toggleTeacherSelection,
        selectAll: selectAllTeachers,
        clearSelection: clearTeacherSelection,
        disableSelectionMode: disableTeacherSelectionMode,
        pruneSelection: pruneTeacherSelection,
    } = useSelectionState({
        onEnterSelectionMode: () => {
            setSelectedTeacher(null)
        },
    })

    const internalBordeaux = useMemo(
        () =>
            teachers.filter(
                (teacher) =>
                    teacher.category === 'Permanent' &&
                    teacher.campus?.toLowerCase().includes('bordeaux'),
            ),
        [teachers],
    )

    const internalLilleChateauroux = useMemo(
        () =>
            teachers.filter(
                (teacher) =>
                    teacher.category === 'Permanent' &&
                    !teacher.campus?.toLowerCase().includes('bordeaux'),
            ),
        [teachers],
    )

    const intervenants = useMemo(
        () => teachers.filter((teacher) => teacher.category === 'Intervenant'),
        [teachers],
    )

    const invites = useMemo(
        () => teachers.filter((teacher) => teacher.category === 'Invite'),
        [teachers],
    )

    const handleCreateRequested = () => {
        setSelectedTeacher({
            id: 'new-teacher',
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            emailJunia: '',
            campus: 'Bordeaux',
            category: 'Permanent',
            mode: 'Présentiel',
            subjects: [],
            availability: '0000000000',
        })
    }

    const subjectOptions = useMemo(() => {
        const names = teachers
            .flatMap((teacher) => teacher.subjects || [])
            .map((subject) => subject.name.trim())
            .filter(Boolean)
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
    }, [teachers])

    const filteredTeachers = (list: Teacher[]) => {
        const needle = searchValue.trim().toLowerCase()
        const subjectNeedle = subjectFilter.trim().toLowerCase()
        const promotionNeedle = promotionFilter.trim().toLowerCase()
        const hasDateFilter = Boolean(dateFrom || dateTo)
        const rangeStart = dateFrom || '0000-01-01'
        const rangeEnd = dateTo || '9999-12-31'

        return list.filter((teacher) => {
            const fullName = `${teacher.lastName} ${teacher.firstName} ${teacher.firstName} ${teacher.lastName}`.toLowerCase()
            const matchesSearch = !needle || fullName.includes(needle)
            const matchesMode = modeFilter === 'ALL' || teacher.mode === modeFilter
            const matchesSubject =
                !subjectNeedle ||
                (teacher.subjects || []).some((subject) =>
                    subject.name.toLowerCase().includes(subjectNeedle),
                )
            const matchesPromotion =
                !promotionNeedle ||
                (teacher.subjects || []).some(
                    (subject) => subject.promo?.toLowerCase() === promotionNeedle,
                )
            const matchesDate = !hasDateFilter
                ? true
                : (teacher.availabilityPeriods || []).some((period) => {
                      const periodStart = period.start || '0000-01-01'
                      const periodEnd = period.end || '9999-12-31'
                      return periodStart <= rangeEnd && periodEnd >= rangeStart
                  })

            return (
                matchesSearch &&
                matchesMode &&
                matchesSubject &&
                matchesPromotion &&
                matchesDate
            )
        })
    }

    const filteredInternalBordeaux = filteredTeachers(internalBordeaux)
    const filteredInternalLilleChateauroux = filteredTeachers(internalLilleChateauroux)
    const filteredVacataires = filteredTeachers(intervenants)
    const filteredInvited = filteredTeachers(invites)
    const hasFilteredTeachers =
        filteredInternalBordeaux.length +
            filteredInternalLilleChateauroux.length +
            filteredVacataires.length +
            filteredInvited.length >
        0

    const {
        hasActiveFilters,
        resetFilters: handleResetFilters,
    } = useToolbarFilters({
        values: {
            searchValue,
            modeFilter,
            promotionFilter,
            subjectFilter,
            dateFrom,
            dateTo,
        },
        defaults: DEFAULT_TEACHERS_FILTERS,
        onReset: () => {
            setSearchValue(DEFAULT_TEACHERS_FILTERS.searchValue)
            setModeFilter(DEFAULT_TEACHERS_FILTERS.modeFilter)
            setPromotionFilter(DEFAULT_TEACHERS_FILTERS.promotionFilter)
            setSubjectFilter(DEFAULT_TEACHERS_FILTERS.subjectFilter)
            setDateFrom(DEFAULT_TEACHERS_FILTERS.dateFrom)
            setDateTo(DEFAULT_TEACHERS_FILTERS.dateTo)
        },
    })

    const visibleTeacherIds = useMemo(
        () => [
            ...filteredInternalBordeaux,
            ...filteredInternalLilleChateauroux,
            ...filteredVacataires,
        ].map((teacher) => teacher.id),
        [
            filteredInternalBordeaux,
            filteredInternalLilleChateauroux,
            filteredVacataires,
        ],
    )

    const removeTeachersByIds = async (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        try {
            await Promise.all(Array.from(idsSet).map((id) => deleteProf(id)))
        } catch (error) {
            console.error('[TEACHERS] delete failed:', error)
            return
        }

        setTeachers((prev) => prev.filter((teacher) => !idsSet.has(teacher.id)))
        pruneTeacherSelection(Array.from(idsSet))
        setSelectedTeacher((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })
    }

    const handleDeleteSingleTeacher = (teacherId: string) => {
        void removeTeachersByIds([teacherId])
    }

    const handleDeleteSelected = () => {
        void removeTeachersByIds(selectedTeacherIds).then(() => {
            disableTeacherSelectionMode()
        })
    }

    const handleTeacherUpdated = (updatedTeacher: Teacher) => {
        setTeachers((prev) => {
            const existingIndex = prev.findIndex(
                (teacher) => teacher.id === updatedTeacher.id,
            )

            if (existingIndex >= 0) {
                return prev.map((teacher) =>
                    teacher.id === updatedTeacher.id ? { ...updatedTeacher } : teacher,
                )
            }

            return [...prev, { ...updatedTeacher }]
        })

        setSelectedTeacher((prev) => {
            if (!prev) return prev
            return { ...updatedTeacher }
        })
    }

    return (
        <>
            <PageHeader
                title="Enseignants"
                subtitle="Gestion des enseignants (permanents & intervenants)"
            />

            <div className="teachers-page">
                <TeachersToolbar
                    onCreateRequested={handleCreateRequested}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    modeFilter={modeFilter}
                    onModeChange={setModeFilter}
                    promotionFilter={promotionFilter}
                    onPromotionChange={setPromotionFilter}
                    promotionOptions={promotionOptions}
                    subjectFilter={subjectFilter}
                    onSubjectChange={setSubjectFilter}
                    subjectOptions={subjectOptions}
                    dateFrom={dateFrom}
                    onDateFromChange={setDateFrom}
                    dateTo={dateTo}
                    onDateToChange={setDateTo}
                    selectionMode={selectionMode}
                    selectedCount={selectedTeacherCount}
                    onToggleSelectionMode={toggleTeacherSelectionMode}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {selectionMode && (
                        <SelectionToolbar
                            totalCount={visibleTeacherIds.length}
                            selectedCount={selectedTeacherCount}
                            onSelectAll={() => selectAllTeachers(visibleTeacherIds)}
                            onClearSelection={clearTeacherSelection}
                            onDeleteSelected={handleDeleteSelected}
                            confirmTitle="Supprimer les enseignants sélectionnés"
                            confirmMessage={`Vous allez supprimer ${selectedTeacherIds.length} enseignant${selectedTeacherIds.length > 1 ? 's' : ''}. Cette action est définitive.`}
                    />
                )}

                <div className="teachers-sections">
                    {hasFilteredTeachers ? (
                        <>
                            {filteredInternalBordeaux.length > 0 && (
                                <TeacherSection
                                    title="Internes Bordeaux"
                                    teachers={filteredInternalBordeaux}
                                    onSelectTeacher={setSelectedTeacher}
                                    selectionMode={selectionMode}
                                    selectedTeacherIds={selectedTeacherIdsSet}
                                    onToggleTeacherSelection={toggleTeacherSelection}
                                />
                            )}
                            {filteredInternalLilleChateauroux.length > 0 && (
                                <TeacherSection
                                    title="Internes Lille/Châteauroux"
                                    teachers={filteredInternalLilleChateauroux}
                                    onSelectTeacher={setSelectedTeacher}
                                    selectionMode={selectionMode}
                                    selectedTeacherIds={selectedTeacherIdsSet}
                                    onToggleTeacherSelection={toggleTeacherSelection}
                                />
                            )}
                            {filteredVacataires.length > 0 && (
                                <TeacherSection
                                    title="Vacataires"
                                    teachers={filteredVacataires}
                                    onSelectTeacher={setSelectedTeacher}
                                    selectionMode={selectionMode}
                                    selectedTeacherIds={selectedTeacherIdsSet}
                                    onToggleTeacherSelection={toggleTeacherSelection}
                                />
                            )}
                            {filteredInvited.length > 0 && (
                                <TeacherSection
                                    title="Invités ponctuels"
                                    teachers={filteredInvited}
                                    onSelectTeacher={setSelectedTeacher}
                                    selectionMode={selectionMode}
                                    selectedTeacherIds={selectedTeacherIdsSet}
                                    onToggleTeacherSelection={toggleTeacherSelection}
                                />
                            )}
                        </>
                    ) : (
                        <div className="teacher-empty-state">
                            Aucun enseignant ne correspond aux filtres selectionnes.
                        </div>
                    )}
                </div>
            </div>

            {selectedTeacher && (
                <TeacherDetailCard
                    teacher={selectedTeacher}
                    onClose={() => setSelectedTeacher(null)}
                    onTeacherUpdated={handleTeacherUpdated}
                    onDelete={
                        selectedTeacher.id === 'new-teacher'
                            ? undefined
                            : () => handleDeleteSingleTeacher(selectedTeacher.id)
                    }
                />
            )}
        </>
    )
}
