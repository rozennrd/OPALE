import { useState } from 'react'
import { ROOMS_MOCK } from '../../mocks/rooms.mock'
import { Room } from '../../models/Room'

const getNextRoomCode = (rooms: Room[], floor: Room['floor']): string => {
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

export const useRoomsData = () => {
    const [rooms, setRooms] = useState<Room[]>(() => [...ROOMS_MOCK])
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [pendingNewRoomId, setPendingNewRoomId] = useState<string | null>(null)

    const deleteRoomsByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        console.log('[ROOMS] Delete rooms (mock)', { ids: Array.from(idsSet) })

        setRooms((prev) => prev.filter((room) => !idsSet.has(room.id)))

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

    const addRoom = (floor: Room['floor']) => {
        const roomCode = getNextRoomCode(rooms, floor)
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

    const updateRoom = (updatedRoom: Room) => {
        setRooms((prevRooms) =>
            prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
        )
        if (pendingNewRoomId === updatedRoom.id) {
            setPendingNewRoomId(null)
        }
        setSelectedRoom(updatedRoom)
    }

    const closeDetail = () => {
        if (selectedRoom && pendingNewRoomId === selectedRoom.id) {
            setRooms((prevRooms) => prevRooms.filter((room) => room.id !== selectedRoom.id))
            setPendingNewRoomId(null)
        }
        setSelectedRoom(null)
    }

    const deleteSingleRoom = (roomId: string) => {
        console.log('[ROOMS] Delete single room (mock)', { roomId })
        deleteRoomsByIds([roomId])
    }

    return {
        rooms,
        selectedRoom,
        setSelectedRoom,
        addRoom,
        updateRoom,
        closeDetail,
        deleteRoomsByIds,
        deleteSingleRoom,
    }
}

