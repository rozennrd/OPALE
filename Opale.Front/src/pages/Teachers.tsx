import React, { useMemo, useState } from 'react'
import TeachersToolbar, { ModeFilter } from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import TeacherDetailCard from '../components/teachers/TeacherDetailCard'
import SelectionToolbar from '../components/common/SelectionToolbar'

import {
    INTERNAL_TEACHERS_MOCK,
    VACATAIRE_TEACHERS_MOCK,
} from '../mocks/teachers.mock'
import { MATIERES_MOCK } from '../mocks/matieres.mock'

import { Teacher } from '../models/Teacher'
import PageHeader from '../components/common/PageHeader'

const INITIAL_TEACHERS: Teacher[] = [
    ...INTERNAL_TEACHERS_MOCK,
    ...VACATAIRE_TEACHERS_MOCK,
]

export default function Teachers() {
    const [teachers, setTeachers] = useState<Teacher[]>(() => [...INITIAL_TEACHERS])
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL')
    const [subjectFilter, setSubjectFilter] = useState('')

    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([])

    const selectedTeacherIdsSet = useMemo(
        () => new Set(selectedTeacherIds),
        [selectedTeacherIds],
    )

    const internalBordeaux = useMemo(
        () =>
            teachers.filter(
                (teacher) =>
                    teacher.category === 'INTERNE' &&
                    teacher.campus?.toLowerCase().includes('bordeaux'),
            ),
        [teachers],
    )

    const internalLilleChateauroux = useMemo(
        () =>
            teachers.filter(
                (teacher) =>
                    teacher.category === 'INTERNE' &&
                    !teacher.campus?.toLowerCase().includes('bordeaux'),
            ),
        [teachers],
    )

    const vacataires = useMemo(
        () => teachers.filter((teacher) => teacher.category === 'VACATAIRE'),
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
            category: 'INTERNE',
            mode: 'PRESENTIEL',
            subjects: [],
            availability: '0000000000',
        })
    }

    const subjectOptions = useMemo(() => {
        const names = MATIERES_MOCK.map((matiere) => matiere.nom.trim())
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
    }, [])

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
        setSelectedTeacherIds((prev) => prev.filter((id) => !idsSet.has(id)))
        setSelectedTeacher((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })
    }

    const handleDeleteSingleTeacher = (teacherId: string) => {
        removeTeachersByIds([teacherId])
    }

    const handleToggleSelectionMode = () => {
        setSelectionMode((prev) => {
            const next = !prev

            if (next) {
                setSelectedTeacher(null)
                setSelectedTeacherIds([])
            } else {
                setSelectedTeacherIds([])
            }

            return next
        })
    }

    const handleToggleTeacherSelection = (teacherId: string) => {
        if (!selectionMode) return

        setSelectedTeacherIds((prev) => {
            if (prev.includes(teacherId)) {
                return prev.filter((id) => id !== teacherId)
            }
            return [...prev, teacherId]
        })
    }

    const handleSelectAllVisible = () => {
        setSelectedTeacherIds(visibleTeacherIds)
    }

    const handleClearSelection = () => {
        setSelectedTeacherIds([])
    }

    const handleDeleteSelected = () => {
        removeTeachersByIds(selectedTeacherIds)
        setSelectionMode(false)
        setSelectedTeacherIds([])
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
                    selectedCount={selectedTeacherIds.length}
                    onToggleSelectionMode={handleToggleSelectionMode}
                />

                {selectionMode && (
                    <SelectionToolbar
                        totalCount={visibleTeacherIds.length}
                        selectedCount={selectedTeacherIds.length}
                        onSelectAll={handleSelectAllVisible}
                        onClearSelection={handleClearSelection}
                        onDeleteSelected={handleDeleteSelected}
                        confirmTitle="Supprimer les enseignants selectionnes"
                        confirmMessage={`Vous allez supprimer ${selectedTeacherIds.length} enseignant${selectedTeacherIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                    />
                )}

                {filteredInternalBordeaux.length > 0 && (
                    <TeacherSection
                        title="Interne Bordeaux"
                        teachers={filteredInternalBordeaux}
                        onSelectTeacher={setSelectedTeacher}
                        selectionMode={selectionMode}
                        selectedTeacherIds={selectedTeacherIdsSet}
                        onToggleTeacherSelection={handleToggleTeacherSelection}
                    />
                )}

                {filteredInternalLilleChateauroux.length > 0 && (
                    <TeacherSection
                        title="Interne Lille/Chateauroux"
                        teachers={filteredInternalLilleChateauroux}
                        onSelectTeacher={setSelectedTeacher}
                        selectionMode={selectionMode}
                        selectedTeacherIds={selectedTeacherIdsSet}
                        onToggleTeacherSelection={handleToggleTeacherSelection}
                    />
                )}

                {filteredVacataires.length > 0 && (
                    <TeacherSection
                        title="Vacataires"
                        teachers={filteredVacataires}
                        onSelectTeacher={setSelectedTeacher}
                        selectionMode={selectionMode}
                        selectedTeacherIds={selectedTeacherIdsSet}
                        onToggleTeacherSelection={handleToggleTeacherSelection}
                    />
                )}
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
