import React from 'react'
import ConfirmDialog from '../../common/ConfirmDialog'
import { MaquetteAnalyzeResponse } from '../../../services/api/maquetteApi'

type MaquetteAnalyzeMatiere = NonNullable<MaquetteAnalyzeResponse['matieres']>[number]

interface MaquettePreviewDialogProps {
    open: boolean
    title: string
    previewFile: File | null
    previewLoading: boolean
    previewError: string | null
    previewData: MaquetteAnalyzeResponse | null
    previewSpecialites: string
    isPreviewWarningsVisible: boolean
    onToggleWarnings: (visible: boolean) => void
    previewPromotions: string[]
    previewPromotionIndex: number
    onPrevPromotion: () => void
    onNextPromotion: () => void
    activePreviewPromotion: string | null
    previewMatieresToDisplay: MaquetteAnalyzeMatiere[]
    shouldShowSpecialiteColumn: boolean
    formatSemestresForDisplay: (semestres: number[], promotionCode?: string | null) => string
    getTotalHours: (row: MaquetteAnalyzeMatiere) => number
    getTotalEvaluations: (row: MaquetteAnalyzeMatiere) => number
    onConfirm: () => void
    onCancel: () => void
    confirmDisabled: boolean
}

const MaquettePreviewDialog: React.FC<MaquettePreviewDialogProps> = ({
    open,
    title,
    previewFile,
    previewLoading,
    previewError,
    previewData,
    previewSpecialites,
    isPreviewWarningsVisible,
    onToggleWarnings,
    previewPromotions,
    previewPromotionIndex,
    onPrevPromotion,
    onNextPromotion,
    activePreviewPromotion,
    previewMatieresToDisplay,
    shouldShowSpecialiteColumn,
    formatSemestresForDisplay,
    getTotalHours,
    getTotalEvaluations,
    onConfirm,
    onCancel,
    confirmDisabled,
}) => (
    <ConfirmDialog
        open={open}
        title={title}
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
                                                <span>AnnÃ©e scolaire</span>
                                                <strong>{previewData.metadata.anneeScolaire || '-'}</strong>
                                            </div>
                                            <div className="maquette-preview-summary-item">
                                                <span>Cycle dÃ©tectÃ©</span>
                                                <strong>{previewData.metadata.cycleCode || '-'}</strong>
                                            </div>
                                            <div className="maquette-preview-summary-item">
                                                <span>Promotions dÃ©tectÃ©es</span>
                                                <strong>{previewData.metadata.promotions.join(', ') || '-'}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="maquette-preview-summary-col">
                                            <div className="maquette-preview-summary-item">
                                                <span>SpÃ©cialitÃ©s dÃ©tectÃ©es</span>
                                                <strong>{previewSpecialites}</strong>
                                            </div>
                                            <div className="maquette-preview-summary-item">
                                                <span>Nombre de matiÃ¨res extraites</span>
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
                                        <span>Feuilles dÃ©tectÃ©es</span>
                                        {' : '}
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
                                            onClick={() => onToggleWarnings(false)}
                                            aria-label="Fermer les avertissements"
                                            title="Fermer"
                                        >
                                            Ã—
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
                                    onClick={() => onToggleWarnings(true)}
                                >
                                    Afficher les avertissements
                                </button>
                            )
                        )}

                        <div className="maquette-preview-promo-nav">
                            <button
                                type="button"
                                className="btn-tertiary maquette-preview-promo-nav-btn"
                                onClick={onPrevPromotion}
                                disabled={previewPromotions.length <= 1 || previewPromotionIndex === 0}
                            >
                                Promotion prÃ©cÃ©dente
                            </button>
                            <div className="maquette-preview-promo-nav-label">
                                <span>Promotion affichÃ©e</span>
                                <strong>
                                    {activePreviewPromotion || '-'} (
                                    {previewPromotions.length > 0 ? previewPromotionIndex + 1 : 0}/
                                    {previewPromotions.length})
                                </strong>
                            </div>
                            <button
                                type="button"
                                className="btn-tertiary maquette-preview-promo-nav-btn"
                                onClick={onNextPromotion}
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
                                        <th>Promo</th>
                                        <th>UE</th>
                                        <th>MatiÃ¨re</th>
                                        <th className="maquette-preview-grid-center">Semestres</th>
                                        {shouldShowSpecialiteColumn && (
                                            <th>SpÃ©cialitÃ©</th>
                                        )}
                                        <th className="maquette-preview-grid-center">Total heures</th>
                                        <th className="maquette-preview-grid-center">Total Ã©preuves</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewMatieresToDisplay.map((matiere, index) => (
                                        <tr key={`${matiere.promotionCode}-${matiere.matiereNom}-${index}`}>
                                            <td>{matiere.promotionCode || '-'}</td>
                                            <td>{matiere.ueNom || '-'}</td>
                                            <td>{matiere.matiereNom || '-'}</td>
                                            <td className="maquette-preview-grid-center">
                                                {formatSemestresForDisplay(
                                                    matiere.semestres ?? [],
                                                    matiere.promotionCode,
                                                )}
                                            </td>
                                            {shouldShowSpecialiteColumn && (
                                                <td>{matiere.specialiteLabel || matiere.specialiteCode || '-'}</td>
                                            )}
                                            <td className="maquette-preview-grid-center">
                                                {getTotalHours(matiere)}
                                            </td>
                                            <td className="maquette-preview-grid-center">
                                                {getTotalEvaluations(matiere)}
                                            </td>
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
        onConfirm={onConfirm}
        onCancel={onCancel}
        onRequestClose={onCancel}
        confirmDisabled={confirmDisabled}
    />
)

export default MaquettePreviewDialog
