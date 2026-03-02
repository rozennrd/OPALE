import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import icTrash from '../../../assets/ic-trash.png'
import icWarning from '../../../assets/ic-warning.png'
import icModif from '../../../assets/ic-modif.png'
import icPlus from '../../../assets/ic-plus.png'
import { hasPromoMismatch } from '../../../utils/promoUtils'
import { Cycle } from '../../../models'
import CycleImportDropzone from './CycleImportDropZone'
import ConfirmDialog from '../../common/ConfirmDialog'
import {
    maquetteApi,
    MaquetteAnalyzeResponse,
    MaquetteImportResponse,
} from '../../../services/api/maquetteApi'
import { Promotion } from "../../../models"


interface CycleCardProps {
    cycle: Cycle
    renameCycle: (cycleId: string, name: string) => void
    removeCycle: (cycleId: string) => void
    openEditPromotion: (cycleId: string, promoId: string) => void
    removePromotion: (promoId: string) => void
    addPromotion: (cycleId: string, label: string) => void
}

type ImportFeedbackVariant = 'success' | 'error' | 'info'

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

const EVALUATION_COLUMNS: Array<{
    type: 'INTERMEDIAIRE' | 'FINALE' | 'CONTROLE_CONTINU' | 'TRAVAUX_PRATIQUES' | 'PROJET' | 'AUTRE'
    label: string
}> = [
    { type: 'INTERMEDIAIRE', label: 'Interm.' },
    { type: 'FINALE', label: 'Finale' },
    { type: 'CONTROLE_CONTINU', label: 'CC' },
    { type: 'TRAVAUX_PRATIQUES', label: 'TP' },
    { type: 'PROJET', label: 'Projet' },
    { type: 'AUTRE', label: 'Autre' },
]

