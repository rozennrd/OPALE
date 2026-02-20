// src/pages/Rooms.tsx
import React, { useMemo, useState } from 'react'
import { Room } from '../models/Room'
import { ROOMS_MOCK } from '../mocks/rooms.mock'
import RoomsSection from '../components/rooms/RoomsSection'
import RoomDetailCard from '../components/rooms/RoomDetailCard'
import PageHeader from '../components/common/PageHeader'
import SelectionToolbar from '../components/common/SelectionToolbar'
import RoomsToolbar, {
    AvailabilityFilter,
    CapacityOperator,
    RoomTypeFilter,
} from '../components/rooms/RoomsToolbar'

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

export default function Rooms() {
    const [rooms, setRooms] = useState<Room[]>(() => [...ROOMS_MOCK])
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [pendingNewRoomId, setPendingNewRoomId] = useState<string | null>(null)

    const [searchValue, setSearchValue] = useState('')
    const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>('ALL')
    const [capacityOperator, setCapacityOperator] = useState<CapacityOperator>('ALL')
    const [capacityValue, setCapacityValue] = useState('')
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL')

    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])

    const selectedRoomIdsSet = useMemo(
        () => new Set(selectedRoomIds),
        [selectedRoomIds],
    )

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
        const map: Record<number, Room[]> = { 0: [], 1: [], 2: [] }
        for (const room of filteredRooms) {
            if (!map[room.floor]) {
                map[room.floor] = []
            }
            map[room.floor].push(room)
        }
        map[0].sort(sortRoomsByCode)
        map[1].sort(sortRoomsByCode)
        map[2].sort(sortRoomsByCode)
        return map
    }, [filteredRooms])

    const removeRoomsByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        console.log('[ROOMS] Delete rooms (mock)', { ids: Array.from(idsSet) })

        setRooms((prev) => prev.filter((room) => !idsSet.has(room.id)))
        setSelectedRoomIds((prev) => prev.filter((id) => !idsSet.has(id)))

        setSelectedRoom((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })

        setPendingNewRoomId((prev) => {
            if (!prev) return prev
            return idsSet.has(prev) ? null : prev
        })
    }

    const getNextRoomCode = (floor: Room['floor']): string => {
        const usedCodes = new Set(
            rooms
                .filter((room) => room.floor === floor)
                .map((room) => room.name.toUpperCase()),
        )

        for (let i = 1; i <= 99; i += 1) {
            const candidate = `J${floor}${String(i).padStart(2, '0')}`
            if (!usedCodes.has(candidate)) {
                return candidate
            }
        }

        return `J${floor}${Date.now().toString().slice(-2)}`
    }

    const handleAddRoom = (floor: Room['floor']) => {
        const roomCode = getNextRoomCode(floor)
        const newRoomId = `room-${roomCode.toLowerCase()}-${Date.now()}`
        const newRoom: Room = {
            id: newRoomId,
            name: roomCode,
            fullName: `${roomCode}_Nouvelle salle`,
            floor,
            mainType: 'TD',
            types: ['TD'],
            capacity: 20,
            isAvailable: true,
        }

        console.log('[ROOMS] Add room (mock)', newRoom)
        setRooms((prevRooms) => [...prevRooms, newRoom])
        setPendingNewRoomId(newRoomId)
        setSelectedRoom(newRoom)
    }

    const handleRoomChange = (updatedRoom: Room) => {
        setRooms((prevRooms) =>
            prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
        )
        if (pendingNewRoomId === updatedRoom.id) {
            setPendingNewRoomId(null)
        }
        setSelectedRoom(updatedRoom)
    }

    const handleCloseDetail = () => {
        if (selectedRoom && pendingNewRoomId === selectedRoom.id) {
            setRooms((prevRooms) => prevRooms.filter((room) => room.id !== selectedRoom.id))
            setPendingNewRoomId(null)
        }
        setSelectedRoom(null)
    }

    const handleDeleteSingleRoom = (roomId: string) => {
        console.log('[ROOMS] Delete single room (mock)', { roomId })
        removeRoomsByIds([roomId])
    }

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

    const handleToggleSelectionMode = () => {
        setSelectionMode((prev) => {
            const next = !prev
            console.log('[ROOMS] Toggle selection mode (mock)', { next })

            if (next) {
                setSelectedRoom(null)
                setSelectedRoomIds([])
            } else {
                setSelectedRoomIds([])
            }

            return next
        })
    }

    const handleToggleRoomSelection = (roomId: string) => {
        if (!selectionMode) return

        setSelectedRoomIds((prev) => {
            if (prev.includes(roomId)) {
                return prev.filter((id) => id !== roomId)
            }
            return [...prev, roomId]
        })
    }

    const handleSelectAllVisible = () => {
        console.log('[ROOMS] Select all visible rooms (mock)', { count: visibleRoomIds.length })
        setSelectedRoomIds(visibleRoomIds)
    }

    const handleClearSelection = () => {
        console.log('[ROOMS] Clear selection (mock)')
        setSelectedRoomIds([])
    }

    const handleDeleteSelected = () => {
        console.log('[ROOMS] Delete selected rooms (mock)', { ids: selectedRoomIds })
        removeRoomsByIds(selectedRoomIds)
        setSelectionMode(false)
        setSelectedRoomIds([])
    }

    return (
        <>
            <PageHeader
                title="Salles"
                subtitle="Liste des salles par etage avec types et commentaires (mock front uniquement)."
            />

            <div className="rooms-page">
                <RoomsToolbar
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    typeFilter={typeFilter}
                    onTypeFilterChange={handleTypeFilterChange}
                    capacityOperator={capacityOperator}
                    onCapacityOperatorChange={handleCapacityOperatorChange}
                    capacityValue={capacityValue}
                    onCapacityValueChange={handleCapacityValueChange}
                    availabilityFilter={availabilityFilter}
                    onAvailabilityFilterChange={handleAvailabilityFilterChange}
                    selectionMode={selectionMode}
                    selectedCount={selectedRoomIds.length}
                    onToggleSelectionMode={handleToggleSelectionMode}
                />

                {selectionMode && (
                    <SelectionToolbar
                        totalCount={visibleRoomIds.length}
                        selectedCount={selectedRoomIds.length}
                        onSelectAll={handleSelectAllVisible}
                        onClearSelection={handleClearSelection}
                        onDeleteSelected={handleDeleteSelected}
                        confirmTitle="Supprimer les salles selectionnees"
                        confirmMessage={`Vous allez supprimer ${selectedRoomIds.length} salle${selectedRoomIds.length > 1 ? 's' : ''}. Cette action est locale (front).`}
                    />
                )}

                <div className="rooms-sections">
                    {[0, 1, 2].map((floor) => (
                        <RoomsSection
                            key={floor}
                            floor={floor as 0 | 1 | 2}
                            rooms={roomsByFloor[floor] || []}
                            onSelectRoom={setSelectedRoom}
                            onAddRoom={handleAddRoom}
                            selectionMode={selectionMode}
                            selectedRoomIds={selectedRoomIdsSet}
                            onToggleRoomSelection={handleToggleRoomSelection}
                        />
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <RoomDetailCard
                    room={selectedRoom}
                    onClose={handleCloseDetail}
                    onChange={handleRoomChange}
                    onDelete={() => handleDeleteSingleRoom(selectedRoom.id)}
                />
            )}
        </>
    )
}
