// src/pages/Rooms.tsx
import React, { useMemo, useState } from 'react'
import { Room } from '../models/Room'
import { ROOMS_MOCK } from '../mocks/rooms.mock'
import RoomsSection from '../components/rooms/RoomsSection'
import RoomDetailCard from '../components/rooms/RoomDetailCard'
import PageHeader from '../components/common/PageHeader'

export default function Rooms() {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const roomsByFloor = useMemo(() => {
        const map: Record<number, Room[]> = { 0: [], 1: [], 2: [] }
        for (const room of ROOMS_MOCK) {
            if (!map[room.floor]) {
                map[room.floor] = []
            }
            map[room.floor].push(room)
        }
        return map
    }, [])

    return (
        <>
            {/* TITRE & SOUS-TITRE */}
            <PageHeader
                title="Salles"
                subtitle="Liste des salles par étage avec types et commentaires (mock front uniquement)."
            />

            {/* CONTENU DE LA PAGE */}
            <div className="rooms-page">
                <div className="rooms-sections">
                    {[0, 1, 2].map((floor) => (
                        <RoomsSection
                            key={floor}
                            floor={floor as 0 | 1 | 2}
                            rooms={roomsByFloor[floor] || []}
                            onSelectRoom={setSelectedRoom}
                        />
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <RoomDetailCard
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    onChange={(updated) => {
                        console.log('[ROOMS] Save (mock) room', updated)
                        setSelectedRoom(updated)
                    }}
                />
            )}
        </>
    )
}