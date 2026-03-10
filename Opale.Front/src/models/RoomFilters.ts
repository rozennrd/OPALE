import { RoomType } from './Room'

export type RoomTypeFilter = 'ALL' | RoomType
export type CapacityOperator = 'ALL' | 'GT' | 'LT' | 'EQ'
export type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE'

export interface RoomsFilters {
    searchValue: string
    typeFilter: RoomTypeFilter
    capacityOperator: CapacityOperator
    capacityValue: string
    availabilityFilter: AvailabilityFilter
}

export const DEFAULT_ROOMS_FILTERS: RoomsFilters = {
    searchValue: '',
    typeFilter: 'ALL',
    capacityOperator: 'ALL',
    capacityValue: '',
    availabilityFilter: 'ALL',
}

