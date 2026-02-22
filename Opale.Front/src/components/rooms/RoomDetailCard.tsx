// src/components/rooms/RoomDetailCard.tsx

import React, { useEffect, useState } from 'react'
import { Room, RoomType } from '../../models/Room'
import { ROOM_TYPES } from '../../mocks/rooms.mock'
import RoomTypeBadge from './RoomTypeBadge'
import DetailCardHeader from '../common/DetailCardHeader'
import DetailCardFooter from '../common/DetailCardFooter'
import DetailCardBody from '../common/DetailCardBody'
import ConfirmDialog from '../common/ConfirmDialog'
import { useDetailDirtyClose } from '../../hooks/common/useDetailDirtyClose'

interface RoomDetailCardProps {
    room: Room
    onClose: () => void
    onChange: (room: Room) => void
    onDelete?: () => void
}

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
    TD: 'TD',
    TP_ELECTRONIQUE: 'TP électronique',
    TP_NUMERIQUE: 'TP numérique',
    PROJET: 'Projet',
    AUTRE: 'Autre',
}

const floorLabel = (floor: Room['floor']): string => {
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

export default function RoomDetailCard({ room, onClose, onChange, onDelete }: RoomDetailCardProps) {
    const [name, setName] = useState(room.name)
    const [fullName, setFullName] = useState(room.fullName ?? '')
    const [floor, setFloor] = useState<Room['floor']>(room.floor)
    const [capacity, setCapacity] = useState(room.capacity)
    const [isAvailable, setIsAvailable] = useState(room.isAvailable)
    const [mainType, setMainType] = useState<RoomType>(room.mainType)
    const [types, setTypes] = useState<RoomType[]>(room.types)
    const [description, setDescription] = useState(room.description ?? '')

    useEffect(() => {
        setName(room.name)
        setFullName(room.fullName ?? '')
        setFloor(room.floor)
        setCapacity(room.capacity)
        setIsAvailable(room.isAvailable)
        setMainType(room.mainType)
        setTypes(room.types)
        setDescription(room.description ?? '')
    }, [room])

    const headerTitle = (fullName || name).trim() || room.name

    const hasChanges =
        room.name !== name ||
        (room.fullName ?? '') !== fullName ||
        room.floor !== floor ||
        room.capacity !== capacity ||
        room.isAvailable !== isAvailable ||
        (room.description ?? '') !== description ||
        room.mainType !== mainType ||
        room.types.length !== types.length ||
        room.types.some((t, idx) => t !== types[idx])

    const handleSelectMainType = (type: RoomType) => {
        setMainType(type)

        setTypes((prevTypes) => {
            let nextTypes = prevTypes

            if (!nextTypes.includes(type)) {
                nextTypes = [...nextTypes, type]
            }

            console.log('[ROOMS] Change main type', { roomId: room.id, type })

            return nextTypes
        })
    }

    const handleToggleType = (type: RoomType) => {
        if (type === mainType) return

        setTypes((prevTypes) => {
            const exists = prevTypes.includes(type)
            const nextTypes = exists ? prevTypes.filter((t) => t !== type) : [...prevTypes, type]

            console.log('[ROOMS] Toggle type', { roomId: room.id, type, nextTypes })

            return nextTypes
        })
    }

    const handleCapacityChange = (value: string) => {
        const parsed = Number.parseInt(value, 10)
        const nextCapacity = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
        console.log('[ROOMS] Change room capacity (mock)', { roomId: room.id, nextCapacity })
        setCapacity(nextCapacity)
    }

    const handleToggleAvailability = () => {
        setIsAvailable((previous) => {
            const next = !previous
            console.log('[ROOMS] Toggle room availability (mock)', { roomId: room.id, isAvailable: next })
            return next
        })
    }

    const handleSave = () => {
        const nextRoom: Room = {
            ...room,
            name: name.trim() || room.name,
            fullName: fullName.trim() || undefined,
            floor,
            capacity: Math.max(0, capacity),
            isAvailable,
            description: description.trim() || undefined,
            mainType,
            types: types.length ? types : [mainType],
        }

        console.log('[ROOMS] Save room (mock)', nextRoom)
        onChange(nextRoom)
    }

    const {
        handleRequestClose,
        isConfirmOpen,
        handleConfirmSaveAndClose,
        handleDiscardAndClose,
        handleConfirmDialogRequestClose,
    } = useDetailDirtyClose({
        hasChanges,
        onClose,
        onSaveAndClose: () => {
            handleSave()
            onClose()
        },
        ignoreWhenSelectorExists: '.modal-overlay',
    })

    return (
        <div className="room-detail-overlay" role="dialog" aria-modal="true">
            <DetailCardBody className="room-detail-card">
                <DetailCardHeader
                    onClose={handleRequestClose}
                    closeAriaLabel="Fermer la fiche salle"
                    closeButtonClassName="room-detail-close"
                    headerClassName="room-detail-header-badge"
                >
                    <RoomTypeBadge
                        type={mainType}
                        variant="header"
                        title={headerTitle}
                        subtitle={`${name || room.name} · ${floorLabel(floor)}`}
                    />
                </DetailCardHeader>

                {/* Layout 2 colonnes (générique) */}
                <div className="detail-layout">
                    {/* Colonne gauche : identité + types */}
                    <div className="detail-main-column">
                        <section className="room-detail-section">
                            <h3 className="room-detail-section-title">Identité de la salle &amp; types</h3>

                            <div className="room-detail-identity-grid">
                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="room-name-input">
                                        Nom court (code salle)
                                    </label>
                                    <input
                                        id="room-name-input"
                                        className="room-detail-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex. J001"
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="room-fullname-input">
                                        Surnom / nom complet
                                    </label>
                                    <input
                                        id="room-fullname-input"
                                        className="room-detail-input"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Ex. J001_Projet"
                                    />
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="room-floor-input">
                                        Étage
                                    </label>
                                    <select
                                        id="room-floor-input"
                                        className="room-detail-input"
                                        value={floor}
                                        onChange={(e) => setFloor(Number(e.target.value) as Room['floor'])}
                                    >
                                        <option value={0}>Rez-de-chaussée</option>
                                        <option value={1}>1er étage</option>
                                        <option value={2}>2e étage</option>
                                    </select>
                                </div>

                                <div className="room-detail-field">
                                    <label className="room-detail-field-label" htmlFor="room-capacity-input">
                                        Capacité (places)
                                    </label>
                                    <input
                                        id="room-capacity-input"
                                        type="number"
                                        min={0}
                                        step={1}
                                        className="room-detail-input"
                                        value={capacity}
                                        onChange={(e) => handleCapacityChange(e.target.value)}
                                        placeholder="Ex. 24"
                                    />
                                </div>
                            </div>

                            <div className="room-detail-availability-row">
                                <div className="room-detail-availability-copy">
                                    <span className="room-detail-field-label">Disponibilité globale</span>
                                    <span className="room-detail-hint-small">
                                        Détermine si la salle est entièrement réservable.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className={[
                                        'room-availability-switch',
                                        isAvailable ? 'is-on' : 'is-off',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={handleToggleAvailability}
                                    aria-pressed={isAvailable}
                                    aria-label={
                                        isAvailable
                                            ? 'Rendre la salle non disponible'
                                            : 'Rendre la salle disponible'
                                    }
                                >
                                    <span className="room-availability-switch-track" aria-hidden="true">
                                        <span className="room-availability-switch-thumb" />
                                    </span>
                                    <span className="room-availability-switch-label">
                                        {isAvailable ? 'Disponible' : 'Non disponible'}
                                    </span>
                                </button>
                            </div>

                            <div className="room-detail-types-grid">
                                <div className="room-detail-types-column">
                                    <h3 className="room-detail-section-title">Type principal</h3>
                                    <p className="room-detail-hint-small">
                                        Utilisé pour l’icône, le filtrage et la planification.
                                    </p>

                                    <div className="room-detail-types">
                                        {ROOM_TYPES.map((type) => {
                                            const isSelected = type === mainType
                                            const chipClassName = [
                                                'room-type-chip',
                                                'room-type-chip-main',
                                                isSelected
                                                    ? 'room-type-chip-selected room-type-chip-main-selected'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')

                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={chipClassName}
                                                    onClick={() => handleSelectMainType(type)}
                                                    aria-pressed={isSelected}
                                                >
                                                    <span className="room-type-chip-dot" aria-hidden="true" />
                                                    <span className="room-type-chip-label">{ROOM_TYPE_LABELS[type]}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="room-detail-types-column">
                                    <h3 className="room-detail-section-title">Types disponibles</h3>
                                    <p className="room-detail-hint-small">
                                        Coche les types compatibles avec cette salle. Le type principal est toujours inclus.
                                    </p>

                                    <div className="room-detail-types">
                                        {ROOM_TYPES.map((type) => {
                                            const isChecked = types.includes(type)
                                            const isMain = type === mainType

                                            const chipClassName = [
                                                'room-type-chip',
                                                isChecked ? 'room-type-chip-selected' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')

                                            const checkboxClassName = [
                                                'room-type-chip-checkbox',
                                                isChecked ? 'is-checked' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')

                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={chipClassName}
                                                    onClick={() => handleToggleType(type)}
                                                    aria-pressed={isChecked}
                                                >
                                                    <span className={checkboxClassName} aria-hidden="true" />
                                                    <span className="room-type-chip-label">{ROOM_TYPE_LABELS[type]}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Colonne droite : description */}
                    <aside className="detail-aside-column">
                        <section className="room-detail-section room-detail-description-section">
                            <h3 className="room-detail-section-title">Description / commentaires</h3>
                            <textarea
                                className="room-detail-textarea"
                                placeholder="Notes sur la salle, équipements, contraintes d’utilisation…"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                            />
                        </section>
                    </aside>
                </div>

                <DetailCardFooter
                    saveLabel="Enregistrer"
                    cancelLabel="Annuler"
                    confirmTitle="Enregistrer les modifications"
                    confirmMessage="Souhaites-tu enregistrer les modifications apportées à cette salle ?"
                    confirmLabel="Enregistrer"
                    hasChanges={hasChanges}
                    cancelDirtyTitle="Modifications non enregistrées"
                    cancelDirtyMessage={
                        <>
                            Tu as des modifications non enregistrées sur cette salle.
                            <br />
                            Souhaites-tu les enregistrer avant de fermer ?
                        </>
                    }
                    cancelDirtyConfirmLabel="Enregistrer et fermer"
                    cancelDirtyDiscardLabel="Fermer sans enregistrer"
                    onSave={handleSave}
                    onCancel={onClose}
                    onAfterSaveConfirm={onClose}
                    onDelete={onDelete}
                    deleteLabel="Supprimer"
                    deleteTitle="Supprimer cette salle"
                    deleteMessage="Souhaites-tu supprimer cette salle ?"
                    deleteConfirmLabel="Supprimer"
                />
            </DetailCardBody>

            <ConfirmDialog
                open={isConfirmOpen}
                title="Modifications non enregistrées"
                message={
                    <>
                        <p>Tu as des modifications non enregistrées sur cette salle.</p>
                        <p>Souhaites-tu les enregistrer avant de fermer&nbsp;?</p>
                    </>
                }
                confirmLabel="Enregistrer et fermer"
                cancelLabel="Fermer sans enregistrer"
                confirmClassName="btn-primary"
                cancelClassName="btn-danger"
                onConfirm={handleConfirmSaveAndClose}
                onCancel={handleDiscardAndClose}
                onRequestClose={handleConfirmDialogRequestClose}
            />
        </div>
    )
}