const CycleCard: React.FC<CycleCardProps> = ({
                                                 cycle,
                                                 renameCycle,
                                                 removeCycle,
                                                 openEditPromotion,
                                                 removePromotion,
                                                 addPromotion,
                                             }) => {
    const [cycleName, setCycleName] = useState(cycle.name)
    const [isAddPromoOpen, setIsAddPromoOpen] = useState(false)
    const [promoName, setPromoName] = useState('')

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewQueue, setPreviewQueue] = useState<File[]>([])
    const [previewFile, setPreviewFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<MaquetteAnalyzeResponse | null>(null)
    const [previewError, setPreviewError] = useState<string | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewPromotionIndex, setPreviewPromotionIndex] = useState(0)
    const [isPreviewWarningsVisible, setIsPreviewWarningsVisible] = useState(true)

    const [isImporting, setIsImporting] = useState(false)
    const [importFeedback, setImportFeedback] = useState<{
        variant: ImportFeedbackVariant
        message: string
    } | null>(null)

    const previewRequestIdRef = useRef(0)

    const cycleHint = useMemo(() => inferCycleHint(cycle), [cycle])

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
        setSelectedFiles((previous) =>
            previous.filter((file) => fileKey(file) !== fileKey(fileToRemove)),
        )
    }

    const handleValidatePreview = () => {
        if (!previewFile || !previewData) return

        setSelectedFiles((previous) => {
            const existing = new Set(previous.map(fileKey))
            if (existing.has(fileKey(previewFile))) return previous
            return [...previous, previewFile]
        })

        closePreview()
    }

    const handleCancelPreview = () => {
        closePreview()
    }

    const handleImportRequested = async () => {
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
                const response = await maquetteApi.import(file, {
                    cycleHint,
                    dryRun: false,
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

    const getEvaluationCountByType = (
        row: NonNullable<MaquetteAnalyzeResponse['matieres']>[number],
        type: 'INTERMEDIAIRE' | 'FINALE' | 'CONTROLE_CONTINU' | 'TRAVAUX_PRATIQUES' | 'PROJET' | 'AUTRE',
    ): number => {
        if (!row.evaluations || row.evaluations.length === 0) return 0
        return row.evaluations.filter((evaluation) => evaluation.type === type).length
    }

    return (
        <section className="card cycle-card">
            <div className="cycle-head">
                <input
                    className="cycle-name"
                    value={cycleName}
                    onChange={(event) => setCycleName(event.target.value)}
                    onBlur={() => renameCycle(cycle.id, cycleName)}
                />

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

            <ConfirmDialog
                open={Boolean(previewFile)}
                title={cycle.name}
                message={(
                    <div className="maquette-preview-content">
                        {previewFile && (
                            <div className="maquette-preview-filename">
                                Fichier: <strong>{previewFile.name}</strong>
                            </div>
                        )}

                        {previewLoading && (
                            <div className="maquette-preview-loading">
                                Analyse de la maquette en cours...
                            </div>
                        )}

                        {!previewLoading && previewError && (
                            <div className="maquette-preview-error">
                                {previewError}
                            </div>
                        )}

                        {!previewLoading && !previewError && previewData && (
                            <>
                                <table className="maquette-preview-summary-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="maquette-preview-summary-col">
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Année scolaire</span>
                                                        <strong>{previewData.metadata.anneeScolaire || '-'}</strong>
                                                    </div>
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Cycle détecté</span>
                                                        <strong>{previewData.metadata.cycleCode || '-'}</strong>
                                                    </div>
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Promotions détectées</span>
                                                        <strong>{previewData.metadata.promotions.join(', ') || '-'}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="maquette-preview-summary-col">
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Spécialités détectées</span>
                                                        <strong>{previewSpecialites}</strong>
                                                    </div>
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Nombre de matières extraites</span>
                                                        <strong>{previewData.matieres.length}</strong>
                                                    </div>
                                                    <div className="maquette-preview-summary-item">
                                                        <span>Nombre d&apos;avertissements</span>
                                                        <strong>{previewData.warnings.length}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="maquette-preview-summary-fullrow">
                                                <span>Feuilles détectées</span>
                                                <strong>{previewData.metadata.feuilles.join(', ') || '-'}</strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {previewData.warnings.length > 0 && (
                                    isPreviewWarningsVisible ? (
                                        <div className="maquette-preview-warning-list">
                                            <div className="maquette-preview-warning-head">
                                                <strong>Avertissements</strong>
                                                <button
                                                    type="button"
                                                    className="maquette-preview-warning-close"
                                                    onClick={() => setIsPreviewWarningsVisible(false)}
                                                    aria-label="Fermer les avertissements"
                                                    title="Fermer"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <ul>
                                                {previewData.warnings.slice(0, 5).map((warning, index) => (
                                                    <li key={`${warning}-${index}`}>{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="maquette-preview-warning-reopen btn-tertiary"
                                            onClick={() => setIsPreviewWarningsVisible(true)}
                                        >
                                            Afficher les avertissements
                                        </button>
                                    )
                                )}

                                <div className="maquette-preview-promo-nav">
                                    <button
                                        type="button"
                                        className="btn-tertiary maquette-preview-promo-nav-btn"
                                        onClick={() => setPreviewPromotionIndex((current) => Math.max(0, current - 1))}
                                        disabled={previewPromotions.length <= 1 || previewPromotionIndex === 0}
                                    >
                                        Promotion précédente
                                    </button>
                                    <div className="maquette-preview-promo-nav-label">
                                        <span>Promotion affichée</span>
                                        <strong>
                                            {activePreviewPromotion || '-'} (
                                            {previewPromotions.length > 0 ? previewPromotionIndex + 1 : 0}/
                                            {previewPromotions.length})
                                        </strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-tertiary maquette-preview-promo-nav-btn"
                                        onClick={() =>
                                            setPreviewPromotionIndex((current) =>
                                                Math.min(previewPromotions.length - 1, current + 1),
                                            )
                                        }
                                        disabled={
                                            previewPromotions.length <= 1 ||
                                            previewPromotionIndex >= previewPromotions.length - 1
                                        }
                                    >
                                        Promotion suivante
                                    </button>
                                </div>

                                <div className="maquette-preview-grid-wrapper">
                                    <table className="maquette-preview-grid">
                                        <thead>
                                            <tr>
                                                <th rowSpan={2}>Promo</th>
                                                <th rowSpan={2}>UE</th>
                                                <th rowSpan={2}>Matière</th>
                                                <th rowSpan={2}>Semestres</th>
                                                {shouldShowSpecialiteColumn && (
                                                    <th rowSpan={2}>Spécialité</th>
                                                )}
                                                <th
                                                    colSpan={EVALUATION_COLUMNS.length}
                                                    className="maquette-preview-grid-group"
                                                >
                                                    Épreuves
                                                </th>
                                            </tr>
                                            <tr>
                                                {EVALUATION_COLUMNS.map((column) => (
                                                    <th
                                                        key={column.type}
                                                        className={`evaluation-col evaluation-col--${column.type.toLowerCase()}`}
                                                    >
                                                        {column.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewMatieresToDisplay.map((matiere, index) => (
                                                <tr key={`${matiere.promotionCode}-${matiere.matiereNom}-${index}`}>
                                                    <td>{matiere.promotionCode || '-'}</td>
                                                    <td>{matiere.ueNom || '-'}</td>
                                                    <td>{matiere.matiereNom || '-'}</td>
                                                    <td>
                                                        {matiere.semestres?.length
                                                            ? [...matiere.semestres].sort((left, right) => left - right).join(', ')
                                                            : '-'}
                                                    </td>
                                                    {shouldShowSpecialiteColumn && (
                                                        <td>{matiere.specialiteLabel || matiere.specialiteCode || '-'}</td>
                                                    )}
                                                    {EVALUATION_COLUMNS.map((column) => (
                                                        <td
                                                            key={`${matiere.matiereNom}-${column.type}-${index}`}
                                                            className={`evaluation-col evaluation-col--${column.type.toLowerCase()}`}
                                                        >
                                                            {getEvaluationCountByType(matiere, column.type)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
                confirmLabel="Valider"
                cancelLabel="Annuler"
                cardClassName="maquette-preview-dialog"
                onConfirm={handleValidatePreview}
                onCancel={handleCancelPreview}
                onRequestClose={handleCancelPreview}
                confirmDisabled={previewLoading || !!previewError || !previewData}
            />
        </section>
    )
}

export default CycleCard

