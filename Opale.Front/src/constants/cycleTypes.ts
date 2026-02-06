/**
 * Cycle types constants based on the PostgreSQL enum type_cycle
 * These correspond to the database enum values: 'Initial', 'Apprentissage'
 */
export const CYCLE_TYPES = ['Initial', 'Apprentissage'] as const

export type CycleType = typeof CYCLE_TYPES[number]

/**
 * Helper function to check if a string is a valid cycle type
 */
export const isValidCycleType = (value: string): value is CycleType => {
  return CYCLE_TYPES.includes(value as CycleType)
}

/**
 * Get the display name for a cycle type
 */
export const getCycleTypeDisplayName = (type: CycleType): string => {
  switch (type) {
    case 'Initial':
      return 'Formation Initiale'
    case 'Apprentissage':
      return 'Formation en Apprentissage'
    default:
      return type
  }
}
