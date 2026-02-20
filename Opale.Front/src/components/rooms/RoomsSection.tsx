// src/components/rooms/RoomsSection.tsx
import React, { useState } from 'react'
import icPlus from '../../assets/ic-plus.png'
import { Room } from '../../models/Room'
import RoomCard from './RoomCard'
import SectionHeader from '../common/SectionHeader'

interface RoomsSectionProps {
    floor: 0 | 1 | 2
    rooms: Room[]
    onSelectRoom: (room: Room) => void
    onAddRoom: (floor: 0 | 1 | 2) => void
    selectionMode?: boolean
    selectedRoomIds?: Set<string>
    onToggleRoomSelection?: (roomId: string) => void
}

const FLOOR_LABELS: Record<number, string> = {
    0: 'Rez-de-chaussee',
    1: '1er etage',
    2: '2e etage',
}

const FLOOR_CODES: Record<number, string> = {
    0: 'Codes J0xx',
    1: 'Codes J1xx',
    2: 'Codes J2xx',
}

export default function RoomsSection({
    floor,
    rooms,
    onSelectRoom,
    onAddRoom,
    selectionMode = false,
    selectedRoomIds,
    onToggleRoomSelection,
}: RoomsSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleToggle = () => setIsOpen((prev) => !prev)

    const title = `${FLOOR_LABELS[floor]} · ${rooms.length} salle${rooms.length > 1 ? 's' : ''}`
    const subtitle = FLOOR_CODES[floor]

    return (
        <section className="rooms-section">
            <SectionHeader
                title={title}
                subtitle={subtitle}
                isOpen={isOpen}
                onToggle={handleToggle}
                wrapperClassName="rooms-section-header"
                titleClassName="rooms-section-title"
                subtitleClassName="rooms-section-sub"
                chevronClassName="rooms-section-chevron"
            />

            {isOpen && (
                <div className="rooms-grid">
                    {rooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onSelect={() => onSelectRoom(room)}
                            selectionMode={selectionMode}
                            selected={selectedRoomIds?.has(room.id) ?? false}
                            onToggleSelect={() => {
                                if (onToggleRoomSelection) {
                                    onToggleRoomSelection(room.id)
                                }
                            }}
                        />
                    ))}
                    <button
                        type="button"
                        className="card room-add-card"
                        onClick={() => onAddRoom(floor)}
                        aria-label="Ajouter une salle"
                        title="Ajouter une salle"
                    >
                        <img src={icPlus} alt="" />
                    </button>
                </div>
            )}
        </section>
    )
}
