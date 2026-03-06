import { useEffect, useState } from 'react'
import { Room } from '../../models/Room'
import { Salle, sallesApi } from '../../services/api/sallesApi'
import type { ApiError } from '../../services/base/types'

const ROOM_TYPE_VALUES: Room['mainType'][] = [
    'Cours',
    'Informatique',
    'Projet',
    'Rassemblement',
    'Reunion',
    'Associatif',
    'Electronique',
    'Fablab',
    'Reseau',
]

const ROOM_TYPE_SET = new Set<Room['mainType']>(ROOM_TYPE_VALUES)

const LEGACY_BACKEND_TO_FRONT_TYPE: Record<string, Room['mainType']> = {
    TD: 'Cours',
    TP_NUMERIQUE: 'Informatique',
    TP_ELECTRONIQUE: 'Electronique',
    PROJET: 'Projet',
    AUTRE: 'Rassemblement',
}

const mapBackendTypeToFront = (value?: string | null): Room['mainType'] => {
    if (!value) return 'Rassemblement'
    if (ROOM_TYPE_SET.has(value as Room['mainType'])) {
        return value as Room['mainType']
    }
    return LEGACY_BACKEND_TO_FRONT_TYPE[value] ?? 'Rassemblement'
}

const mapFrontTypeToBackend = (value: Room['mainType']): string => {
    return value
}

const normalizeSecondaryTypes = (value: Salle['types_secondaires']): string[] => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        return value
            .replace('{', '')
            .replace('}', '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    }
    return []
}

const backendToRoom = (salle: Salle): Room => {
    const mainType = mapBackendTypeToFront(salle.type_principal)
    const secondaryTypes = normalizeSecondaryTypes(salle.types_secondaires)
        .map((type) => mapBackendTypeToFront(type))
        .filter(Boolean)

    const types = Array.from(new Set([mainType, ...secondaryTypes]))

    return {
        id: salle.id,
        name: salle.nom,
        fullName: salle.nom_complet ?? undefined,
        mainType,
        types,
        floor: Number(salle.etage ?? 0),
        capacity: Number(salle.capacite ?? 0),
        isAvailable: Boolean(salle.utilisable),
        description: salle.description ?? undefined,
    }
}

const roomToCreatePayload = (room: Room) => ({
    nom: room.name,
    nom_complet: room.fullName ?? room.name,
    type_principal: mapFrontTypeToBackend(room.mainType),
    types_secondaires: room.types
        .filter((type) => type !== room.mainType)
        .map((type) => mapFrontTypeToBackend(type)),
    etage: room.floor,
    capacite: room.capacity,
    utilisable: room.isAvailable,
    description: room.description ?? null,
})

const roomToUpdatePayload = (room: Room) => ({
    id: room.id,
    ...roomToCreatePayload(room),
})

