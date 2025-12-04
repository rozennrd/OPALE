// src/components/rooms/RoomsSection.tsx
import React, { useState } from 'react'
import { Room } from '../../models/Room'
import RoomCard from './RoomCard'
import SectionHeader from '../common/SectionHeader'

interface RoomsSectionProps {
    floor: 0 | 1 | 2
    rooms: Room[]
    onSelectRoom: (room: Room) => void
}

const FLOOR_LABELS: Record<number, string> = {
    0: 'Rez-de-chaussée',
    1: '1er étage',
    2: '2e étage',
}

const FLOOR_CODES: Record<number, string> = {
    0: 'Codes J0xx',
    1: 'Codes J1xx',
    2: 'Codes J2xx',
}

export default function RoomsSection({ floor, rooms, onSelectRoom }: RoomsSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    if (!rooms || rooms.length === 0) {
        return null
    }

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
                        />
                    ))}
                </div>
            )}
        </section>
    )
}