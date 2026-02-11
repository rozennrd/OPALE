// src/pages/Matieres.tsx

import React, {useEffect, useMemo, useState} from 'react'
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
import { getMatieres } from '../services/api/matieresApi'
import { TeacherApi } from '../services/api/professorsApi'
import { promotionsApi } from '../services/api/promotionsApi'
import { Matiere } from '../models/Matiere'
import { useSelectionState } from '../hooks/common/useSelectionState'
import { useToolbarFilters } from '../hooks/common/useToolbarFilters'
import {transformBackendPromotionToFrontend} from "../services/api/promotionsApiTransformers.ts";
import {transformBackendMatiereToFrontend} from "../services/api/matieresApiTransformers.ts";

const getCycleFromPromoLabel = (promoLabel: string) => {
    return (promoLabel || '').trim().split(/\s+/)[0] || '-'
}
const DEFAULT_MATIERES_FILTERS: {
    searchValue: string
    semestreFilter: SemestreFilter
    cycleFilter: CycleFilter
    promotionFilter: PromotionFilter
    teacherFilter: TeacherFilter
} = {
    searchValue: '',
    semestreFilter: 'ALL',
    cycleFilter: 'ALL',
    promotionFilter: 'ALL',
    teacherFilter: 'ALL',
}

export default function Matieres() {
    const [matieres, setMatieres] = useState<Matiere[]>(() => [...MATIERES_MOCK])

    const [searchValue, setSearchValue] = useState('')
    const [semestreFilter, setSemestreFilter] = useState<SemestreFilter>('ALL')

    const [cycleFilter, setCycleFilter] = useState<CycleFilter>('ALL')
    const [promotionFilter, setPromotionFilter] = useState<PromotionFilter>('ALL')
    const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('ALL')

    const [matieres, setMatieres] = useState<Matiere[]>([])
    const [teachers] = useState<TeacherApi[]>([])

    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                const backendMatieres = await getMatieres()
                console.log('[MATIERES] fetching promotions via promotionsApi.getPromotions()...')
                const promosRes = await promotionsApi.getPromotions()

                if (!promosRes.success) {
                    console.error('[MATIERES] promos error:', promosRes.error)
                    throw new Error(promosRes.error?.message ?? 'Failed to fetch promotions')
                }

                const backendPromos = promosRes.data ?? []
                // Transform backend promos -> front promos (juste pour avoir label)
                const frontPromos = backendPromos.map(transformBackendPromotionToFrontend)
                console.log(
                    '[MATIERES] promo id sample (frontend):',
                    frontPromos.slice(0, 5).map((p) => p.id)
                )

                // Build promo map: promoId(string) -> label
                const promoMap = new Map<string, string>()
                for (const p of frontPromos) promoMap.set(p.id, p.label)

                const promoIdsInMatieres = new Set(
                    backendMatieres.map((m: any) => String(m.id_promo ?? ''))
                )
                const promoIdsInPromos = new Set(Array.from(promoMap.keys()))

                // Count matches
                let matchCount = 0
                for (const id of promoIdsInMatieres) if (promoIdsInPromos.has(id)) matchCount++

                const frontMatieres = backendMatieres.map(m => transformBackendMatiereToFrontend(m, promoMap))

                if (!mounted) return
                setMatieres(frontMatieres)

            } catch (e) {
                console.error('[MATIERES] load failed:', e)
                if (!mounted) return
                setMatieres([])
            }
        })()

        return () => {
            mounted = false
            console.log('[MATIERES][useEffect] unmount')
        }
    }, [])



    const [selected, setSelected] = useState<Matiere | null>(null)

    const {
        selectionMode,
        selectedIds: selectedMatiereIds,
        selectedIdsSet: selectedMatiereIdsSet,
        selectedCount: selectedMatiereCount,
        toggleSelectionMode: toggleMatiereSelectionMode,
        toggleSelection: toggleMatiereSelection,
        selectAll: selectAllMatieres,
        clearSelection: clearMatiereSelection,
        disableSelectionMode: disableMatiereSelectionMode,
        pruneSelection: pruneMatiereSelection,
    } = useSelectionState({
        onEnterSelectionMode: () => {
            setSelected(null)
        },
    })

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
        return teachers
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

    const {
        hasActiveFilters,
        resetFilters: handleResetFilters,
    } = useToolbarFilters({
        values: {
            searchValue,
            semestreFilter,
            cycleFilter,
            promotionFilter,
            teacherFilter,
        },
        defaults: DEFAULT_MATIERES_FILTERS,
        onReset: () => {
            setSearchValue(DEFAULT_MATIERES_FILTERS.searchValue)
            setSemestreFilter(DEFAULT_MATIERES_FILTERS.semestreFilter)
            setCycleFilter(DEFAULT_MATIERES_FILTERS.cycleFilter)
            setPromotionFilter(DEFAULT_MATIERES_FILTERS.promotionFilter)
            setTeacherFilter(DEFAULT_MATIERES_FILTERS.teacherFilter)
        },
    })

    const removeMatieresByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        setMatieres((prev) => prev.filter((matiere) => !idsSet.has(matiere.id)))
        pruneMatiereSelection(Array.from(idsSet))
        setSelected((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })
    }

    const handleDeleteSingleMatiere = (matiereId: string) => {
        removeMatieresByIds([matiereId])
    }

    const handleDeleteSelected = () => {
        removeMatieresByIds(selectedMatiereIds)
        disableMatiereSelectionMode()
    }

    const handleSelectMatiere = (matiere: Matiere) => {
        setSelected(matiere)
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
                    onCycleChange={setCycleFilter}
                    promotionFilter={promotionFilter}
                    onPromotionChange={setPromotionFilter}
                    teacherFilter={teacherFilter}
                    onTeacherChange={setTeacherFilter}
                    cycleOptions={cycleOptions}
                    promotionOptions={promotionOptions}
                    teacherOptions={teacherOptions}
                    selectionMode={selectionMode}
                    selectedCount={selectedMatiereCount}
                    onToggleSelectionMode={toggleMatiereSelectionMode}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {selectionMode && (
                        <SelectionToolbar
                            totalCount={visibleMatiereIds.length}
                            selectedCount={selectedMatiereCount}
                            onSelectAll={() => selectAllMatieres(visibleMatiereIds)}
                            onClearSelection={clearMatiereSelection}
                            onDeleteSelected={handleDeleteSelected}
                            confirmTitle="Supprimer les matières sélectionnées"
                            confirmMessage={`Vous allez supprimer ${selectedMatiereIds.length} matière${selectedMatiereIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
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
                            onToggleMatiereSelection={toggleMatiereSelection}
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
                <MatiereDetailCard
                    matiere={selected}
                    onClose={() => setSelected(null)}
                    onDelete={() => handleDeleteSingleMatiere(selected.id)}
                />
            )}
        </>
    )
}