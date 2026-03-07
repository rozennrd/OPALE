import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import icTrash from '../../../assets/ic-trash.png'
import icModif from '../../../assets/ic-modif.png'
import icPlus from '../../../assets/ic-plus.png'
import { hasPromoMismatch, uid } from '../../../utils/promoUtils'
import { Cycle, GroupSpecialtyItem, Promotion } from '../../../models'
import CycleImportDropzone from './CycleImportDropZone'
import ConfirmDialog from '../../common/ConfirmDialog'
import MaquettePreviewDialog from './MaquettePreviewDialog'
import MaquetteSpecialtyMapDialog from './MaquetteSpecialtyMapDialog'
import { DetectedSpecialtyItem, FileSpecialtyMapping, SpecialtyDraft } from './maquetteImportTypes'
import {
    maquetteApi,
    MaquetteAnalyzeResponse,
    MaquetteImportResponse,
    MaquetteSpecialtyMapping,
} from '../../../services/api/maquetteApi'
import { specialtiesApi } from '../../../services/api/specialtiesApi'


interface CycleCardProps {
    cycle: Cycle
    renameCycle: (cycleId: string, name: string) => Promise<boolean>
    renameError?: string
    clearRenameError: (cycleId: string) => void
    updateRenameValidation: (cycleId: string, name: string) => void
    removeCycle: (cycleId: string) => void
    openEditPromotion: (cycleId: string, promoId: string) => void
    removePromotion: (promoId: string) => void
    addPromotion: (cycleId: string, label: string) => void
    refreshCycles: () => Promise<void>
}

type ImportFeedbackVariant = 'success' | 'error' | 'info'

interface MappingModalState {
    file: File
    analysis: MaquetteAnalyzeResponse
    detectedItems: DetectedSpecialtyItem[]
    draftSpecialtiesByPromoId: Record<string, SpecialtyDraft[]>
    originalSpecialtiesByPromoId: Record<string, GroupSpecialtyItem[]>
    mapping: Record<string, string | null>
}

const normalize = (value: string): string => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
}

const extractHintFromToken = (token: string): string | null => {
    const cleaned = normalize(token).replace(/[^A-Z0-9]/g, '')
    if (!cleaned) return null

    const letters = (cleaned.match(/^([A-Z]{2,})\d/)?.[1] || cleaned).toUpperCase()

    if (letters.startsWith('ADI')) return 'ADI'
    if (letters.startsWith('CIR')) return 'CIR'
    if (letters.startsWith('ISEN') || letters.startsWith('FISE')) return 'ISEN'
    if (letters.startsWith('FISA')) return 'AP'
    if (letters === 'AP' || letters.startsWith('APS') || letters.startsWith('APPRENTISSAGE')) {
        return 'AP'
    }

    return null
}

const inferCycleHint = (cycle: Cycle): string | undefined => {
    const sources = [cycle.name, ...cycle.promotions.map((promotion) => promotion.label)]

    for (const source of sources) {
        const tokens = source.split(/[\s/_\-().]+/g).filter(Boolean)

        for (const token of tokens) {
            const hint = extractHintFromToken(token)
            if (hint) return hint
        }

        const normalizedSource = normalize(source)
        if (normalizedSource.includes('APPRENTISSAGE') || normalizedSource.includes('FISA')) {
            return 'AP'
        }
    }

    return undefined
}

