// src/components/rooms/RoomsSection.tsx
import React, { useState } from 'react'
import { Room } from '../../models/Room'
import RoomCard from './RoomCard'
import SectionHeader from '../common/SectionHeader'

interface RoomsSectionProps {
    floor: number
    rooms: Room[]
    onSelectRoom: (room: Room) => void
    selectionMode?: boolean
    selectedRoomIds?: Set<string>
    onToggleRoomSelection?: (roomId: string) => void
}

const FLOOR_LABELS: Record<number, string> = {
    0: 'Rez-de-chaussée',
    1: '1er étage',
    2: '2e étage',
}

const floorCodeLabel = (floor: number): string => `Codes J${floor}xx`
const floorLabel = (floor: number): string => FLOOR_LABELS[floor] ?? `Étage ${floor}`

export default function RoomsSection({
    floor,
    rooms,
    onSelectRoom,
    selectionMode = false,
    selectedRoomIds,
    onToggleRoomSelection,
}: RoomsSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleToggle = () => setIsOpen((prev) => !prev)

    const title = `${floorLabel(floor)} · ${rooms.length} salle${rooms.length > 1 ? 's' : ''}`
    const subtitle = floorCodeLabel(floor)

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
                </div>
            )}
        </section>
    )
}
