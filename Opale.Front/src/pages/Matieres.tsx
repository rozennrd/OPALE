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
import SelectionToolbar from '../components/common/SelectionToolbar'
import { MATIERES_MOCK } from '../mocks/matieres.mock'
import { INTERNAL_TEACHERS_MOCK } from '../mocks/teachers.mock'
import { Matiere } from '../models/Matiere'

const getCycleFromPromoLabel = (promoLabel: string) => {
    return (promoLabel || '').trim().split(/\s+/)[0] || '-'
}

export default function Matieres() {
    const [matieres, setMatieres] = useState<Matiere[]>(() => [...MATIERES_MOCK])

    const [searchValue, setSearchValue] = useState('')
    const [semestreFilter, setSemestreFilter] = useState<SemestreFilter>('ALL')

    const [cycleFilter, setCycleFilter] = useState<CycleFilter>('ALL')
    const [promotionFilter, setPromotionFilter] = useState<PromotionFilter>('ALL')
    const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('ALL')

    const [selected, setSelected] = useState<Matiere | null>(null)

    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedMatiereIds, setSelectedMatiereIds] = useState<string[]>([])

    const selectedMatiereIdsSet = useMemo(
        () => new Set(selectedMatiereIds),
        [selectedMatiereIds],
    )

    const cycleOptions = useMemo(() => {
        const uniq = new Set<string>()
        for (const m of matieres) uniq.add(getCycleFromPromoLabel(m.id_promo))
        return Array.from(uniq).sort((a, b) => a.localeCompare(b, 'fr'))
    }, [matieres])

    const promotionOptions = useMemo(() => {
        const uniq = new Set<string>()
        for (const m of matieres) uniq.add(m.id_promo)
        return Array.from(uniq).sort((a, b) => a.localeCompare(b, 'fr'))
    }, [matieres])

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

        return matieres.filter((m) => {
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
    }, [
        matieres,
        searchValue,
        semestreFilter,
        cycleFilter,
        promotionFilter,
        teacherFilter,
    ])

    const visibleMatiereIds = useMemo(
        () => filtered.map((matiere) => matiere.id),
        [filtered],
    )

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
            .map(([promoLabel, groupedMatieres]) => ({
                promoLabel,
                matieres: groupedMatieres
                    .slice()
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
            }))
    }, [filtered])

    const removeMatieresByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        setMatieres((prev) => prev.filter((matiere) => !idsSet.has(matiere.id)))
        setSelectedMatiereIds((prev) => prev.filter((id) => !idsSet.has(id)))
        setSelected((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })
    }

    const handleDeleteSingleMatiere = (matiereId: string) => {
        removeMatieresByIds([matiereId])
    }

    const handleToggleSelectionMode = () => {
        setSelectionMode((prev) => {
            const next = !prev

            if (next) {
                setSelected(null)
                setSelectedMatiereIds([])
            } else {
                setSelectedMatiereIds([])
            }

            return next
        })
    }

    const handleToggleMatiereSelection = (matiereId: string) => {
        if (!selectionMode) return

        setSelectedMatiereIds((prev) => {
            if (prev.includes(matiereId)) {
                return prev.filter((id) => id !== matiereId)
            }
            return [...prev, matiereId]
        })
    }

    const handleSelectAllVisible = () => {
        setSelectedMatiereIds(visibleMatiereIds)
    }

    const handleClearSelection = () => {
        setSelectedMatiereIds([])
    }

    const handleDeleteSelected = () => {
        removeMatieresByIds(selectedMatiereIds)
        setSelectionMode(false)
        setSelectedMatiereIds([])
    }

    const handleSelectMatiere = (matiere: Matiere) => {
        setSelected(matiere)
    }

    return (
        <>
            <PageHeader title="Matieres" subtitle="Gestion des matieres par promotion" />

            <div className="matieres-page">
                <MatieresToolbar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    semestreFilter={semestreFilter}
                    onSemestreChange={setSemestreFilter}
                    cycleFilter={cycleFilter}
                    onCycleChange={setCycleFilter}
                    promotionFilter={promotionFilter}
                    onPromotionChange={setPromotionFilter}
                    teacherFilter={teacherFilter}
                    onTeacherChange={setTeacherFilter}
                    cycleOptions={cycleOptions}
                    promotionOptions={promotionOptions}
                    teacherOptions={teacherOptions}
                    selectionMode={selectionMode}
                    selectedCount={selectedMatiereIds.length}
                    onToggleSelectionMode={handleToggleSelectionMode}
                />

                {selectionMode && (
                    <SelectionToolbar
                        totalCount={visibleMatiereIds.length}
                        selectedCount={selectedMatiereIds.length}
                        onSelectAll={handleSelectAllVisible}
                        onClearSelection={handleClearSelection}
                        onDeleteSelected={handleDeleteSelected}
                        confirmTitle="Supprimer les matieres selectionnees"
                        confirmMessage={`Vous allez supprimer ${selectedMatiereIds.length} matiere${selectedMatiereIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                    />
                )}

                <div className="matieres-sections">
                    {groupedByPromo.map(({ promoLabel, matieres: groupedMatieres }) => (
                        <MatiereSection
                            key={promoLabel}
                            promoLabel={promoLabel}
                            matieres={groupedMatieres}
                            onSelectMatiere={handleSelectMatiere}
                            selectionMode={selectionMode}
                            selectedMatiereIds={selectedMatiereIdsSet}
                            onToggleMatiereSelection={handleToggleMatiereSelection}
                        />
                    ))}

                    {groupedByPromo.length === 0 && (
                        <div className="matieres-empty-state">
                            Aucune matiere ne correspond a vos filtres.
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <MatiereDetailCard
                    matiere={selected}
                    onClose={() => setSelected(null)}
                    onDelete={() => handleDeleteSingleMatiere(selected.id)}
                />
            )}
        </>
    )
}
