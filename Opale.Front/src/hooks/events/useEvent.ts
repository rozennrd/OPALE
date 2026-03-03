// src/hooks/useEvents.ts
import { useState, useEffect } from 'react'
import { eventsApi, BackendEvent, TypeEvent } from '../../services/api/eventsApi'
import { sallesApi, Salle } from '../../services/api/sallesApi'
import { localisationsApi, Localisation } from '../../services/api/localisationsApi'
import { CampusEvent } from '../../models/CampusEvent'
import { EventType } from '../../models/EventTypes'

// Mapping backend TypeEvent → frontend EventType
const BACKEND_TO_FRONTEND_TYPE: Record<TypeEvent, EventType> = {
    'Cours': 'Cours',
    'Entreprise': 'Entreprise',
    'Examen': 'Examen',
    'Reunion': 'Reunion',
    'Fermeture': 'Fermeture',
    'Soutenance': 'Soutenance',
    'JPO': 'JPO',
    'Stage': 'Stage',
    'Mobilite': 'Mobilite',
    'PFE': 'PFE',
    'Rattrapage': 'Rattrapage',
    'Conference': 'Conference',
    'Rentrée': 'Rentrée',
    'Réunion parents': 'Réunion parents',
    'Journée Immersion': 'Journée Immersion',
    'Concours': 'Concours',
    'Salon': 'Salon',
    'Fin des cours': 'Fin des cours',
    'Autre': 'Autre',
}

// Mapping frontend EventType → backend TypeEvent
const FRONTEND_TO_BACKEND_TYPE: Record<EventType, TypeEvent> = {
    'Cours': 'Cours',
    'Entreprise': 'Entreprise',
    'Examen': 'Examen',
    'Reunion': 'Reunion',
    'Fermeture': 'Fermeture',
    'Soutenance': 'Soutenance',
    'JPO': 'JPO',
    'Stage': 'Stage',
    'Mobilite': 'Mobilite',
    'PFE': 'PFE',
    'Rattrapage': 'Rattrapage',
    'Conference': 'Conference',
    'Rentrée': 'Rentrée',
    'Réunion parents': 'Réunion parents',
    'Journée Immersion': 'Journée Immersion',
    'Concours': 'Concours',
    'Salon': 'Salon',
    'Forum': 'Autre',
    'Fin des cours': 'Fin des cours',
    'Autre': 'Autre',
}

function buildLocation(salles: Salle[]): string {
    return salles.map((s) => s.nom).join(', ')
}

function backendToFrontend(backendEvent: BackendEvent, salles: Salle[] = []): CampusEvent {
    return {
        id: backendEvent.id,
        name: backendEvent.nom,
        startDate: backendEvent.datetime_start,
        endDate: backendEvent.datetime_end,
        location: buildLocation(salles),
        source: backendEvent.is_external ? 'EXTERNE' : 'JUNIA',
        type: BACKEND_TO_FRONTEND_TYPE[backendEvent.type] ?? 'Autre',
        description: backendEvent.description ?? '',
        num_semaine: backendEvent.num_semaine,
        show_macro: backendEvent.show_macro,
        show_micro: backendEvent.show_micro,
        is_blocking: backendEvent.is_blocking,
        is_exceptional: backendEvent.is_exceptional,
        is_external: backendEvent.is_external,
    }
}

function frontendToBackend(event: Partial<CampusEvent>) {
    const isExternal = event.is_external ?? (event.source === 'EXTERNE')
    const concernedPromotions = Array.from(
        new Set(event.concernedPromotionIds ?? []),
    )

    return {
        type: FRONTEND_TO_BACKEND_TYPE[event.type!],
        nom: event.name!,
        description: event.description,
        num_semaine: event.num_semaine,
        datetime_start: event.startDate!,
        datetime_end: event.endDate!,
        show_macro: event.show_macro ?? true,
        show_micro: event.show_micro ?? true,
        is_blocking: event.is_blocking ?? false,
        is_exceptional: event.is_exceptional ?? true,
        is_external: isExternal,
        concerne: isExternal
            ? undefined
            : {
                promotions: concernedPromotions,
                groups: [],
                specialties: [],
            },
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'Une erreur est survenue'
}

function resolveSalleIdsFromLocation(
    location: string | undefined,
    salles: Salle[],
): string[] {
    if (!location?.trim()) return []

    const parts = location
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean)

    if (parts.length === 0) return []

    return Array.from(
        new Set(
            salles
                .filter((salle) => {
                    const labels = [salle.nom_complet, salle.nom]
                        .filter((label): label is string => Boolean(label))
                        .map((label) => label.trim().toLowerCase())

                    return parts.some((part) => labels.includes(part))
                })
                .map((salle) => salle.id),
        ),
    )
}