const getNextRoomCode = (rooms: Room[], floor: Room['floor']): string => {
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

export type RoomSaveResult = { success: true } | { success: false; error: string }

const getRoomSaveErrorMessage = (error?: ApiError): string => {
    const message = error?.message?.toLowerCase() ?? ''

    if (
        message.includes('duplicate') ||
        message.includes('unique') ||
        message.includes('already') ||
        message.includes('existe') ||
        message.includes('existe deja')
    ) {
        return "Ce code de salle est deja utilise par une autre salle."
    }

    return error?.message ?? "Erreur lors de la sauvegarde de la salle."
}

export const useRoomsData = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [pendingNewRoomId, setPendingNewRoomId] = useState<string | null>(null)

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const response = await sallesApi.getAllSalles()
                if (!response.success || !response.data) {
                    console.error('[ROOMS] Failed to load rooms from API', response.error)
                    return
                }

                const raw = response.data as unknown
                const salles = Array.isArray(raw)
                    ? (raw as Salle[])
                    : (Array.isArray((raw as { data?: Salle[] })?.data)
                        ? ((raw as { data: Salle[] }).data)
                        : [])

                setRooms(salles.map(backendToRoom))
            } catch (error) {
                console.error('[ROOMS] Unexpected error while loading rooms', error)
            }
        }

        loadRooms()
    }, [])

    const deleteRoomsByIds = (ids: string[]) => {
        const idsSet = new Set(ids)
        if (idsSet.size === 0) return

        Array.from(idsSet).forEach(async (id) => {
            const response = await sallesApi.deleteSalle(id)
            if (!response.success) {
                console.error('[ROOMS] Failed to delete room via API', { id, error: response.error })
            }
        })

        setRooms((prev) => prev.filter((room) => !idsSet.has(room.id)))

        setSelectedRoom((prev) => {
            if (!prev) return prev
            if (idsSet.has(prev.id)) return null
            return prev
        })

        setPendingNewRoomId((prev) => {
            if (!prev) return prev
            return idsSet.has(prev) ? null : prev
        })
    }

    const addRoom = (floor: Room['floor']) => {
        const roomCode = getNextRoomCode(rooms, floor)
        const newRoomId = `room-${roomCode.toLowerCase()}-${Date.now()}`
        const newRoom: Room = {
            id: newRoomId,
            name: roomCode,
            fullName: `${roomCode}_Nouvelle salle`,
            floor,
            mainType: 'Cours',
            types: ['Cours'],
            capacity: 20,
            isAvailable: true,
        }

        setRooms((prevRooms) => [...prevRooms, newRoom])
        setPendingNewRoomId(newRoomId)
        setSelectedRoom(newRoom)
    }

    const updateRoom = async (updatedRoom: Room): Promise<RoomSaveResult> => {
        try {
            const payload = {
                ...roomToCreatePayload(updatedRoom),
                types_secondaires: roomToCreatePayload(updatedRoom).types_secondaires.length
                    ? roomToCreatePayload(updatedRoom).types_secondaires
                    : null,
            }

            if (pendingNewRoomId === updatedRoom.id) {
                const createResponse = await sallesApi.createSalle(payload)

                if (!createResponse.success || !createResponse.data) {
                    console.error('[ROOMS] Failed to create room via API', createResponse.error)
                    return {
                        success: false,
                        error: getRoomSaveErrorMessage(createResponse.error),
                    }
                }

                const refreshResponse = await sallesApi.getAllSalles()
                if (refreshResponse.success && refreshResponse.data) {
                    const mapped = refreshResponse.data.map(backendToRoom)
                    setRooms(mapped)

                    const createdRoom = mapped.find((room) => room.id === createResponse.data?.insertedId)
                    setSelectedRoom(createdRoom ?? null)
                }

                setPendingNewRoomId(null)
                return { success: true }
            }

            const updateResponse = await sallesApi.updateSalle({
                id: updatedRoom.id,
                ...payload,
            })
            if (!updateResponse.success) {
                console.error('[ROOMS] Failed to update room via API', updateResponse.error)
                return {
                    success: false,
                    error: getRoomSaveErrorMessage(updateResponse.error),
                }
            }

            setRooms((prevRooms) =>
                prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
            )
            setSelectedRoom(updatedRoom)
            return { success: true }
        } catch (error) {
            console.error('[ROOMS] Unexpected error while saving room', error)
            return {
                success: false,
                error: "Erreur inattendue lors de la sauvegarde de la salle.",
            }
        }
    }

    const closeDetail = () => {
        if (selectedRoom && pendingNewRoomId === selectedRoom.id) {
            setRooms((prevRooms) => prevRooms.filter((room) => room.id !== selectedRoom.id))
            setPendingNewRoomId(null)
        }
        setSelectedRoom(null)
    }

    const deleteSingleRoom = (roomId: string) => {
        deleteRoomsByIds([roomId])
    }

    return {
        rooms,
        selectedRoom,
        pendingNewRoomId,
        setSelectedRoom,
        addRoom,
        updateRoom,
        closeDetail,
        deleteRoomsByIds,
        deleteSingleRoom,
    }
}

