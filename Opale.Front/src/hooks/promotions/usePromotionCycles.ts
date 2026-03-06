import { useState, useEffect, useRef } from 'react'
import { Cycle, Promotion } from '../../models'
import {hasPromoMismatch} from '../../utils/promoUtils'
import { cyclesApi } from '../../services/api/cyclesApi'
import { promotionsApi } from '../../services/api/promotionsApi'
import {
    transformBackendPromotionToFrontend,
    transformBackendCycleToFrontend,
    transformFrontendPromotionToBackendCreate,
} from '../../services/api/promotionsApiTransformers'
import { CYCLE_TYPES } from '../../constants/cycleTypes'
import { createEmptyConstraints } from './usePromotionConstraints'

const sortPromotionsByLabel = (promotions: Promotion[]): Promotion[] => {
    return [...promotions].sort((left, right) => {
        const leftLabel = (left.label || '').trim()
        const rightLabel = (right.label || '').trim()
        return leftLabel.localeCompare(rightLabel, 'fr', { numeric: true, sensitivity: 'base' })
    })
}

export const DUPLICATE_CYCLE_MESSAGE = 'Un cycle avec ce nom existe deja.'

const normalizeCycleName = (value: string): string => {
    return value.trim().toLocaleLowerCase('fr')
}




export function usePromotionCycles() {
    const [cycles, setCycles] = useState<Cycle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cycleTypes] = useState<string[]>([...CYCLE_TYPES])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [renameErrors, setRenameErrors] = useState<Record<string, string>>({})

    // Store pending rename timeouts for each cycle
    const renameTimeoutsRef = useRef<Map<string, number>>(new Map())

    // Load cycles from backend on mount
    const loadCycles = async () => {
        try {
            setLoading(true)
            const [cyclesResponse, promotionsResponse] = await Promise.all([
                cyclesApi.getCycles(),
                promotionsApi.getPromotions()
            ])

            if (cyclesResponse.data && promotionsResponse.data) {
                // Group promotions by cycle
                const backendCycles = cyclesResponse.data
                const backendPromotions = promotionsResponse.data
                const promotionsByCycle: { [key: string]: Promotion[] } = {}
                backendPromotions.forEach(bp => {
                    const promo = transformBackendPromotionToFrontend(bp)
                    if (bp.id_cycle) {
                        if (!promotionsByCycle[bp.id_cycle]) {
                            promotionsByCycle[bp.id_cycle] = []
                        }
                        promotionsByCycle[bp.id_cycle].push(promo)
                    }
                })

                // Transform cycles with their associated promotions
                const frontendCycles = backendCycles.map(bc =>
                    transformBackendCycleToFrontend(
                        bc,
                        sortPromotionsByLabel(promotionsByCycle[bc.id] || []),
                    )
                )

                setCycles(frontendCycles)
                setError('')
            }
        } catch (err) {
            console.error('Error loading cycles:', err)
            setError('Erreur lors du chargement des cycles et promotions')
        } finally {
            setLoading(false)
        }
    }

