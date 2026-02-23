import { useCallback, useMemo, useState } from 'react'

interface UseSelectionStateOptions {
    onEnterSelectionMode?: () => void
    onExitSelectionMode?: () => void
}

export const useSelectionState = ({
    onEnterSelectionMode,
    onExitSelectionMode,
}: UseSelectionStateOptions = {}) => {
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const selectedIdsSet = useMemo(
        () => new Set(selectedIds),
        [selectedIds],
    )

    const toggleSelectionMode = useCallback(() => {
        if (!selectionMode) {
            onEnterSelectionMode?.()
        } else {
            onExitSelectionMode?.()
        }

        setSelectionMode((prev) => !prev)
        setSelectedIds([])
    }, [selectionMode, onEnterSelectionMode, onExitSelectionMode])

    const toggleSelection = useCallback((id: string) => {
        if (!selectionMode) return

        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((value) => value !== id)
            }
            return [...prev, id]
        })
    }, [selectionMode])

    const selectAll = useCallback((ids: string[]) => {
        setSelectedIds(Array.from(new Set(ids)))
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedIds([])
    }, [])

    const disableSelectionMode = useCallback(() => {
        onExitSelectionMode?.()
        setSelectionMode(false)
        setSelectedIds([])
    }, [onExitSelectionMode])

    const pruneSelection = useCallback((idsToRemove: string[]) => {
        const idsSet = new Set(idsToRemove)
        setSelectedIds((prev) => prev.filter((id) => !idsSet.has(id)))
    }, [])

    return {
        selectionMode,
        selectedIds,
        selectedIdsSet,
        selectedCount: selectedIds.length,
        toggleSelectionMode,
        toggleSelection,
        selectAll,
        clearSelection,
        disableSelectionMode,
        pruneSelection,
    }
}
