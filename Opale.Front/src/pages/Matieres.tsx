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
import { cyclesApi } from '../services/api/cyclesApi'
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
    const [searchValue, setSearchValue] = useState('')
    const [semestreFilter, setSemestreFilter] = useState<SemestreFilter>('ALL')

    const [cycleFilter, setCycleFilter] = useState<CycleFilter>('ALL')
    const [promotionFilter, setPromotionFilter] = useState<PromotionFilter>('ALL')
    const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('ALL')

    const [matieres, setMatieres] = useState<Matiere[]>([])
    const [teachers, setTeachers] = useState<TeacherApi[]>([])
    const [promoById, setPromoById] = useState<Map<string, { id: string; nom: string; id_cycle: string }>>(new Map())
    const [cycleNameById, setCycleNameById] = useState<Map<string, string>>(new Map())

    const [allPromotionLabels, setAllPromotionLabels] = useState<string[]>([])
    const [allCycleNames, setAllCycleNames] = useState<string[]>([])


    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                console.log('[MATIERES] fetching matieres + promotions + cycles + profs')

                const [backendMatieres, promosRes, cyclesRes, profs] = await Promise.all([
                    getMatieres(),                 // Array backend matieres
                    promotionsApi.getPromotions(), // ApiResponse<BackendPromotion[]>
                    cyclesApi.getCycles(),         // ApiResponse<BackendCycle[]>
                ])

                console.log('[MATIERES] backendMatieres length:', backendMatieres?.length)
                console.log('[MATIERES] backendMatieres first:', backendMatieres?.[0])

                if (!promosRes.success) throw new Error(promosRes.error?.message ?? 'Promotions fetch failed')
                if (!cyclesRes.success) throw new Error(cyclesRes.error?.message ?? 'Cycles fetch failed')

                const backendPromos = promosRes.data ?? []
                const backendCycles = cyclesRes.data ?? []

                console.log('[MATIERES] backendPromos length:', backendPromos.length)
                console.log('[MATIERES] backendCycles length:', backendCycles.length)

                const promotionLabels = backendPromos
                    .map((p) => p.nom)
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b, 'fr'))

                const cycleNames = backendCycles
                    .map((c) => c.nom)
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b, 'fr'))

                // promoId -> { id, nom, id_cycle }
                const promoMap = new Map<string, { id: string; nom: string; id_cycle: string }>()
                for (const p of backendPromos) promoMap.set(p.id, { id: p.id, nom: p.nom, id_cycle: p.id_cycle })

                // cycleId -> cycleName
                const cycleMap = new Map<string, string>()
                for (const c of backendCycles) cycleMap.set(c.id, c.nom)

                // promoId -> promo label (affichage dans Matiere.id_promo)
                const promoLabelById = new Map<string, string>()
                for (const p of backendPromos) promoLabelById.set(p.id, p.nom)

                const frontMatieres = (backendMatieres ?? []).map((m: any) =>
                    transformBackendMatiereToFrontend(m, promoLabelById)
                )

                if (!mounted) return

                setMatieres(frontMatieres)
                setPromoById(promoMap)
                setCycleNameById(cycleMap)
                setTeachers(profs ?? [])
                setAllPromotionLabels(promotionLabels)
                setAllCycleNames(cycleNames)

            } catch (e) {
                console.error('[MATIERES] load failed:', e)
                if (!mounted) return
                setMatieres([])
                setPromoById(new Map())
                setCycleNameById(new Map())
                setTeachers([])
                setAllPromotionLabels([])
                setAllCycleNames([])

            }
        })()

        return () => {
            mounted = false
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
        return allCycleNames
    }, [allCycleNames])

    const promotionOptions = useMemo(() => {
        return allPromotionLabels
    }, [allPromotionLabels])

    const teacherOptions = useMemo(() => {
        return (teachers ?? [])
            .map((t: any) => ({
                id: String(t.id),
                label: `${t.prenom ?? ''} ${t.nom ?? ''}`.trim(),
            }))
            .filter((o) => o.label.length > 0)
            .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
    }, [teachers])


    const filtered = useMemo(() => {
        const q = searchValue.trim().toLowerCase()

        return matieres.filter((m) => {
            // Search
            const matchesQuery = q.length === 0 || m.nom.toLowerCase().includes(q)

            // Semestre (UI: 'S1'/'S2' | data: number)
            const semestreValue = Number(m.semestre) // au cas où ça arrive en string "1"/"2"
            const matchesSemestre =
                semestreFilter === 'ALL' ||
                (semestreFilter === 1 && semestreValue === 1) ||
                (semestreFilter === 2 && semestreValue === 2)

            // Cycle (API: via promo_id -> promotion.id_cycle -> cycleNameById)
            const promoId = m.promo_id ?? ''
            const promo = promoById.get(promoId)
            const matiereCycleName = promo ? (cycleNameById.get(promo.id_cycle) ?? '—') : '—'
            const matchesCycle = cycleFilter === 'ALL' || matiereCycleName === cycleFilter

            // Promotion (front stores label in m.id_promo)
            const matchesPromotion =
                promotionFilter === 'ALL' || m.id_promo === promotionFilter

            // Teacher (not wired yet -> keep existing behavior)
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
        promoById,
        cycleNameById,
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

    const reloadMatieres = async () => {
        console.log('[MATIERES] reloadMatieres()')
        const backendMatieres = await getMatieres()
        const promosRes = await promotionsApi.getPromotions()
        if (!promosRes.success) return

        const promoLabelById = new Map<string, string>()
        for (const p of promosRes.data ?? []) promoLabelById.set(p.id, p.nom)

        const frontMatieres = (backendMatieres ?? []).map((m: any) =>
            transformBackendMatiereToFrontend(m, promoLabelById)
        )

        setMatieres(frontMatieres)
    }

    console.log('Teacher option :', teacherOptions)

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
                    onAfterSave={reloadMatieres}
                    teacherOptions={teacherOptions}
                    onDelete={() => handleDeleteSingleMatiere(selected.id)}
                />
            )}

        </>
    )
}