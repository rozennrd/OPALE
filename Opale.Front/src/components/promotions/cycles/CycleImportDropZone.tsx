import React, { useRef, useState } from 'react'

type ImportFeedbackVariant = 'success' | 'error' | 'info'

interface CycleImportDropzoneProps {
    cycleId: string
    selectedFiles: File[]
    onIncomingFiles?: (files: File[]) => void
    onRemoveFile?: (file: File) => void
    onImportRequested?: () => void | Promise<void>
    isImporting?: boolean
    hideImportButton?: boolean
    importFeedback?: {
        variant: ImportFeedbackVariant
        message: string
    } | null
}

const CycleImportDropzone: React.FC<CycleImportDropzoneProps> = ({
                                                                     selectedFiles,
                                                                     onIncomingFiles,
                                                                     onRemoveFile,
                                                                     onImportRequested,
                                                                     isImporting = false,
                                                                     hideImportButton = false,
                                                                     importFeedback = null,
                                                                 }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const openFileDialog = () => {
        inputRef.current?.click()
    }

    const filterExcelFiles = (files: File[]): File[] => {
        return files.filter((file) => {
            const name = file.name.toLowerCase()
            const type = file.type

            return (
                name.endsWith('.xls') ||
                name.endsWith('.xlsx') ||
                name.endsWith('.xlsm') ||
                type === 'application/vnd.ms-excel' ||
                type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        })
    }

    const handleFiles = (files: File[]) => {
        const excelFiles = filterExcelFiles(files)
        if (excelFiles.length === 0) {
            console.warn(
                '[CycleImportDropzone] Aucun fichier Excel détecté dans la sélection',
                files,
            )
            return
        }

        if (onIncomingFiles) {
            onIncomingFiles(excelFiles)
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (!fileList) return

        handleFiles(Array.from(fileList))
        event.target.value = ''
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)

        const fileList = event.dataTransfer.files
        if (!fileList || fileList.length === 0) return

        handleFiles(Array.from(fileList))
    }

    const handleImportClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        if (!onImportRequested || selectedFiles.length === 0 || isImporting) return
        await onImportRequested()
    }

    const visibleFiles = selectedFiles.slice(0, 5)
    const extraCount =
        selectedFiles.length > 5 ? selectedFiles.length - visibleFiles.length : 0

    return (
        <>
            <div
                className={
                    'cycle-import-dropzone' +
                    (isDragging ? ' cycle-import-dropzone--dragging' : '')
                }
                onClick={openFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span className="cycle-import-dropzone-title">
                    Importer des promotions depuis Excel
                </span>
                <span className="cycle-import-dropzone-hint">
                    Glissez-déposez vos fichiers Excel ici ou cliquez pour parcourir
                    (plusieurs fichiers possibles)
                </span>

                {selectedFiles.length > 0 && (
                    <div className="cycle-import-dropzone-files">
                        <span className="cycle-import-dropzone-files-label">
                            Fichiers valides :
                        </span>

                        <div className="cycle-import-files-list">
                            {visibleFiles.map((file) => (
                                <div
                                    className="cycle-import-file-pill"
                                    key={`${file.name}-${file.size}-${file.lastModified}`}
                                >
                                    <span className="file-icon" aria-hidden="true">
                                        [XLS]
                                    </span>
                                    <span className="file-name">{file.name}</span>
                                    <button
                                        type="button"
                                        className="file-remove-btn"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            if (onRemoveFile) onRemoveFile(file)
                                        }}
                                        aria-label={`Supprimer le fichier ${file.name}`}
                                        title={`Supprimer le fichier ${file.name}`}
                                        disabled={isImporting}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}

                            {extraCount > 0 && (
                                <div className="cycle-import-file-pill extra-count">
                                    + {extraCount} fichier(s) supplémentaire(s)...
                                </div>
                            )}
                        </div>

                        {!hideImportButton && (
                            <div className="cycle-import-dropzone-actions">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleImportClick}
                                    disabled={isImporting || selectedFiles.length === 0}
                                >
                                    {isImporting ? 'Import en cours...' : 'Importer la maquette'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {importFeedback && (
                    <div className={`cycle-import-dropzone-status is-${importFeedback.variant}`}>
                        {importFeedback.message}
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />
        </>
    )
}

export default CycleImportDropzone