// Load data on mount
    useEffect(() => {
        loadCycles()
    }, [])

    // Modal management
    const openCreateModal = (): void => {
        setError('')
        setIsCreateModalOpen(true)
    }

    const closeCreateModal = (): void => {
        setIsCreateModalOpen(false)
    }

    const isDuplicateCycleName = (name: string, excludeId?: string): boolean => {
        const normalized = normalizeCycleName(name)
        if (!normalized) return false
        return cycles.some(cycle => normalizeCycleName(cycle.name) === normalized && cycle.id !== excludeId)
    }

    const validateCreateCycleName = (name: string): string => {
        const trimmedName = name.trim()
        if (!trimmedName) return ''
        return isDuplicateCycleName(trimmedName) ? DUPLICATE_CYCLE_MESSAGE : ''
    }

    const clearRenameError = (cycleId: string): void => {
        setRenameErrors((prev) => {
            if (!prev[cycleId]) return prev
            const next = { ...prev }
            delete next[cycleId]
            return next
        })
    }

    const updateRenameValidation = (cycleId: string, name: string): void => {
        const trimmedName = name.trim()
        const isDuplicate = trimmedName ? isDuplicateCycleName(trimmedName, cycleId) : false
        if (isDuplicate) {
            setRenameErrors((prev) => ({ ...prev, [cycleId]: DUPLICATE_CYCLE_MESSAGE }))
            return
        }
        setRenameErrors((prev) => {
            if (prev[cycleId] !== DUPLICATE_CYCLE_MESSAGE) return prev
            const next = { ...prev }
            delete next[cycleId]
            return next
        })
    }

    // Create cycle with multiple promotions
    const createCycleWithPromotions = async (formData: { name: string; type: string; promotionCount: number }): Promise<boolean> => {
        const trimmedName = formData.name.trim()
        if (isDuplicateCycleName(trimmedName)) {
            setError('')
            return false
        }

        try {
            setLoading(true)
            setError('')

            // 1. Create the cycle
            const cycleResponse = await cyclesApi.addCycle({ nom: trimmedName, type: formData.type })
            if (!cycleResponse.success) {
                setError(cycleResponse.error?.message || 'Erreur lors de la création du cycle')
                return false
            }
            if (!cycleResponse.data?.insertedId) {
                throw new Error('Failed to create cycle')
            }

            const newCycleId = cycleResponse.data.insertedId

            // 2. Create the promotions
            const promotionPromises = []
            const now = new Date()
            const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

            for (let i = 1; i <= formData.promotionCount; i++) {
                const promotionData = transformFrontendPromotionToBackendCreate({
                    id: '',
                    label: `${trimmedName} ${i}`,
                    students: 0,
                    isApprentissage: formData.type === "apprentissage",
                    startDate: now.toISOString(),
                    endDate: oneYearFromNow.toISOString(),
                    groups: [],
                    specialties: [],
                    constraints: {
                        vacances: [],
                        entreprise: [],
                        stages: [],
                        international: [],
                        partiels: [],
                        rattrapages: [],
                    },
                }, newCycleId.toString())

                promotionPromises.push(promotionsApi.addPromotion(promotionData))
            }

            // Wait for all promotions to be created
            await Promise.all(promotionPromises)

            // 3. Refresh the data
            await loadCycles()
            return true

        } catch (err) {
            console.error('Error creating cycle with promotions:', err)
            setError('Erreur lors de la création du cycle et des promotions')
            return false
        } finally {
            setLoading(false)
        }
    }
    

    const removeCycle = async (cycleId: string): Promise<void> => {

        try {
            await cyclesApi.deleteCycle(cycleId)
            await loadCycles()
        } catch (err) {
            console.error('Error removing cycle:', err)
            setError('Erreur lors de la suppression du cycle')
        }
    }

    const renameCycle = async (cycleId: string, name: string): Promise<boolean> => {
        const trimmedName = name.trim()
        if (isDuplicateCycleName(trimmedName, cycleId)) {
            setRenameErrors((prev) => ({ ...prev, [cycleId]: DUPLICATE_CYCLE_MESSAGE }))
            return false
        }

        try {
            // Get current cycle to preserve type
            const currentCycle = cycles.find(c => c.id === cycleId)
            if (!currentCycle) return false

            const response = await cyclesApi.updateCycle({
                id: cycleId,
                nom: trimmedName,
                type: cycleTypes.length > 0 ? cycleTypes[0] : 'default' // Use first available type
            })
            if (!response.success) {
                setRenameErrors((prev) => ({
                    ...prev,
                    [cycleId]: response.error?.message || 'Erreur lors de la modification du cycle',
                }))
                return false
            }
            clearRenameError(cycleId)
            await loadCycles()
            return true

        } catch (err) {
            console.error('Error renaming cycle:', err)
            setRenameErrors((prev) => ({
                ...prev,
                [cycleId]: 'Erreur lors de la modification du cycle',
            }))
            return false
        }
    }

    const removePromotion = async (promoId: string): Promise<void> => {

        try {
            await promotionsApi.deletePromotion(promoId)
            // Refresh cycles from backend to get updated data
            await loadCycles()
        } catch (err) {
            console.error('Error removing promotion:', err)
            setError('Erreur lors de la suppression de la promotion')
        }
    }

    const addPromotionToCycle = async (cycleId: string, label: string): Promise<void> => {
        const trimmedLabel = label.trim()
        if (!trimmedLabel) return

        try {
            setLoading(true)
            setError('')

            // Create promotion with default dates
            const now = new Date()
            const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

            const promotionData = transformFrontendPromotionToBackendCreate({
                id: '',
                label: trimmedLabel,
                students: 0,
                startDate: now.toISOString(),
                endDate: oneYearFromNow.toISOString(),
                isApprentissage: false,
                groups: [],
                specialties: [],
                constraints: createEmptyConstraints(),
            }, cycleId)

            await promotionsApi.addPromotion(promotionData)

            // Refresh the data from backend
            await loadCycles()

        } catch (err) {
            console.error('Error adding promotion:', err)
            setError('Erreur lors de l\'ajout de la promotion')
        } finally {
            setLoading(false)
        }
    }

    // Flag global d'incohérence (stocké en localStorage)
    useEffect(() => {
        const anyMismatch = cycles.some(cycle =>
            (cycle.promotions || []).some(promo => hasPromoMismatch(promo))
        )

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('opale:promosMismatch', anyMismatch ? '1' : '0')
        }
    }, [cycles])

    // Cleanup pending timeouts on unmount
       useEffect(() => {
        const timeouts = renameTimeoutsRef.current
        return () => {
            timeouts.forEach(timeoutId => {
                clearTimeout(timeoutId)
            })
            timeouts.clear()
        }
    }, [])

    return {
        cycles,
        setCycles,
        loading,
        error,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        createCycleWithPromotions,

        removeCycle,
        renameCycle,
        renameErrors,
        clearRenameError,
        updateRenameValidation,
        validateCreateCycleName,
        removePromotion,
        addPromotionToCycle,
        refreshCycles: loadCycles,
    }
}