export function useEvents() {
    const [events, setEvents] = useState<CampusEvent[]>([])
    const [salles, setSalles] = useState<Salle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadEvents = async () => {
        try {
            setLoading(true)
            setError(null)

            const eventsResponse = await eventsApi.getExceptionalEvents()

            if (!eventsResponse.success || !eventsResponse.data) {
                throw new Error('Impossible de charger les événements')
            }

            const sallesResponse = await sallesApi.getAllSalles()
            const allSalles: Salle[] =
                sallesResponse.success && sallesResponse.data
                    ? sallesResponse.data
                    : []
            setSalles(allSalles)

            const localisationsResponse = await localisationsApi.getAllLocalisations()
            const localisations: Localisation[] =
                localisationsResponse.success && localisationsResponse.data
                    ? localisationsResponse.data
                    : []

            const enrichedEvents: CampusEvent[] = eventsResponse.data
                .map((event: BackendEvent) => {
                    const eventLocalisations = localisations.filter(
                        (loc: Localisation) => loc.id_event === event.id,
                    )
                    const eventSalles = eventLocalisations
                        .map((loc: Localisation) =>
                            allSalles.find((s: Salle) => s.id === loc.id_salle),
                        )
                        .filter((salle): salle is Salle => salle !== undefined)

                    return backendToFrontend(event, eventSalles)
                })
                .filter((evt) => evt.is_exceptional === true)

            setEvents(enrichedEvents)

        } catch (err) {
            console.error('Error loading events:', err)
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEvents()
    }, [])

    const createEvent = async (event: Partial<CampusEvent>, salleIds: string[] = []) => {
        try {
            const response = await eventsApi.addEvent(frontendToBackend(event))
            if (!response.success || !response.data) {
                throw new Error(response.error?.message ?? 'Erreur lors de la création')
            }

            const effectiveSalleIds =
                salleIds.length > 0
                    ? Array.from(new Set(salleIds))
                    : resolveSalleIdsFromLocation(event.location, salles)

            if (effectiveSalleIds.length > 0) {
                await Promise.all(
                    effectiveSalleIds.map((salleId) =>
                        localisationsApi.addLocalisation({
                            id_event: response.data!.insertedId,
                            id_salle: salleId,
                        }),
                    ),
                )
            }

            await loadEvents()
            return {
                success: true as const,
                insertedId: response.data.insertedId,
            }
        } catch (err) {
            console.error('Error creating event:', err)
            return { success: false as const, error: getErrorMessage(err) }
        }
    }

    const updateEvent = async (
        eventId: string,
        event: Partial<CampusEvent>,
        salleIds: string[] = [],
    ) => {
        try {
            const response = await eventsApi.updateEvent(eventId, frontendToBackend(event))
            if (!response.success) {
                throw new Error(response.error?.message ?? 'Erreur lors de la mise à jour')
            }

            await localisationsApi.deleteLocalisationsByEvent(eventId)

            const effectiveSalleIds =
                salleIds.length > 0
                    ? Array.from(new Set(salleIds))
                    : resolveSalleIdsFromLocation(event.location, salles)

            if (effectiveSalleIds.length > 0) {
                await Promise.all(
                    effectiveSalleIds.map((salleId) =>
                        localisationsApi.addLocalisation({
                            id_event: eventId,
                            id_salle: salleId,
                        }),
                    ),
                )
            }

            await loadEvents()
            return { success: true as const }
        } catch (err) {
            console.error('Error updating event:', err)
            return { success: false as const, error: getErrorMessage(err) }
        }
    }

    const deleteEvents = async (eventIds: string[]) => {
        const uniqueIds = Array.from(new Set(eventIds))
        if (uniqueIds.length === 0) {
            return { success: true as const, deletedIds: [] as string[] }
        }

        const deletedIds: string[] = []
        const failedIds: string[] = []

        await Promise.all(
            uniqueIds.map(async (eventId) => {
                try {
                    await localisationsApi.deleteLocalisationsByEvent(eventId)
                } catch {
                    // Best-effort cleanup; deletion of event may still succeed if cascade is configured
                }

                const response = await eventsApi.deleteEvent(eventId)
                if (response.success) {
                    deletedIds.push(eventId)
                } else {
                    failedIds.push(eventId)
                }
            }),
        )

        if (failedIds.length > 0) {
            return {
                success: false as const,
                error: `Suppression impossible pour ${failedIds.length} événement(s).`,
                deletedIds,
                failedIds,
            }
        }

        await loadEvents()
        return { success: true as const, deletedIds }
    }

    return {
        events,
        salles,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvents,
        refreshEvents: loadEvents,
    }
}