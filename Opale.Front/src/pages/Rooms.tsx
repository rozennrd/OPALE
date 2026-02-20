// src/pages/Rooms.tsx
import React, { useMemo, useState } from 'react'
import { Room } from '../models/Room'
import { ROOMS_MOCK } from '../mocks/rooms.mock'
import RoomsSection from '../components/rooms/RoomsSection'
import RoomDetailCard from '../components/rooms/RoomDetailCard'
import PageHeader from '../components/common/PageHeader'

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

    const roomsByFloor = useMemo(() => {
        const map: Record<number, Room[]> = { 0: [], 1: [], 2: [] }
        for (const room of rooms) {
            if (!map[room.floor]) {
                map[room.floor] = []
            }
            map[room.floor].push(room)
        }
        map[0].sort(sortRoomsByCode)
        map[1].sort(sortRoomsByCode)
        map[2].sort(sortRoomsByCode)
        return map
    }, [rooms])

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
        }

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
        setRooms((prev) => prev.filter((room) => room.id !== roomId))

        setSelectedRoom((prev) => {
            if (!prev) return prev
            return prev.id === roomId ? null : prev
        })

        if (pendingNewRoomId === roomId) {
            setPendingNewRoomId(null)
        }
    }

    return (
        <>
            <PageHeader
                title="Salles"
                subtitle="Liste des salles par etage avec types et commentaires (mock front uniquement)."
            />

            <div className="rooms-page">
                <div className="rooms-sections">
                    {[0, 1, 2].map((floor) => (
                        <RoomsSection
                            key={floor}
                            floor={floor as 0 | 1 | 2}
                            rooms={roomsByFloor[floor] || []}
                            onSelectRoom={setSelectedRoom}
                            onAddRoom={handleAddRoom}
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
