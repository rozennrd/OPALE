import { useMemo } from 'react'

type FilterPrimitive = string | number | boolean | null | undefined

type FiltersRecord = Record<string, FilterPrimitive>

interface UseToolbarFiltersOptions<T extends FiltersRecord> {
    values: T
    defaults: T
    onReset: () => void
}

export const useToolbarFilters = <T extends FiltersRecord>({
    values,
    defaults,
    onReset,
}: UseToolbarFiltersOptions<T>) => {
    const hasActiveFilters = useMemo(() => (
        Object.keys(defaults).some((key) => {
            const typedKey = key as keyof T
            return !Object.is(values[typedKey], defaults[typedKey])
        })
    ), [values, defaults])

    return {
        hasActiveFilters,
        resetFilters: onReset,
    }
}

