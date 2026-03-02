import { useMemo, useState } from 'react'
import { Room } from '../../models/Room'
import {
    AvailabilityFilter,
    CapacityOperator,
    DEFAULT_ROOMS_FILTERS,
    RoomTypeFilter,
    RoomsFilters,
} from '../../models/RoomFilters'

const getRoomNumber = (roomName: string): number => {
    const match = roomName.match(/\d+/)
    return match ? Number.parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER
}

const sortRoomsByCode = (a: Room, b: Room): number => {
    const aNumber = getRoomNumber(a.name)
    const bNumber = getRoomNumber(b.name)

    if (aNumber !== bNumber) {
        return aNumber - bNumber
    }

    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base', numeric: true })
}

export const useRoomsFilters = (rooms: Room[]) => {
    const [searchValue, setSearchValue] = useState(DEFAULT_ROOMS_FILTERS.searchValue)
    const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>(DEFAULT_ROOMS_FILTERS.typeFilter)
    const [capacityOperator, setCapacityOperator] = useState<CapacityOperator>(DEFAULT_ROOMS_FILTERS.capacityOperator)
    const [capacityValue, setCapacityValue] = useState(DEFAULT_ROOMS_FILTERS.capacityValue)
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>(DEFAULT_ROOMS_FILTERS.availabilityFilter)

    const filters: RoomsFilters = {
        searchValue,
        typeFilter,
        capacityOperator,
        capacityValue,
        availabilityFilter,
    }

    const filteredRooms = useMemo(() => {
        let items = [...rooms]

        if (searchValue.trim()) {
            const query = searchValue.trim().toLowerCase()
            items = items.filter((room) => {
                const displayName = (room.fullName || '').toLowerCase()
                return room.name.toLowerCase().includes(query) || displayName.includes(query)
            })
        }

        if (typeFilter !== 'ALL') {
            items = items.filter((room) => room.types.includes(typeFilter))
        }

        const parsedCapacity = Number.parseInt(capacityValue, 10)
        const hasCapacityFilter = capacityOperator !== 'ALL' && !Number.isNaN(parsedCapacity)
        if (hasCapacityFilter) {
            items = items.filter((room) => {
                if (capacityOperator === 'GT') return room.capacity > parsedCapacity
                if (capacityOperator === 'LT') return room.capacity < parsedCapacity
                return room.capacity === parsedCapacity
            })
        }

        if (availabilityFilter === 'AVAILABLE') {
            items = items.filter((room) => room.isAvailable)
        } else if (availabilityFilter === 'UNAVAILABLE') {
            items = items.filter((room) => !room.isAvailable)
        }

        return items
    }, [
        rooms,
        searchValue,
        typeFilter,
        capacityOperator,
        capacityValue,
        availabilityFilter,
    ])

    const visibleRoomIds = useMemo(
        () => filteredRooms.map((room) => room.id),
        [filteredRooms],
    )

    const roomsByFloor = useMemo(() => {
        const map: Record<number, Room[]> = {}
        for (const room of filteredRooms) {
            if (!map[room.floor]) {
                map[room.floor] = []
            }
            map[room.floor].push(room)
        }

        Object.keys(map).forEach((floor) => {
            map[Number(floor)].sort(sortRoomsByCode)
        })

        return map
    }, [filteredRooms])

    const handleSearchChange = (value: string) => {
        console.log('[ROOMS] Filter by name (mock)', { value })
        setSearchValue(value)
    }

    const handleTypeFilterChange = (value: RoomTypeFilter) => {
        console.log('[ROOMS] Filter by type (mock)', { value })
        setTypeFilter(value)
    }

    const handleCapacityOperatorChange = (value: CapacityOperator) => {
        console.log('[ROOMS] Filter by capacity operator (mock)', { value })
        setCapacityOperator(value)
    }

    const handleCapacityValueChange = (value: string) => {
        console.log('[ROOMS] Filter by capacity value (mock)', { value })
        setCapacityValue(value)
    }

    const handleAvailabilityFilterChange = (value: AvailabilityFilter) => {
        console.log('[ROOMS] Filter by availability (mock)', { value })
        setAvailabilityFilter(value)
    }

    const resetFilters = () => {
        console.log('[ROOMS] Reset filters (mock)')
        setSearchValue(DEFAULT_ROOMS_FILTERS.searchValue)
        setTypeFilter(DEFAULT_ROOMS_FILTERS.typeFilter)
        setCapacityOperator(DEFAULT_ROOMS_FILTERS.capacityOperator)
        setCapacityValue(DEFAULT_ROOMS_FILTERS.capacityValue)
        setAvailabilityFilter(DEFAULT_ROOMS_FILTERS.availabilityFilter)
    }

    return {
        filters,
        filteredRooms,
        visibleRoomIds,
        roomsByFloor,
        handleSearchChange,
        handleTypeFilterChange,
        handleCapacityOperatorChange,
        handleCapacityValueChange,
        handleAvailabilityFilterChange,
        resetFilters,
    }
}

