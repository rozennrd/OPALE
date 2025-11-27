// src/pages/Teachers.tsx
import React from 'react'
import TeachersToolbar from '../components/teachers/TeachersToolbar'
import TeacherSection from '../components/teachers/TeacherSection'
import {
    INTERNAL_TEACHERS_MOCK,
    VACATAIRE_TEACHERS_MOCK,
} from '../mocks/teachers.mock'

export default function Teachers() {
    return (
        <>
            <h2 className="page-title">Enseignants</h2>
            <TeachersToolbar />

            <TeacherSection title="Internes" teachers={INTERNAL_TEACHERS_MOCK} />
            <TeacherSection title="Vacataires" teachers={VACATAIRE_TEACHERS_MOCK} />
        </>
    )
}