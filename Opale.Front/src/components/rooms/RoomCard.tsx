import React from 'react'
import { Room } from '../../models/Room'
import RoomTypeBadge from './RoomTypeBadge'

interface RoomCardProps {
    room: Room
    onSelect: () => void
}

const floorLabel = (floor: 0 | 1 | 2): string => {
    switch (floor) {
        case 0:
            return 'Rez-de-chaussée'
        case 1:
            return '1er étage'
        case 2:
            return '2e étage'
        default:
            return `Étage ${floor}`
    }
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
    const fullName = room.fullName || room.name

    const handleClick = () => {
        console.log('[ROOMS] Click room card', room)
        onSelect()
    }

    return (
        <article className="room-card" onClick={handleClick}>
            <div className="room-card-main">
                <div className="room-card-name">{fullName}</div>
                <div className="room-card-meta">
                    <span className="room-card-code">{room.name}</span>
                    <span className="room-card-separator">•</span>
                    <span className="room-card-floor">{floorLabel(room.floor)}</span>
                </div>
            </div>

            <div className="room-card-type">
                <RoomTypeBadge type={room.mainType} />
            </div>
        </article>
    )
}
