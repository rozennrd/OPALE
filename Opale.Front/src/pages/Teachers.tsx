import React, { useState } from 'react'
import TeachersToolbar from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import TeacherDetailCard from '../components/teachers/TeacherDetailCard'

import {
    INTERNAL_TEACHERS_MOCK,
    VACATAIRE_TEACHERS_MOCK,
} from '../mocks/teachers.mock'

import { Teacher } from '../models/Teacher'

export default function Teachers() {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

    return (
        <>
            <h2 className="page-title">Enseignants</h2>
            <p className="page-sub">Gestion des enseignants (internes & vacataires)</p>

            <div className="teachers-page">
                <TeachersToolbar />

                <TeacherSection
                    title="Internes"
                    teachers={INTERNAL_TEACHERS_MOCK}
                    onSelectTeacher={setSelectedTeacher}
                />

                <TeacherSection
                    title="Vacataires"
                    teachers={VACATAIRE_TEACHERS_MOCK}
                    onSelectTeacher={setSelectedTeacher}
                />
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