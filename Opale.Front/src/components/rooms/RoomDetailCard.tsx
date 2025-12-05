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

export default function RoomDetailCard({
                                           room,
                                           onClose,
                                           onChange,
                                       }: RoomDetailCardProps) {
    const [name, setName] = useState(room.name)
    const [fullName, setFullName] = useState(room.fullName ?? '')
    const [mainType, setMainType] = useState<RoomType>(room.mainType)
    const [types, setTypes] = useState<RoomType[]>(room.types)
    const [description, setDescription] = useState(room.description ?? '')

    // synchro si on change de salle sans fermer la modale
    useEffect(() => {
        setName(room.name)
        setFullName(room.fullName ?? '')
        setMainType(room.mainType)
        setTypes(room.types)
        setDescription(room.description ?? '')
    }, [room])

    const headerTitle = (fullName || name).trim() || room.name

    const hasChanges =
        room.name !== name ||
        (room.fullName ?? '') !== fullName ||
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
            const nextTypes = exists
                ? prevTypes.filter((t) => t !== type)
                : [...prevTypes, type]

            console.log('[ROOMS] Toggle type', { roomId: room.id, type, nextTypes })

            return nextTypes
        })
    }

    const handleSave = () => {
        const nextRoom: Room = {
            ...room,
            name: name.trim() || room.name,
            fullName: fullName.trim() || undefined,
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
                        subtitle={`${name || room.name} · ${floorLabel(room.floor)}`}
                    />
                </DetailCardHeader>

                {/* Layout 2 colonnes */}
                <div className="room-detail-layout">
                    {/* Colonne gauche : identité + types */}
                    <div className="room-detail-main-column">
                        <section className="room-detail-section">
                            <h3 className="room-detail-section-title">
                                Identité de la salle &amp; types
                            </h3>

                            {/* Nom + surnom */}
                            <div className="room-detail-identity-grid">
                                <div className="room-detail-field">
                                    <label
                                        className="room-detail-field-label"
                                        htmlFor="room-name-input"
                                    >
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
                                    <label
                                        className="room-detail-field-label"
                                        htmlFor="room-fullname-input"
                                    >
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
                            </div>

                            {/* Deux colonnes : type principal / types disponibles */}
                            <div className="room-detail-types-grid">
                                {/* Colonne gauche : type principal */}
                                <div className="room-detail-types-column">
                                    <h3 className="room-detail-section-title">
                                        Type principal
                                    </h3>
                                    <p className="room-detail-hint-small">
                                        Utilisé pour l’icône, le filtrage et la
                                        planification.
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
                                                    onClick={() =>
                                                        handleSelectMainType(type)
                                                    }
                                                    aria-pressed={isSelected}
                                                >
                                                    <span
                                                        className="room-type-chip-dot"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="room-type-chip-label">
                                                        {ROOM_TYPE_LABELS[type]}
                                                    </span>
                                                    {isSelected && (
                                                        <span className="room-type-chip-main-tag">
                                                            Principal
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Colonne droite : types disponibles */}
                                <div className="room-detail-types-column">
                                    <h3 className="room-detail-section-title">
                                        Types disponibles
                                    </h3>
                                    <p className="room-detail-hint-small">
                                        Coche les types compatibles avec cette
                                        salle. Le type principal est toujours
                                        inclus.
                                    </p>

                                    <div className="room-detail-types">
                                        {ROOM_TYPES.map((type) => {
                                            const isChecked = types.includes(type)
                                            const isMain = type === mainType

                                            const chipClassName = [
                                                'room-type-chip',
                                                isChecked
                                                    ? 'room-type-chip-selected'
                                                    : '',
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
                                                    onClick={() =>
                                                        handleToggleType(type)
                                                    }
                                                    aria-pressed={isChecked}
                                                >
                                                    <span
                                                        className={checkboxClassName}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="room-type-chip-label">
                                                        {ROOM_TYPE_LABELS[type]}
                                                    </span>
                                                    {isMain && (
                                                        <span className="room-type-chip-main-lock">
                                                            Principal
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Colonne droite : description seule */}
                    <aside className="room-detail-aside-column">
                        <section className="room-detail-section room-detail-description-section">
                            <h3 className="room-detail-section-title">
                                Description / commentaires
                            </h3>
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

                {/* Footer boutons – hors des 2 colonnes */}
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
                            Tu as des modifications non enregistrées sur cette
                            salle.
                            <br />
                            Souhaites-tu les enregistrer avant de fermer ?
                        </>
                    }
                    cancelDirtyConfirmLabel="Enregistrer et fermer"
                    cancelDirtyDiscardLabel="Fermer sans enregistrer"
                    onSave={handleSave}
                    onCancel={onClose}
                    onAfterSaveConfirm={onClose}
                />
            </DetailCardBody>

            {/* Popup spécifique ESC / croix */}
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