import { useEffect, useMemo, useState } from 'react'
import TeachersToolbar, { ModeFilter } from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import TeacherDetailCard from '../components/teachers/TeacherDetailCard'
import SelectionToolbar from '../components/common/SelectionToolbar'

import { getProfsData } from '../services/api/professorsApi'

import { Teacher } from '../models/Teachers'
import PageHeader from '../components/common/PageHeader'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'

const DEFAULT_TEACHERS_FILTERS: {
    searchValue: string
    modeFilter: ModeFilter
    subjectFilter: string
} = {
    searchValue: '',
    modeFilter: 'ALL',
    subjectFilter: '',
}

export default function Teachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL')
    const [subjectFilter, setSubjectFilter] = useState('')

    useEffect(() => {
        let mounted = true

        const normalizeCategory = (
            value?: string,
        ): 'Permanent' | 'Intervenant' | 'Invite' => {
            const raw = (value ?? '').trim().toLowerCase()
            if (raw === 'intervenant' || raw === 'vacataire') return 'Intervenant'
            if (raw === 'invité' || raw === 'invite') return 'Invite'
            if (raw === 'permanent' || raw === 'interne') return 'Permanent'
            return 'Permanent'
        }

        ;(async () => {
            try {
                const apiTeachers = await getProfsData()

                console.log(apiTeachers)

                if (!mounted) return

                const mappedTeachers: Teacher[] = (apiTeachers ?? []).map((teacher) => ({
                    id: String(teacher.id),
                    firstName: teacher.prenom ?? '',
                    lastName: teacher.nom ?? '',
                    phone: teacher.phone ?? '',
                    email: teacher.email_perso ?? '',
                    emailJunia: teacher.email ?? '',
                    campus: teacher.campus_origin ?? 'Bordeaux',
                    category: normalizeCategory(teacher.type),
                    mode: teacher.mode ?? 'PRESENTIEL',
                    subjects: teacher.subjects ?? [],
                    availability: teacher.availability ?? '0000000000',
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

    const vacataires = useMemo(
        () => teachers.filter((teacher) => teacher.category === 'Intervenant'),
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
            mode: 'PRESENTIEL',
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

        return list.filter((teacher) => {
            const fullName = `${teacher.lastName} ${teacher.firstName} ${teacher.firstName} ${teacher.lastName}`.toLowerCase()
            const matchesSearch = !needle || fullName.includes(needle)
            const matchesMode = modeFilter === 'ALL' || teacher.mode === modeFilter
            const matchesSubject =
                !subjectNeedle ||
                (teacher.subjects || []).some((subject) =>
                    subject.name.toLowerCase().includes(subjectNeedle),
                )

            return matchesSearch && matchesMode && matchesSubject
        })
    }

    const filteredInternalBordeaux = filteredTeachers(internalBordeaux)
    const filteredInternalLilleChateauroux = filteredTeachers(internalLilleChateauroux)
    const filteredVacataires = filteredTeachers(vacataires)

    const {
        hasActiveFilters,
        resetFilters: handleResetFilters,
    } = useToolbarFilters({
        values: { searchValue, modeFilter, subjectFilter },
        defaults: DEFAULT_TEACHERS_FILTERS,
        onReset: () => {
            setSearchValue(DEFAULT_TEACHERS_FILTERS.searchValue)
            setModeFilter(DEFAULT_TEACHERS_FILTERS.modeFilter)
            setSubjectFilter(DEFAULT_TEACHERS_FILTERS.subjectFilter)
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

    const removeTeachersByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        setTeachers((prev) => prev.filter((teacher) => !idsSet.has(teacher.id)))
        pruneTeacherSelection(Array.from(idsSet))
        setSelectedTeacher((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })
    }

    const handleDeleteSingleTeacher = (teacherId: string) => {
        removeTeachersByIds([teacherId])
    }

    const handleDeleteSelected = () => {
        removeTeachersByIds(selectedTeacherIds)
        disableTeacherSelectionMode()
    }

    return (
        <>
            <PageHeader
                title="Enseignants"
                subtitle="Gestion des enseignants (internes & vacataires)"
            />

            <div className="teachers-page">
                <TeachersToolbar
                    onCreateRequested={handleCreateRequested}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    modeFilter={modeFilter}
                    onModeChange={setModeFilter}
                    subjectFilter={subjectFilter}
                    onSubjectChange={setSubjectFilter}
                    subjectOptions={subjectOptions}
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
                            confirmMessage={`Vous allez supprimer ${selectedTeacherIds.length} enseignant${selectedTeacherIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                    />
                )}

                <div className="teachers-sections">
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
                </div>
            </div>

            {selectedTeacher && (
                <TeacherDetailCard
                    teacher={selectedTeacher}
                    onClose={() => setSelectedTeacher(null)}
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
