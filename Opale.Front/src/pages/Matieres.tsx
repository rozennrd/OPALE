// src/pages/Matieres.tsx

import React, { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import MatieresToolbar, {
    CycleFilter,
    PromotionFilter,
    SemestreFilter,
    TeacherFilter,
} from '../components/matieres/MatieresToolbar'
import MatiereSection from '../components/matieres/MatiereSection'
import MatiereDetailCard from '../components/matieres/MatiereDetailCard'
import { MATIERES_MOCK } from '../mocks/matieres.mock'
import { INTERNAL_TEACHERS_MOCK } from '../mocks/teachers.mock'
import { Matiere } from '../models/Matiere'

const getCycleFromPromoLabel = (promoLabel: string) => {
    // "ADI 1" -> "ADI" | "CIR 2" -> "CIR" | "AP 3" -> "AP"
    return (promoLabel || '').trim().split(/\s+/)[0] || '—'
}

export default function Matieres() {
    const [searchValue, setSearchValue] = useState('')
    const [semestreFilter, setSemestreFilter] = useState<SemestreFilter>('ALL')

    const [cycleFilter, setCycleFilter] = useState<CycleFilter>('ALL')
    const [promotionFilter, setPromotionFilter] = useState<PromotionFilter>('ALL')
    const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('ALL')

    const [selected, setSelected] = useState<Matiere | null>(null)

    // Options toolbar
    const cycleOptions = useMemo(() => {
        const uniq = new Set<string>()
        for (const m of MATIERES_MOCK) uniq.add(getCycleFromPromoLabel(m.id_promo))
        return Array.from(uniq).sort((a, b) => a.localeCompare(b, 'fr'))
    }, [])

    const promotionOptions = useMemo(() => {
        const uniq = new Set<string>()
        for (const m of MATIERES_MOCK) uniq.add(m.id_promo)
        return Array.from(uniq).sort((a, b) => a.localeCompare(b, 'fr'))
    }, [])

    const teacherOptions = useMemo(() => {
        return INTERNAL_TEACHERS_MOCK
            .map((t) => ({
                id: t.id,
                label: `${t.firstName} ${t.lastName}`.trim(),
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
    }, [])

    const filtered = useMemo(() => {
        const q = searchValue.trim().toLowerCase()

        return MATIERES_MOCK.filter((m) => {
            const matchesQuery = q.length === 0 || m.nom.toLowerCase().includes(q)

            const matchesSemestre =
                semestreFilter === 'ALL' || m.semestre === semestreFilter

            const matiereCycle = getCycleFromPromoLabel(m.id_promo)
            const matchesCycle = cycleFilter === 'ALL' || matiereCycle === cycleFilter

            const matchesPromotion =
                promotionFilter === 'ALL' || m.id_promo === promotionFilter

            const matchesTeacher = teacherFilter === 'ALL' ? true : true

            return (
                matchesQuery &&
                matchesSemestre &&
                matchesCycle &&
                matchesPromotion &&
                matchesTeacher
            )
        })
    }, [searchValue, semestreFilter, cycleFilter, promotionFilter, teacherFilter])

    const groupedByPromo = useMemo(() => {
        const map = new Map<string, Matiere[]>()
        for (const m of filtered) {
            const key = m.id_promo
            const list = map.get(key) ?? []
            list.push(m)
            map.set(key, list)
        }

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b, 'fr'))
            .map(([promoLabel, matieres]) => ({
                promoLabel,
                matieres: matieres
                    .slice()
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
            }))
    }, [filtered])

    const handleSelectMatiere = (m: Matiere) => {
        console.log('[MATIERES] Select', m)
        setSelected(m)
    }

    return (
        <>
            <PageHeader title="Matières" subtitle="Gestion des matières par promotion" />

            <div className="matieres-page">
                <MatieresToolbar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    semestreFilter={semestreFilter}
                    onSemestreChange={setSemestreFilter}
                    cycleFilter={cycleFilter}
                    onCycleChange={(v) => {
                        console.log('[MATIERES] Filtre cycle :', v)
                        setCycleFilter(v)
                        // setPromotionFilter('ALL')
                    }}
                    promotionFilter={promotionFilter}
                    onPromotionChange={(v) => {
                        console.log('[MATIERES] Filtre promotion :', v)
                        setPromotionFilter(v)
                    }}
                    teacherFilter={teacherFilter}
                    onTeacherChange={(v) => {
                        console.log('[MATIERES] Filtre enseignant :', v)
                        setTeacherFilter(v)
                    }}
                    cycleOptions={cycleOptions}
                    promotionOptions={promotionOptions}
                    teacherOptions={teacherOptions}
                />

                <div className="matieres-sections">
                    {groupedByPromo.map(({ promoLabel, matieres }) => (
                        <MatiereSection
                            key={promoLabel}
                            promoLabel={promoLabel}
                            matieres={matieres}
                            onSelectMatiere={handleSelectMatiere}
                        />
                    ))}

                    {groupedByPromo.length === 0 && (
                        <div className="matieres-empty-state">
                            Aucune matière ne correspond à vos filtres.
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <MatiereDetailCard matiere={selected} onClose={() => setSelected(null)} />
            )}
        </>
    )
}