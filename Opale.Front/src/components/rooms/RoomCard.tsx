// src/components/rooms/RoomCard.tsx
import { Room } from '../../models/Room'
import RoomTypeBadge from './RoomTypeBadge'
import EntityCard from '../common/EntityCard'

interface RoomCardProps {
    room: Room
    onSelect: () => void
    selectionMode?: boolean
    selected?: boolean
    onToggleSelect?: () => void
}

const floorLabel = (floor: number): string => {
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

export default function RoomCard({
    room,
    onSelect,
    selectionMode = false,
    selected = false,
    onToggleSelect,
}: RoomCardProps) {
    const displayName = room.fullName || room.name

    const handleClick = () => {
        if (selectionMode) {
            if (onToggleSelect) onToggleSelect()
            return
        }

        onSelect()
    }

    return (
        <EntityCard
            onClick={handleClick}
            className="room-card"
            mainClassName="room-card-main"
            asideClassName="room-card-type"
            badge={<RoomTypeBadge type={room.mainType} />}
            variant="default"
            selectionMode={selectionMode}
            selected={selected}
        >
            <div className="room-card-name">{displayName}</div>
            <div className="room-card-meta">
                <span className="room-card-code">{room.name}</span>
                <span className="room-card-separator">•</span>
                <span className="room-card-floor">
                    {floorLabel(room.floor)}
                </span>
            </div>
        </EntityCard>
    )
}
