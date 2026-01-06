import { useState, useEffect, useRef } from 'react'
import { Cycle } from '../../models'
import { buildMockCycles } from '../../mocks/promotionCycles.mock'
import {
    hasPromoMismatch,
} from '../../utils/promoUtils'
import { cyclesApi } from '../../services/api/cyclesApi'
import { promotionsApi } from '../../services/api/promotionsApi'
import {
    transformBackendPromotionToFrontend,
    transformBackendCycleToFrontend,
} from '../../services/api/promotionsApiTransformers'
import { CYCLE_TYPES } from '../../constants/cycleTypes'




export function usePromotionCycles() {
    const [cycles, setCycles] = useState<Cycle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cycleTypes] = useState<string[]>([...CYCLE_TYPES])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
                const promotionsByCycle: { [key: number]: Promotion[] } = {}

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
                    transformBackendCycleToFrontend(bc, promotionsByCycle[bc.id] || [])
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
        setIsCreateModalOpen(true)
    }

    const closeCreateModal = (): void => {
        setIsCreateModalOpen(false)
    }

    // Create cycle with multiple promotions
    const createCycleWithPromotions = async (formData: { name: string; type: string; promotionCount: number }): Promise<void> => {
        try {
            setLoading(true)
            setError('')

            // 1. Create the cycle
            const cycleResponse = await cyclesApi.addCycle({ nom: formData.name, type: formData.type })
            if (!cycleResponse.data?.insertedId) {
                throw new Error('Failed to create cycle')
            }

            const newCycleId = cycleResponse.data.insertedId

            // 2. Create the promotions
            const promotionPromises = []
            const now = new Date()
            const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

            for (let i = 1; i <= formData.promotionCount; i++) {
                const promotionData = {
                    nom: `${formData.name} ${i}`,
                    effectifs: 0, // Default empty
                    id_cycle: newCycleId,
                    date_start: now.toISOString(),
                    date_end: oneYearFromNow.toISOString()
                }

                promotionPromises.push(promotionsApi.addPromotion(promotionData))
            }

            // Wait for all promotions to be created
            await Promise.all(promotionPromises)

            // 3. Refresh the data
            await loadCycles()

        } catch (err) {
            console.error('Error creating cycle with promotions:', err)
            setError('Erreur lors de la création du cycle et des promotions')
        } finally {
            setLoading(false)
        }
    }
    const [cycles, setCycles] = useState<Cycle[]>(() => buildMockCycles())

    const removeCycle = async (cycleId: string): Promise<void> => {

        try {
            await cyclesApi.deleteCycle(cycleId)
            await loadCycles()
        } catch (err) {
            console.error('Error removing cycle:', err)
            setError('Erreur lors de la suppression du cycle')
        }
    }

    const renameCycle = async (cycleId: string, name: string): Promise<void> => {

        try {
            // Get current cycle to preserve type
            const currentCycle = cycles.find(c => c.id === cycleId)
            if (!currentCycle) return

            await cyclesApi.updateCycle({
                id: cycleId,
                nom: name,
                type: cycleTypes.length > 0 ? cycleTypes[0] : 'default' // Use first available type
            }).then(() => {loadCycles()})

        } catch (err) {
            console.error('Error renaming cycle:', err)
            setError('Erreur lors de la modification du cycle')
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
        return () => {
            renameTimeoutsRef.current.forEach(timeoutId => {
                clearTimeout(timeoutId)
            })
            renameTimeoutsRef.current.clear()
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
        addCycle,
        removeCycle,
        renameCycle,
        removePromotion,
    }
}