// src/components/rooms/RoomDetailCard.tsx
import React, { useState } from 'react'
import { Room, RoomType } from '../../models/Room'
import { ROOM_TYPES } from '../../mocks/rooms.mock'
import RoomTypeBadge from './RoomTypeBadge'

interface RoomDetailCardProps {
    room: Room
    onClose: () => void
    onChange: (room: Room) => void
}

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
    TD: 'TD',
    TP_ELECTRONIQUE: 'TP électronique',
    TP_NUMERIQUE: 'TP numérique',
    PROJET: 'Projet',
    AUTRE: 'Autre',
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

export default function RoomDetailCard({ room, onClose, onChange }: RoomDetailCardProps) {
    const [types, setTypes] = useState<RoomType[]>(room.types)
    const [mainType, setMainType] = useState<RoomType>(room.mainType)
    const [description, setDescription] = useState(room.description ?? '')

    const fullName = room.fullName || room.name

    const commit = (
        nextTypes: RoomType[] = types,
        nextMain: RoomType = mainType,
        nextDesc = description
    ) => {
        onChange({
            ...room,
            types: nextTypes,
            mainType: nextMain,
            description: nextDesc,
        })
    }

    const handleSelectMainType = (type: RoomType) => {
        // mainType change => il doit toujours être dans la liste des types
        let nextTypes = types
        if (!nextTypes.includes(type)) {
            nextTypes = [...nextTypes, type]
        }

        setMainType(type)
        setTypes(nextTypes)
        console.log('[ROOMS] Change main type', { roomId: room.id, type })
        commit(nextTypes, type)
    }

    const toggleType = (type: RoomType) => {
        // On empêche de désélectionner le type principal pour rester cohérent
        if (type === mainType) {
            return
        }

        setTypes((prev) => {
            const exists = prev.includes(type)
            const next = exists ? prev.filter((t) => t !== type) : [...prev, type]
            console.log('[ROOMS] Toggle type', { roomId: room.id, type, next })
            commit(next, mainType)
            return next
        })
    }

    const handleDescriptionBlur = () => {
        if (
            description !== room.description ||
            mainType !== room.mainType ||
            types !== room.types
        ) {
            console.log('[ROOMS] Update description', {
                roomId: room.id,
                mainType,
                types,
                description,
            })
            commit(types, mainType, description)
        }
    }

    return (
        <div className="room-detail-overlay" role="dialog" aria-modal="true">
            <div className="room-detail-card">
                <button
                    type="button"
                    className="room-detail-close"
                    onClick={onClose}
                    aria-label="Fermer la fiche salle"
                >
                    ✕
                </button>

                {/* Header pill, comme pour les enseignants */}
                <div className="room-detail-header-badge">
                    <RoomTypeBadge
                        type={mainType}
                        variant="header"
                        title={fullName}
                        subtitle={`${room.name} · ${floorLabel(room.floor)}`}
                    />
                </div>

                {/* Type principal */}
                <section className="room-detail-section">
                    <h3 className="room-detail-section-title">Type principal</h3>
                    <p className="room-detail-hint">
                        Utilisé comme type par défaut pour la salle (icône, filtrage…)
                    </p>
                    <div className="room-detail-types room-detail-types-main">
                        {ROOM_TYPES.map((type) => {
                            const isSelected = mainType === type
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={
                                        'room-type-chip room-type-chip-main' +
                                        (isSelected ? ' room-type-chip-main-selected' : '')
                                    }
                                    onClick={() => handleSelectMainType(type)}
                                >
                                    <span className="room-type-chip-dot" aria-hidden="true" />
                                    <span className="room-type-chip-label">
                                        {ROOM_TYPE_LABELS[type]}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* Types disponibles */}
                <section className="room-detail-section">
                    <h3 className="room-detail-section-title">Types disponibles</h3>
                    <p className="room-detail-hint">
                        Coche les types compatibles avec cette salle. Le type principal est
                        toujours inclus.
                    </p>
                    <div className="room-detail-types">
                        {ROOM_TYPES.map((type) => {
                            const checked = types.includes(type)
                            const isMain = type === mainType

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    className={
                                        'room-type-chip' +
                                        (checked ? ' room-type-chip-selected' : '') +
                                        (isMain ? ' room-type-chip-main-lock' : '')
                                    }
                                    onClick={() => toggleType(type)}
                                >
                                    <span
                                        className={
                                            'room-type-chip-checkbox' +
                                            (checked ? ' is-checked' : '')
                                        }
                                        aria-hidden="true"
                                    />
                                    <span className="room-type-chip-label">
                                        {ROOM_TYPE_LABELS[type]}
                                        {isMain && (
                                            <span className="room-type-chip-main-tag">
                                                {' '}
                                                (principal)
                                            </span>
                                        )}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    <p className="room-detail-hint room-detail-hint-small">
                        Le type principal ne peut pas être décoché.
                    </p>
                </section>

                {/* Description */}
                <section className="room-detail-section">
                    <h3 className="room-detail-section-title">Description / commentaires</h3>
                    <textarea
                        className="room-detail-textarea"
                        placeholder="Notes sur la salle, équipements, contraintes d’utilisation…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        rows={4}
                    />
                </section>
            </div>
        </div>
    )
}