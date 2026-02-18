import React, { useState } from 'react'
import icTrash from '../../../assets/ic-trash.png'
import icWarning from '../../../assets/ic-warning.png'
import icModif from '../../../assets/ic-modif.png'
import icPlus from '../../../assets/ic-plus.png'
import { hasPromoMismatch } from '../../../utils/promoUtils'
import { Cycle } from '../../../models'
import CycleImportDropzone from './CycleImportDropZone'
import ConfirmDialog from '../../common/ConfirmDialog'
import { maquetteApi, MaquetteImportResponse } from '../../../services/api/maquetteApi'

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
    const [isImporting, setIsImporting] = useState(false)
    const [importFeedback, setImportFeedback] = useState<{
        variant: ImportFeedbackVariant
        message: string
    } | null>(null)

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

    const handleImportRequested = async (files: File[]) => {
        if (files.length === 0) return

        setIsImporting(true)
        setImportFeedback({
            variant: 'info',
            message: `Import en cours sur ${files.length} fichier(s)...`,
        })

        const cycleHint = inferCycleHint(cycle)
        const totals = emptyImportCounters()
        const failedFiles: string[] = []
        let warningCount = 0
        let successCount = 0

        try {
            for (const file of files) {
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
                failedFiles.length > 0 ? ` Echec: ${failedFiles.join(', ')}.` : ''

            setImportFeedback({
                variant,
                message:
                    `Import termine (${successCount}/${files.length} fichier(s)). ` +
                    `Matieres: +${totals.insertedMatieres} / maj ${totals.updatedMatieres} / skip ${totals.skippedMatieres}. ` +
                    `Examens: +${totals.insertedExamEvents} / skip ${totals.skippedExamEvents}. ` +
                    `Warnings: ${warningCount}.` +
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
                        <img src={icTrash} alt="" aria-hidden="true" />
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

                {cycle.promotions.map((promo) => (
                    <div key={promo.id} className="promo-row">
                        <div className="promo-main">
                            <span className="promo-label">{promo.label}</span>

                            {hasPromoMismatch(promo) && (
                                <img
                                    src={icWarning}
                                    alt="Repartition d'etudiants incoherente"
                                    className="promo-warning"
                                />
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
                    isImporting={isImporting}
                    importFeedback={importFeedback}
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
        </section>
    )
}

export default CycleCard