const fileKey = (file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}`
}

const getPromotionNumberFromCode = (promotionCode?: string | null): number | null => {
    if (!promotionCode) return null
    const matches = promotionCode.match(/\d{1,2}/g)
    if (!matches || matches.length === 0) return null
    const value = Number(matches[matches.length - 1])
    return Number.isFinite(value) && value > 0 ? value : null
}

const mapSemestreToYearSemestre = (semestre: number, promoNumber: number | null): number => {
    if (!Number.isFinite(semestre) || semestre <= 0) return 1
    if (!promoNumber) return semestre % 2 === 0 ? 2 : 1
    return semestre === promoNumber * 2 ? 2 : 1
}

const formatSemestresForDisplay = (semestres: number[], promotionCode?: string | null): string => {
    if (!semestres || semestres.length === 0) return '-'
    const promoNumber = getPromotionNumberFromCode(promotionCode)
    const mapped = Array.from(
        new Set(
            semestres.map((semestre) => mapSemestreToYearSemestre(semestre, promoNumber)),
        ),
    ).sort((a, b) => a - b)
    return mapped.map((value) => `S${value}`).join(', ')
}

const isCommunSpecialite = (value: string | null | undefined): boolean => {
    if (!value) return false

    const normalized = normalize(value).replace(/\s+/g, ' ').trim()
    return (
        normalized === 'COMMUN' ||
        normalized.startsWith('COMMUN ') ||
        normalized.includes('TRONC COMMUN') ||
        normalized.includes('TRON COMMUN')
    )
}

const normalizePromoCode = (value: string): string =>
    normalize(value).replace(/[^A-Z0-9]/g, '')

const normalizeSpecialtyValue = (value: string): string =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(/[\/\\_|-]/g, ' ')
        .replace(/[\u2010-\u2015]/g, ' ')
        .replace(/[\u2019']/g, ' ')
        .replace(/[()[\]{}]/g, ' ')
        .replace(/[.,;:!?%]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

const emptyImportCounters = (): Required<
    Pick<
        MaquetteImportResponse,
        'insertedMatieres' | 'updatedMatieres' | 'skippedMatieres' | 'insertedExamEvents' | 'skippedExamEvents'
    >
> => ({
    insertedMatieres: 0,
    updatedMatieres: 0,
    skippedMatieres: 0,
    insertedExamEvents: 0,
    skippedExamEvents: 0,
})

const HOURS_KEYS: Array<keyof NonNullable<MaquetteAnalyzeResponse['matieres']>[number]['heures']> = [
    'coursMagistral',
    'coursInteractif',
    'td',
    'tp',
    'projet',
    'elearning',
    'visitesConferences',
    'autoGere',
]

const CycleCard: React.FC<CycleCardProps> = ({
                                                 cycle,
                                                 renameCycle,
                                                 renameError,
                                                 clearRenameError,
                                                 updateRenameValidation,
                                                 removeCycle,
                                                 openEditPromotion,
                                                 removePromotion,
                                                 addPromotion,
                                                 refreshCycles,
                                             }) => {
    const [cycleName, setCycleName] = useState(cycle.name)
    const [isAddPromoOpen, setIsAddPromoOpen] = useState(false)
    const [promoName, setPromoName] = useState('')

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [selectedFileAnalyses, setSelectedFileAnalyses] = useState<Record<string, MaquetteAnalyzeResponse>>({})
    const [fileMappings, setFileMappings] = useState<Record<string, FileSpecialtyMapping>>({})
    const [previewQueue, setPreviewQueue] = useState<File[]>([])
    const [previewFile, setPreviewFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<MaquetteAnalyzeResponse | null>(null)
    const [previewError, setPreviewError] = useState<string | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewPromotionIndex, setPreviewPromotionIndex] = useState(0)
    const [isPreviewWarningsVisible, setIsPreviewWarningsVisible] = useState(true)

    const [isImporting, setIsImporting] = useState(false)
    const [hasImported, setHasImported] = useState(false)
    const [importFeedback, setImportFeedback] = useState<{
        variant: ImportFeedbackVariant
        message: string
    } | null>(null)

    const [mappingModal, setMappingModal] = useState<MappingModalState | null>(null)
    const [mappingSaving, setMappingSaving] = useState(false)
    const [mappingError, setMappingError] = useState<string | null>(null)

    const previewRequestIdRef = useRef(0)

    const cycleHint = useMemo(() => inferCycleHint(cycle), [cycle])

    useEffect(() => {
        setCycleName(cycle.name)
    }, [cycle.name])

    const openAddPromoDialog = () => {
        const nextIndex = (cycle.promotions?.length || 0) + 1
        setPromoName(`${cycleName} ${nextIndex}`)
        setIsAddPromoOpen(true)
    }

    const closeAddPromoDialog = () => {
        setIsAddPromoOpen(false)
    }

    const handleConfirmAddPromo = () => {
        if (!promoName.trim()) return
        addPromotion(cycle.id, promoName)
        setIsAddPromoOpen(false)
    }

    const closePreview = useCallback(() => {
        previewRequestIdRef.current += 1
        setPreviewFile(null)
        setPreviewData(null)
        setPreviewError(null)
        setPreviewLoading(false)
        setPreviewPromotionIndex(0)
        setIsPreviewWarningsVisible(true)
    }, [])

    const runAnalyzePreview = useCallback(
        async (file: File) => {
            const requestId = previewRequestIdRef.current + 1
            previewRequestIdRef.current = requestId

            setPreviewFile(file)
            setPreviewData(null)
            setPreviewError(null)
            setPreviewLoading(true)

            try {
                const response = await maquetteApi.analyze(file, { cycleHint })

                if (previewRequestIdRef.current !== requestId) return

                if (response.success && response.data) {
                    setPreviewData(response.data)
                    setIsPreviewWarningsVisible(true)
                    const detections = response.data.metadata.sectionSemesterDetections || []
                    if (detections.length < 0) {
                        console.warn('[Maquette Preview] Aucune détection de semestres de section trouvée.')
                    }
                    return
                }

                setPreviewError(
                    response.error?.message ||
                    "Erreur lors de l'analyse de la maquette.",
                )
            } catch (error) {
                console.error('[CycleCard] Erreur preview maquette:', error)
                if (previewRequestIdRef.current !== requestId) return
                setPreviewError("Erreur inattendue pendant l'analyse de la maquette.")
            } finally {
                if (previewRequestIdRef.current === requestId) {
                    setPreviewLoading(false)
                }
            }
        },
        [cycleHint],
    )

    useEffect(() => {
        if (previewFile || previewQueue.length === 0) return

        const [nextFile, ...restQueue] = previewQueue
        setPreviewQueue(restQueue)
        void runAnalyzePreview(nextFile)
    }, [previewFile, previewQueue, runAnalyzePreview])

    const handleIncomingFiles = (files: File[]) => {
        const blockedKeys = new Set<string>([
            ...selectedFiles.map(fileKey),
            ...previewQueue.map(fileKey),
            ...(previewFile ? [fileKey(previewFile)] : []),
        ])

        const newFiles = files.filter((file) => !blockedKeys.has(fileKey(file)))
        if (newFiles.length === 0) {
            setImportFeedback({
                variant: 'info',
                message: 'Aucun nouveau fichier à prévisualiser.',
            })
            return
        }

        setImportFeedback(null)
        setPreviewQueue((previous) => [...previous, ...newFiles])
    }

    const handleRemoveValidatedFile = (fileToRemove: File) => {
        const key = fileKey(fileToRemove)
        setSelectedFiles((previous) =>
            previous.filter((file) => fileKey(file) !== fileKey(fileToRemove)),
        )
        setSelectedFileAnalyses((previous) => {
            if (!previous[key]) return previous
            const next = { ...previous }
            delete next[key]
            return next
        })
        setFileMappings((previous) => {
            if (!previous[key]) return previous
            const next = { ...previous }
            delete next[key]
            return next
        })
        setMappingModal((current) => {
            if (!current || fileKey(current.file) !== key) return current
            return null
        })
    }

    const handleValidatePreview = () => {
        if (!previewFile || !previewData) return

        setSelectedFiles((previous) => {
            const existing = new Set(previous.map(fileKey))
            if (existing.has(fileKey(previewFile))) return previous
            return [...previous, previewFile]
        })
        setSelectedFileAnalyses((previous) => ({
            ...previous,
            [fileKey(previewFile)]: previewData,
        }))
        setFileMappings((previous) => {
            const next = { ...previous }
            delete next[fileKey(previewFile)]
            return next
        })

        closePreview()
    }

    const handleCancelPreview = () => {
        closePreview()
    }

    const findPromotionByCode = (promotionCode: string): Promotion | null => {
        const normalizedCode = normalizePromoCode(promotionCode || '')
        if (!normalizedCode) return null

        return (
            cycle.promotions.find(
                (promo) => normalizePromoCode(promo.label) === normalizedCode,
            ) || null
        )
    }

    const buildDetectedSpecialties = (
        analysis: MaquetteAnalyzeResponse,
    ): DetectedSpecialtyItem[] => {
        const detectedByKey = new Map<string, DetectedSpecialtyItem>()

        analysis.matieres.forEach((matiere) => {
            const promotionCode = (matiere.promotionCode || '').trim()
            if (!promotionCode) return

            const rawSpecialty = (matiere.specialiteLabel || matiere.specialiteCode || '').trim()
            if (!rawSpecialty) return

            if (matiere.specialiteType === 'COMMUN' || isCommunSpecialite(rawSpecialty)) {
                return
            }

            const normalized = normalizeSpecialtyValue(rawSpecialty)
            if (!normalized) return

            const key = `${promotionCode}||${normalized}`
            const promotion = findPromotionByCode(promotionCode)
            const detectedLabel = rawSpecialty

            const existing = detectedByKey.get(key)
            if (!existing) {
                detectedByKey.set(key, {
                    key,
                    promotionCode,
                    promotionId: promotion?.id ?? null,
                    promotionLabel: promotion?.label ?? null,
                    detectedLabel,
                    normalized,
                })
                return
            }

            if (matiere.specialiteLabel && existing.detectedLabel !== detectedLabel) {
                detectedByKey.set(key, {
                    ...existing,
                    detectedLabel,
                })
            }
        })

        return Array.from(detectedByKey.values()).sort((left, right) => {
            const byPromo = left.promotionCode.localeCompare(right.promotionCode, 'fr', {
                numeric: true,
                sensitivity: 'base',
            })
            if (byPromo !== 0) return byPromo

            return left.detectedLabel.localeCompare(right.detectedLabel, 'fr', {
                numeric: true,
                sensitivity: 'base',
            })
        })
    }

    const buildMappingModalState = (
        file: File,
        analysis: MaquetteAnalyzeResponse,
    ): MappingModalState | null => {
        const detectedItems = buildDetectedSpecialties(analysis)
        if (detectedItems.length === 0) return null

        const promoIds = Array.from(
            new Set(detectedItems.map((item) => item.promotionId).filter(Boolean)),
        ) as string[]

        const draftSpecialtiesByPromoId: Record<string, SpecialtyDraft[]> = {}
        const originalSpecialtiesByPromoId: Record<string, GroupSpecialtyItem[]> = {}

        promoIds.forEach((promoId) => {
            const promo = cycle.promotions.find((promotion) => promotion.id === promoId)
            const specialties = (promo?.specialties || []).map((specialty) => ({
                id: specialty.id ? String(specialty.id) : undefined,
                idPromo: specialty.idPromo,
                nom: specialty.nom,
                effectifs: specialty.effectifs,
            }))

            draftSpecialtiesByPromoId[promoId] = specialties
            originalSpecialtiesByPromoId[promoId] = (promo?.specialties || []).map((specialty) => ({
                ...specialty,
                id: specialty.id ? String(specialty.id) : specialty.id,
            }))
        })

        const mapping: Record<string, string | null> = {}
        detectedItems.forEach((item) => {
            if (!item.promotionId) {
                mapping[item.key] = null
                return
            }

            const options = draftSpecialtiesByPromoId[item.promotionId] || []
            const match = options.find(
                (specialty) => normalizeSpecialtyValue(specialty.nom) === item.normalized,
            )
            mapping[item.key] = match ? (match.id ?? match.tempId ?? null) : null
        })

        return {
            file,
            analysis,
            detectedItems,
            draftSpecialtiesByPromoId,
            originalSpecialtiesByPromoId,
            mapping,
        }
    }

    const findNextFileRequiringMapping = (
        mappings: Record<string, FileSpecialtyMapping> = fileMappings,
    ): File | null => {
        for (const file of selectedFiles) {
            const analysis = selectedFileAnalyses[fileKey(file)]
            if (!analysis) continue
            const detectedItems = buildDetectedSpecialties(analysis)
            if (detectedItems.length === 0) continue

            const existingMapping = mappings[fileKey(file)]
            if (!existingMapping?.confirmed) {
                return file
            }
        }

        return null
    }

    const openMappingModalForFile = (file: File) => {
        const analysis = selectedFileAnalyses[fileKey(file)]
        if (!analysis) return
        const modalState = buildMappingModalState(file, analysis)
        if (!modalState) return
        setMappingError(null)
        setMappingModal(modalState)
    }

    const persistSpecialtyDrafts = async (
        state: MappingModalState,
    ): Promise<Record<string, string>> => {
        const createdIdMap: Record<string, string> = {}
        const errors: string[] = []

        for (const [promoId, draftList] of Object.entries(state.draftSpecialtiesByPromoId)) {
            const originalList = state.originalSpecialtiesByPromoId[promoId] || []
            const originalById = new Map(
                originalList
                    .filter((specialty) => specialty.id)
                    .map((specialty) => [String(specialty.id), specialty]),
            )

            for (const draft of draftList.filter((item) => item.tempId)) {
                const name = draft.nom.trim()
                if (!name) continue

                const response = await specialtiesApi.addSpecialty({
                    id_promo: promoId,
                    id_groupe: null,
                    nom: name,
                    effectifs: draft.effectifs,
                })

                if (!response.success || !response.data?.insertedId) {
                    errors.push(
                        response.error?.message ||
                        `Impossible d'ajouter la spÃ©cialitÃ© "${name}".`,
                    )
                    continue
                }

                createdIdMap[draft.tempId as string] = String(response.data.insertedId)
            }

            for (const draft of draftList.filter((item) => item.id)) {
                const original = originalById.get(String(draft.id))
                if (!original) continue

                if (
                    original.nom !== draft.nom ||
                    Number(original.effectifs) !== Number(draft.effectifs)
                ) {
                    const response = await specialtiesApi.updateSpecialty({
                        id: String(draft.id),
                        id_promo: promoId,
                        id_groupe: null,
                        nom: draft.nom.trim(),
                        effectifs: draft.effectifs,
                    })

                    if (!response.success) {
                        errors.push(
                            response.error?.message ||
                            `Impossible de mettre Ã  jour la spÃ©cialitÃ© "${draft.nom}".`,
                        )
                    }
                }
            }

            const draftIds = new Set(
                draftList
                    .filter((item) => item.id)
                    .map((item) => String(item.id)),
            )
            const removed = originalList.filter(
                (item) => item.id && !draftIds.has(String(item.id)),
            )

            for (const removedItem of removed) {
                const response = await specialtiesApi.deleteSpecialty(String(removedItem.id))
                if (!response.success) {
                    errors.push(
                        response.error?.message ||
                        `Impossible de supprimer la spÃ©cialitÃ© "${removedItem.nom}".`,
                    )
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(errors[0])
        }

        return createdIdMap
    }

    const buildSpecialtyMappingsPayload = (
        file: File,
        mappings: Record<string, FileSpecialtyMapping> = fileMappings,
    ): MaquetteSpecialtyMapping[] => {
        const analysis = selectedFileAnalyses[fileKey(file)]
        if (!analysis) return []

        const existingMapping = mappings[fileKey(file)]
        if (!existingMapping?.mapping) return []

        const detectedItems = buildDetectedSpecialties(analysis)
        return detectedItems
            .filter((item) => item.promotionId && existingMapping.mapping[item.key])
            .map((item) => ({
                promotionId: item.promotionId as string,
                detected: item.detectedLabel,
                specialtyId: existingMapping.mapping[item.key] as string,
            }))
    }

    const continueImportFlow = async (
        mappings: Record<string, FileSpecialtyMapping> = fileMappings,
    ) => {
        const nextFile = findNextFileRequiringMapping(mappings)
        if (nextFile) {
            openMappingModalForFile(nextFile)
            return
        }

        await runImport(mappings)
    }

    const handleMappingSelectionChange = (detectedKey: string, value: string) => {
        setMappingModal((previous) => {
            if (!previous) return previous
            return {
                ...previous,
                mapping: {
                    ...previous.mapping,
                    [detectedKey]: value || null,
                },
            }
        })
    }

    const handleAddDraftSpecialty = (promoId: string, initialName: string = '') => {
        setMappingModal((previous) => {
            if (!previous) return previous
            const nextList = [...(previous.draftSpecialtiesByPromoId[promoId] || [])]
            nextList.push({
                tempId: uid('new-specialty'),
                idPromo: promoId,
                nom: initialName,
                effectifs: 1,
            })

            return {
                ...previous,
                draftSpecialtiesByPromoId: {
                    ...previous.draftSpecialtiesByPromoId,
                    [promoId]: nextList,
                },
            }
        })
    }

    const handleSpecialtyNameChange = (promoId: string, index: number, value: string) => {
        setMappingModal((previous) => {
            if (!previous) return previous
            const nextList = [...(previous.draftSpecialtiesByPromoId[promoId] || [])]
            if (!nextList[index]) return previous
            nextList[index] = { ...nextList[index], nom: value }

            return {
                ...previous,
                draftSpecialtiesByPromoId: {
                    ...previous.draftSpecialtiesByPromoId,
                    [promoId]: nextList,
                },
            }
        })
    }

    const handleSpecialtyEffectifsChange = (promoId: string, index: number, value: string) => {
        setMappingModal((previous) => {
            if (!previous) return previous
            const nextList = [...(previous.draftSpecialtiesByPromoId[promoId] || [])]
            if (!nextList[index]) return previous
            nextList[index] = {
                ...nextList[index],
                effectifs: Number(value) || 0,
            }

            return {
                ...previous,
                draftSpecialtiesByPromoId: {
                    ...previous.draftSpecialtiesByPromoId,
                    [promoId]: nextList,
                },
            }
        })
    }

    const handleRemoveDraftSpecialty = (promoId: string, index: number) => {
        setMappingModal((previous) => {
            if (!previous) return previous
            const nextList = [...(previous.draftSpecialtiesByPromoId[promoId] || [])]
            const removed = nextList.splice(index, 1)[0]
            if (!removed) return previous

            const mapping = { ...previous.mapping }
            const removedKey = removed.id ?? removed.tempId
            if (removedKey) {
                Object.keys(mapping).forEach((key) => {
                    if (mapping[key] === removedKey) {
                        mapping[key] = null
                    }
                })
            }

            return {
                ...previous,
                mapping,
                draftSpecialtiesByPromoId: {
                    ...previous.draftSpecialtiesByPromoId,
                    [promoId]: nextList,
                },
            }
        })
    }

    const handleMappingConfirm = async () => {
        if (!mappingModal || mappingSaving) return
        setMappingSaving(true)
        setMappingError(null)

        try {
            const createdIdMap = await persistSpecialtyDrafts(mappingModal)
            const resolvedMapping: Record<string, string | null> = {}
            Object.entries(mappingModal.mapping).forEach(([key, value]) => {
                if (!value) {
                    resolvedMapping[key] = null
                    return
                }
                resolvedMapping[key] = createdIdMap[value] ?? value
            })

            const nextMappings = {
                ...fileMappings,
                [fileKey(mappingModal.file)]: {
                    confirmed: true,
                    mapping: resolvedMapping,
                },
            }
            setFileMappings(nextMappings)

            setMappingModal(null)
            await refreshCycles()
            await continueImportFlow(nextMappings)
        } catch (error) {
            setMappingError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'enregistrer les spÃ©cialitÃ©s.",
            )
        } finally {
            setMappingSaving(false)
        }
    }

    const handleMappingSkip = async () => {
        if (!mappingModal) return
        const nextMappings = {
            ...fileMappings,
            [fileKey(mappingModal.file)]: {
                confirmed: true,
                mapping: {},
            },
        }
        setFileMappings(nextMappings)
        setMappingModal(null)
        setMappingError(null)
        await continueImportFlow(nextMappings)
    }

    const handleMappingCancel = () => {
        setMappingModal(null)
        setMappingError(null)
    }

    const runImport = async (
        mappings: Record<string, FileSpecialtyMapping> = fileMappings,
    ) => {
        if (selectedFiles.length === 0) return

        setIsImporting(true)
        setImportFeedback({
            variant: 'info',
            message: `Import en cours sur ${selectedFiles.length} fichier(s)...`,
        })

        const totals = emptyImportCounters()
        const failedFiles: string[] = []
        let warningCount = 0
        let successCount = 0

        try {
            for (const file of selectedFiles) {
                const specialtyMappings = buildSpecialtyMappingsPayload(file, mappings)
                const response = await maquetteApi.import(file, {
                    cycleHint,
                    dryRun: false,
                    specialtyMappings,
                })

                if (!response.success || !response.data) {
                    failedFiles.push(file.name)
                    continue
                }

                successCount += 1
                totals.insertedMatieres += response.data.insertedMatieres
                totals.updatedMatieres += response.data.updatedMatieres
                totals.skippedMatieres += response.data.skippedMatieres
                totals.insertedExamEvents += response.data.insertedExamEvents ?? 0
                totals.skippedExamEvents += response.data.skippedExamEvents ?? 0
                warningCount += response.data.warnings?.length ?? 0
            }

            const variant: ImportFeedbackVariant =
                failedFiles.length === 0 ? 'success' : successCount > 0 ? 'info' : 'error'

            const failedSuffix =
                failedFiles.length > 0 ? ` Échec : ${failedFiles.join(', ')}.` : ''

            if (successCount > 0) {
                setHasImported(true)
            }

            setImportFeedback({
                variant,
                message:
                    `Import terminé (${successCount}/${selectedFiles.length} fichier(s)). ` +
                    `Matières : +${totals.insertedMatieres} / mises à jour ${totals.updatedMatieres} / ignorées ${totals.skippedMatieres}. ` +
                    `Examens : +${totals.insertedExamEvents} / ignorés ${totals.skippedExamEvents}. ` +
                    `Avertissements : ${warningCount}.` +
                    failedSuffix,
            })
        } catch (error) {
            console.error('[CycleCard] Erreur import maquette:', error)
            setImportFeedback({
                variant: 'error',
                message: "Erreur inattendue pendant l'import de la maquette.",
            })
        } finally {
            setIsImporting(false)
        }
    }

    const handleImportRequested = async () => {
        if (selectedFiles.length === 0 || isImporting) return

        const nextFile = findNextFileRequiringMapping()
        if (nextFile) {
            openMappingModalForFile(nextFile)
            return
        }

        await runImport()
    }

    const previewSpecialites = useMemo(() => {
        if (!previewData) return '-'

        const ueSpecialites = new Set<string>()

        previewData.matieres.forEach((matiere) => {
            const hasSpecialite = Boolean(matiere.specialiteCode || matiere.specialiteLabel)
            if (!hasSpecialite) return

            if (
                isCommunSpecialite(matiere.specialiteCode) ||
                isCommunSpecialite(matiere.specialiteLabel)
            ) {
                return
            }

            const ueName = matiere.ueNom?.trim()
            if (ueName) {
                ueSpecialites.add(ueName)
            }
        })

        const orderedUeSpecialites = Array.from(ueSpecialites).sort((left, right) =>
            left.localeCompare(right, 'fr', { numeric: true, sensitivity: 'base' }),
        )

        return orderedUeSpecialites.length > 0 ? orderedUeSpecialites.join(', ') : '-'
    }, [previewData])

    const sortedPreviewMatieres = useMemo(() => {
        if (!previewData) return []

        return [...previewData.matieres].sort((left, right) => {
            const byPromotion = (left.promotionCode || '').localeCompare(
                right.promotionCode || '',
                'fr',
                { numeric: true, sensitivity: 'base' },
            )
            if (byPromotion !== 0) return byPromotion

            const byUe = (left.ueNom || '').localeCompare(
                right.ueNom || '',
                'fr',
                { numeric: true, sensitivity: 'base' },
            )
            if (byUe !== 0) return byUe

            const leftSemestre = left.semestres?.length ? Math.min(...left.semestres) : Number.MAX_SAFE_INTEGER
            const rightSemestre = right.semestres?.length ? Math.min(...right.semestres) : Number.MAX_SAFE_INTEGER
            if (leftSemestre !== rightSemestre) return leftSemestre - rightSemestre

            return (left.matiereNom || '').localeCompare(
                right.matiereNom || '',
                'fr',
                { numeric: true, sensitivity: 'base' },
            )
        })
    }, [previewData])

    const previewPromotions = useMemo(() => {
        if (!previewData) return []

        return Array.from(
            new Set(
                previewData.matieres
                    .map((matiere) => (matiere.promotionCode || '').trim())
                    .filter((promotionCode) => promotionCode.length > 0),
            ),
        ).sort((left, right) => left.localeCompare(right, 'fr', { numeric: true, sensitivity: 'base' }))
    }, [previewData])

    useEffect(() => {
        if (previewPromotions.length === 0) {
            if (previewPromotionIndex !== 0) {
                setPreviewPromotionIndex(0)
            }
            return
        }

        if (previewPromotionIndex > previewPromotions.length - 1) {
            setPreviewPromotionIndex(previewPromotions.length - 1)
        }
    }, [previewPromotions, previewPromotionIndex])

    const activePreviewPromotion = previewPromotions[previewPromotionIndex] || null
    const previewMatieresToDisplay = useMemo(() => {
        if (!activePreviewPromotion) return sortedPreviewMatieres

        return sortedPreviewMatieres.filter(
            (matiere) => (matiere.promotionCode || '').trim() === activePreviewPromotion,
        )
    }, [activePreviewPromotion, sortedPreviewMatieres])

    const shouldShowSpecialiteColumn = useMemo(() => (
        previewMatieresToDisplay.some((matiere) => {
            const specialiteValue = (matiere.specialiteLabel || matiere.specialiteCode || '').trim()
            if (!specialiteValue) return false
            return !isCommunSpecialite(specialiteValue)
        })
    ), [previewMatieresToDisplay])

    const mappingPromoIds = useMemo(() => {
        if (!mappingModal) return []
        return Object.keys(mappingModal.draftSpecialtiesByPromoId)
    }, [mappingModal])

    const mappingHasInvalidNames = useMemo(() => {
        if (!mappingModal) return false
        return Object.values(mappingModal.draftSpecialtiesByPromoId).some((list) =>
            list.some((specialty) => !specialty.nom.trim() || specialty.effectifs <= 0),
        )
    }, [mappingModal])

    const mappingSelectionsByPromo = useMemo(() => {
        if (!mappingModal) return {} as Record<string, Set<string>>
        const used: Record<string, Set<string>> = {}

        mappingModal.detectedItems.forEach((item) => {
            if (!item.promotionId) return
            const selected = mappingModal.mapping[item.key]
            if (!selected) return
            if (!used[item.promotionId]) {
                used[item.promotionId] = new Set()
            }
            used[item.promotionId].add(selected)
        })

        return used
    }, [mappingModal])

    const getTotalEvaluations = (
        row: NonNullable<MaquetteAnalyzeResponse['matieres']>[number],
    ): number => row.evaluations?.length ?? 0

    const getTotalHours = (
        row: NonNullable<MaquetteAnalyzeResponse['matieres']>[number],
    ): number => {
        const hours = row.heures
        if (!hours) return 0
        const total = Number(hours.total)
        if (Number.isFinite(total) && total > 0) return total
        return HOURS_KEYS.reduce((sum, key) => sum + (Number(hours[key]) || 0), 0)
    }

    return (
        <section className="card cycle-card">
            <div className="cycle-head">
                <div className="cycle-name-wrapper">
                    <input
                        className="cycle-name"
                        value={cycleName}
                        onChange={(event) => {
                            const nextValue = event.target.value
                            setCycleName(nextValue)
                            updateRenameValidation(cycle.id, nextValue)
                        }}
                        onFocus={() => {
                            updateRenameValidation(cycle.id, cycleName)
                        }}
                        onBlur={() => {
                            void (async () => {
                                const success = await renameCycle(cycle.id, cycleName)
                                if (!success) {
                                    setCycleName(cycle.name)
                                    updateRenameValidation(cycle.id, cycle.name)
                                }
                            })()
                        }}
                    />
                    {renameError && (
                        <div className="cycle-name-error" role="alert">
                            {renameError}
                        </div>
                    )}
                </div>

                <div className="cycle-actions">
                    <button
                        className="btn-danger btn-icon-only"
                        onClick={() => removeCycle(cycle.id)}
                        aria-label="Supprimer le cycle"
                        title="Supprimer le cycle"
                    >
                        <img src={icTrash} alt="" aria-hidden="true"/>
                        <span className="btn-label">Supprimer le cycle</span>
                    </button>
                </div>
            </div>

            <div className="promotions">
                {cycle.promotions.length === 0 && (
                    <div className="empty">
                        Aucune promotion affichee pour ce cycle.
                    </div>
                )}

                {cycle.promotions.map((promo: Promotion) => (
                    <div key={promo.id} className="promo-row">
                        <div className="promo-main">
                            <span className="promo-label">{promo.label}</span>

                            {hasPromoMismatch(promo) && (
                                <span
                                    className="promo-row-warning"
                                    role="img"
                                    aria-label="Répartition d'étudiants incohérente"
                                >
                                    &#9888;
                                </span>
                            )}
                        </div>

                        <div className="promo-actions">
                            <button
                                className="btn-tertiary btn-icon-only"
                                onClick={() => openEditPromotion(cycle.id, promo.id)}
                                aria-label="Modifier la promotion"
                                title="Modifier la promotion"
                            >
                                <img src={icModif} alt="" aria-hidden="true" />
                                <span className="btn-label">Modifier</span>
                            </button>

                            <button
                                className="btn-danger btn-icon-only"
                                onClick={() => removePromotion(promo.id)}
                                aria-label="Supprimer la promotion"
                                title="Supprimer la promotion"
                            >
                                <img src={icTrash} alt="" aria-hidden="true" />
                                <span className="btn-label">Supprimer</span>
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className="btn-tertiary btn-add-promo btn-icon-responsive"
                    onClick={openAddPromoDialog}
                    aria-label="Ajouter une promotion"
                    title="Ajouter une promotion"
                >
                    <img src={icPlus} alt="" aria-hidden="true" />
                    <span className="btn-label">Ajouter une promotion</span>
                </button>

                <CycleImportDropzone
                    cycleId={cycle.id}
                    selectedFiles={selectedFiles}
                    isImporting={isImporting}
                    importFeedback={importFeedback}
                    hideImportButton={hasImported}
                    onIncomingFiles={handleIncomingFiles}
                    onRemoveFile={handleRemoveValidatedFile}
                    onImportRequested={handleImportRequested}
                />
            </div>

            <ConfirmDialog
                open={isAddPromoOpen}
                title="Ajouter une promotion"
                message={(
                    <div className="promo-edit-field">
                        <label className="promo-edit-label" htmlFor={`promo-name-${cycle.id}`}>
                            Nom de la promotion
                        </label>
                        <input
                            id={`promo-name-${cycle.id}`}
                            className="promo-edit-input"
                            value={promoName}
                            onChange={(event) => setPromoName(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    handleConfirmAddPromo()
                                }
                            }}
                            autoFocus
                        />
                    </div>
                )}
                confirmLabel="Ajouter"
                cancelLabel="Annuler"
                cardClassName="promo-add-dialog"
                onConfirm={handleConfirmAddPromo}
                onCancel={closeAddPromoDialog}
                onRequestClose={closeAddPromoDialog}
            />
            <MaquettePreviewDialog
                open={Boolean(previewFile)}
                title={cycle.name}
                previewFile={previewFile}
                previewLoading={previewLoading}
                previewError={previewError}
                previewData={previewData}
                previewSpecialites={previewSpecialites}
                isPreviewWarningsVisible={isPreviewWarningsVisible}
                onToggleWarnings={setIsPreviewWarningsVisible}
                previewPromotions={previewPromotions}
                previewPromotionIndex={previewPromotionIndex}
                onPrevPromotion={() =>
                    setPreviewPromotionIndex((current) => Math.max(0, current - 1))
                }
                onNextPromotion={() =>
                    setPreviewPromotionIndex((current) =>
                        Math.min(previewPromotions.length - 1, current + 1),
                    )
                }
                activePreviewPromotion={activePreviewPromotion}
                previewMatieresToDisplay={previewMatieresToDisplay}
                shouldShowSpecialiteColumn={shouldShowSpecialiteColumn}
                formatSemestresForDisplay={formatSemestresForDisplay}
                getTotalHours={getTotalHours}
                getTotalEvaluations={getTotalEvaluations}
                onConfirm={handleValidatePreview}
                onCancel={handleCancelPreview}
                confirmDisabled={previewLoading || !!previewError || !previewData}
            />
            <MaquetteSpecialtyMapDialog
                open={Boolean(mappingModal)}
                fileName={mappingModal?.file.name ?? null}
                mappingSaving={mappingSaving}
                mappingError={mappingError}
                detectedItems={mappingModal?.detectedItems ?? []}
                draftSpecialtiesByPromoId={mappingModal?.draftSpecialtiesByPromoId ?? {}}
                mappingSelectionsByPromo={mappingSelectionsByPromo}
                mapping={mappingModal?.mapping ?? {}}
                mappingPromoIds={mappingPromoIds}
                promotions={cycle.promotions}
                confirmDisabled={mappingHasInvalidNames}
                onSelectionChange={handleMappingSelectionChange}
                onAddDraftSpecialty={handleAddDraftSpecialty}
                onSpecialtyNameChange={handleSpecialtyNameChange}
                onSpecialtyEffectifsChange={handleSpecialtyEffectifsChange}
                onRemoveDraftSpecialty={handleRemoveDraftSpecialty}
                onConfirm={handleMappingConfirm}
                onSkip={handleMappingSkip}
                onCancel={handleMappingCancel}
            />
        </section>
    )
}

export default CycleCard





