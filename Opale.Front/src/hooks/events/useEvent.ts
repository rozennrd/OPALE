// src/hooks/useEvents.ts
import { useState, useEffect } from 'react'
import { eventsApi, BackendEvent, TypeEvent } from '../../services/api/eventsApi'
import { sallesApi, Salle } from '../../services/api/sallesApi'
import { localisationsApi, Localisation } from '../../services/api/localisationsApi'
import { CampusEvent, EventType } from '../../models/CampusEvent'

// Mapping backend TypeEvent → frontend EventType
const BACKEND_TO_FRONTEND_TYPE: Record<TypeEvent, EventType> = {
    'Cours':              'AUTRE',
    'Entreprise':         'AUTRE',
    'Examen':             'EXAMEN',
    'Reunion':            'AUTRE',
    'Fermeture':          'AUTRE',
    'Soutenance':         'AUTRE',
    'JPO':                'JOURNEE_PO',
    'Stage':              'AUTRE',
    'Mobilite':           'AUTRE',
    'PFE':                'AUTRE',
    'Rattrapage':         'EXAMEN',
    'Conference':         'CONFERENCE',
    'Rentrée':            'AUTRE',
    'Réunion parents':    'AUTRE',
    'Journée Immersion':  'AUTRE',
    'Concours':           'AUTRE',
    'Salon':              'SALON',
    'Fin des cours':      'AUTRE',
    'Autre':              'AUTRE',
}

// Mapping frontend EventType → backend TypeEvent
const FRONTEND_TO_BACKEND_TYPE: Record<EventType, TypeEvent> = {
    'JOURNEE_PO':  'JPO',
    'EXAMEN':      'Examen',
    'CONFERENCE':  'Conference',
    'FORUM':       'Autre',
    'SALON':       'Salon',
    'AUTRE':       'Autre',
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
        type: BACKEND_TO_FRONTEND_TYPE[backendEvent.type] ?? 'AUTRE',
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
        is_external: event.is_external ?? (event.source === 'EXTERNE'),
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
            if (salleIds.length > 0) {
                await Promise.all(
                    salleIds.map((salleId) =>
                        localisationsApi.addLocalisation({
                            id_event: response.data!.insertedId,
                            id_salle: salleId,
                        }),
                    ),
                )
            }

            await loadEvents()
            return { success: true as const }
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

            if (salleIds.length > 0) {
                await Promise.all(
                    salleIds.map((salleId) =>
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

    return {
        events,
        salles,
        loading,
        error,
        createEvent,
        updateEvent,
        refreshEvents: loadEvents,
    }
}