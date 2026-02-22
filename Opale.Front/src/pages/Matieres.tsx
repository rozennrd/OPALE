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
import { cyclesApi } from '../services/api/cyclesApi'
import { getEnseignements } from '../services/api/enseignementsApi'
import {transformBackendMatiereToFrontend} from "../services/api/matieresApiTransformers.ts";

type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: { message?: string }
}

type BackendEnseignement = {
    id_matiere?: string | number
    id_prof?: string | number
}

function unwrapApiArray<T>(res: ApiResponse<T[]> | T[]): T[] {
    if (Array.isArray(res)) return res
    return res.data ?? []
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
    const [teacherIdsByMatiereId, setTeacherIdsByMatiereId] = useState<Map<string, Set<string>>>(new Map())

    const [allPromotionOptions, setAllPromotionOptions] = useState<{ id: string; nom: string }[]>([])
    const [allCycleOptions, setAllCycleOptions] = useState<{ id: string; nom: string }[]>([])


    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                console.log('[MATIERES] fetching matieres + promotions + cycles + profs')

                const [backendMatieres, promosRes, cyclesRes, enseignementsRes] = await Promise.all([
                    getMatieres(),                 // Array backend matieres
                    promotionsApi.getPromotions(), // ApiResponse<BackendPromotion[]>
                    cyclesApi.getCycles(),         // ApiResponse<BackendCycle[]>
                    getEnseignements(),            // ApiResponse<BackendEnseignement[]>
                ])

                console.log('[MATIERES] backendMatieres length:', backendMatieres?.length)
                console.log('[MATIERES] backendMatieres first:', backendMatieres?.[0])

                if (!promosRes.success) throw new Error(promosRes.error?.message ?? 'Promotions fetch failed')
                if (!cyclesRes.success) throw new Error(cyclesRes.error?.message ?? 'Cycles fetch failed')

                const enseignements: BackendEnseignement[] = unwrapApiArray<BackendEnseignement>(enseignementsRes)

                const map = new Map<string, Set<string>>()

                for (const e of enseignements) {
                    const matiereId = e.id_matiere

                    const teacherId = e.id_prof

                    if (!matiereId || !teacherId) continue

                    const key = String(matiereId)
                    const tId = String(teacherId)

                    const set = map.get(key) ?? new Set<string>()
                    set.add(tId)
                    map.set(key, set)
                }

                if (!mounted) return
                setTeacherIdsByMatiereId(map)
                const backendPromos = promosRes.data ?? []
                const backendCycles = cyclesRes.data ?? []

                console.log('[MATIERES] backendPromos length:', backendPromos.length)
                console.log('[MATIERES] backendCycles length:', backendCycles.length)

                console.log('[MATIERES] example matiere id:', matieres?.[0]?.id)
                console.log('[MATIERES] example enseignement matiereId:', enseignements?.[0]?.id_matiere)

                const promotionOptions = backendPromos
                    .map((p) => ({ id: p.id, nom: p.nom }))
                    .filter((p) => p.nom)
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

                const cycleOptions = backendCycles
                    .map((c) => ({ id: c.id, nom: c.nom }))
                    .filter((c) => c.nom)
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

                // promoId -> { id, nom, id_cycle }
                const promoMap = new Map<string, { id: string; nom: string; id_cycle: string }>()
                for (const p of backendPromos) promoMap.set(p.id, { id: p.id, nom: p.nom, id_cycle: p.id_cycle })

                // cycleId -> cycleName
                const cycleMap = new Map<string, string>()
                for (const c of backendCycles) cycleMap.set(c.id, c.nom)

                // promoId -> promo label (affichage dans Matiere.id_promo)
                const promoLabelById = new Map<string, string>()
                for (const p of backendPromos) promoLabelById.set(p.id, p.nom)

                const frontMatieres = (backendMatieres ?? []).map((m) =>
                    transformBackendMatiereToFrontend(m, promoLabelById)
                )

                if (!mounted) return

                setMatieres(frontMatieres)
                setPromoById(promoMap)
                setCycleNameById(cycleMap)
                setAllPromotionOptions(promotionOptions)
                setAllCycleOptions(cycleOptions)

            } catch (e) {
                console.error('[MATIERES] load failed:', e)
                if (!mounted) return
                setMatieres([])
                setPromoById(new Map())
                setCycleNameById(new Map())
                setTeachers([])
                setAllPromotionOptions([])
                setAllCycleOptions([])
                setTeacherIdsByMatiereId(new Map())
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
        return allCycleOptions
    }, [allCycleOptions])

    const promotionOptions = useMemo(() => {
        return allPromotionOptions
    }, [allPromotionOptions])

    const teacherOptions = useMemo(() => {
        return (teachers ?? [])
            .map((t) => ({
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
            const matchesTeacher =
                teacherFilter === 'ALL'
                    ? true
                    : (teacherIdsByMatiereId.get(String(m.id))?.has(String(teacherFilter)) ?? false)

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
        teacherIdsByMatiereId,
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

        const frontMatieres = (backendMatieres ?? []).map((m) =>
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