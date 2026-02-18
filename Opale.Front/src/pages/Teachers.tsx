import React, { useMemo, useState } from 'react'
import TeachersToolbar, { ModeFilter } from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import TeacherDetailCard from '../components/teachers/TeacherDetailCard'

import {
    INTERNAL_TEACHERS_MOCK,
    VACATAIRE_TEACHERS_MOCK,
} from '../mocks/teachers.mock'
import { MATIERES_MOCK } from '../mocks/matieres.mock'

import { Teacher } from '../models/Teacher'
import PageHeader from "../components/common/PageHeader";

export default function Teachers() {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL')
    const [subjectFilter, setSubjectFilter] = useState('')
    const internalBordeaux = INTERNAL_TEACHERS_MOCK.filter((teacher) =>
        teacher.campus?.toLowerCase().includes('bordeaux'),
    )
    const internalLilleChateauroux = INTERNAL_TEACHERS_MOCK.filter(
        (teacher) => !teacher.campus?.toLowerCase().includes('bordeaux'),
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
    const filteredVacataires = filteredTeachers(VACATAIRE_TEACHERS_MOCK)

    return (
        <>
            {/* TITRE & SOUS-TITRE */}
            <PageHeader
                title="Enseignants"
                subtitle="Gestion des enseignants (internes & vacataires)"
            />

            {/* CONTENU DE LA PAGE */}
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
                />

                {filteredInternalBordeaux.length > 0 && (
                    <TeacherSection
                        title="Interne Bordeaux"
                        teachers={filteredInternalBordeaux}
                        onSelectTeacher={setSelectedTeacher}
                    />
                )}

                {filteredInternalLilleChateauroux.length > 0 && (
                    <TeacherSection
                        title="Interne Lille/ChÃ¢teauroux"
                        teachers={filteredInternalLilleChateauroux}
                        onSelectTeacher={setSelectedTeacher}
                    />
                )}

                {filteredVacataires.length > 0 && (
                    <TeacherSection
                        title="Vacataires"
                        teachers={filteredVacataires}
                        onSelectTeacher={setSelectedTeacher}
                    />
                )}
            </div>

            {selectedTeacher && (
                <TeacherDetailCard
                    teacher={selectedTeacher}
                    onClose={() => setSelectedTeacher(null)}
                />
            )}
        </>
    )
}
