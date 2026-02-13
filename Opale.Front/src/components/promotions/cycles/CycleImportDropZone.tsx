// src/components/promotions/cycles/CycleImportDropZone.tsx
import React, { useRef, useState } from 'react'

interface CycleImportDropzoneProps {
    cycleId: string
    // on enverra maintenant la LISTE COMPLÈTE des fichiers sélectionnés
    onFilesSelected?: (files: File[]) => void
}

const CycleImportDropzone: React.FC<CycleImportDropzoneProps> = ({
                                                                     cycleId,
                                                                     onFilesSelected,
                                                                 }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const openFileDialog = () => {
        inputRef.current?.click()
    }

    const mergeFiles = (current: File[], incoming: File[]): File[] => {
        // On ajoute les nouveaux fichiers à ceux déjà présents
        const all = [...current, ...incoming]

        // Petite déduplication par nom + taille (simple mais suffisant ici)
        const seen = new Set<string>()
        return all.filter((file) => {
            const key = `${file.name}-${file.size}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    }

    const handleFiles = (files: File[]) => {
        const excelFiles = files.filter((file) => {
            const name = file.name.toLowerCase()
            const type = file.type

            return (
                name.endsWith('.xls') ||
                name.endsWith('.xlsx') ||
                name.endsWith('.xlsm') ||
                type === 'application/vnd.ms-excel' ||
                type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        })

        if (excelFiles.length === 0) {
            console.warn(
                '[CycleImportDropzone] Aucun fichier Excel détecté dans la sélection',
                files,
            )
            return
        }

        setSelectedFiles((prev) => {
            const next = mergeFiles(prev, excelFiles)

            console.log(
                '[CycleImportDropzone] Fichiers Excel sélectionnés pour le cycle',
                cycleId,
                next,
            )

            if (onFilesSelected) {
                onFilesSelected(next) // on envoie la liste complète à chaque fois
            }

            return next
        })
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

    const handleRemoveFile = (fileToRemove: File) => {
        setSelectedFiles((prev) => {
            const next = prev.filter(
                (f) =>
                    !(
                        f.name === fileToRemove.name &&
                        f.size === fileToRemove.size &&
                        f.lastModified === fileToRemove.lastModified
                    ),
            )

            if (onFilesSelected) {
                onFilesSelected(next)
            }

            return next
        })
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
              Fichiers sélectionnés :
            </span>

                        <div className="cycle-import-files-list">
                            {visibleFiles.map((file) => (
                                <div
                                    className="cycle-import-file-pill"
                                    key={`${file.name}-${file.size}-${file.lastModified}`}
                                >
                  <span className="file-icon" aria-hidden="true">
                    📄
                  </span>
                                    <span className="file-name">{file.name}</span>
                                    <button
                                        type="button"
                                        className="file-remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveFile(file)
                                        }}
                                        aria-label={`Supprimer le fichier ${file.name}`}
                                        title={`Supprimer le fichier ${file.name}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {extraCount > 0 && (
                                <div className="cycle-import-file-pill extra-count">
                                    + {extraCount} fichier(s) supplémentaire(s)…
                                </div>
                            )}
                        </div>
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