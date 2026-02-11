import { EventDTO } from '../dto/eventDto';
import { eventMapper } from '../../mapper/eventMapper';
import { eventRepository } from '../../data/repositories/eventRepository';

export const eventService = {
    async getAllEvents(): Promise<EventDTO[]> {
        const daos = await eventRepository.getAll();
        return daos.map(eventMapper.toDTO);
    },

    async getEventById(id: string): Promise<EventDTO> {
        const dao = await eventRepository.getById(id);
        if (!dao) {
            throw new Error(`Événement avec l'ID ${id} non trouvé`);
        }
        return eventMapper.toDTO(dao);
    },

    async getExceptionalEvents(): Promise<EventDTO[]> {
        const daos = await eventRepository.getExceptional();
        return daos.map(eventMapper.toDTO);
    },

    async getMacroEvents(): Promise<EventDTO[]> {
        const daos = await eventRepository.getMacro();
        return daos.map(eventMapper.toDTO);
    },

    async getEventsByPromoAndTypes(promoNom: string, types: string[]): Promise<Record<string, EventDTO[]>> {
        const daos = await eventRepository.getByPromoAndTypes(promoNom, types);
        const dtos = daos.map(eventMapper.toDTO);

        // Organiser par type
        const response: Record<string, EventDTO[]> = {};
        types.forEach((t) => {
            response[t] = dtos.filter((ev) => ev.type === t);
        });
        return response;
    },

    async createEvent(dto: EventDTO): Promise<EventDTO> {
        // Validation de dates
        if (dto.datetime_start >= dto.datetime_end) {
            throw new Error('La date de début doit être antérieure à la date de fin.');
        }

        const id = await eventRepository.insert(
            dto.type,
            dto.nom,
            dto.description,
            dto.num_semaine || null,
            dto.datetime_start,
            dto.datetime_end,
            dto.show_macro ?? true,
            dto.show_micro ?? true,
            dto.is_blocking ?? false,
            dto.is_exceptional ?? false,
            dto.is_external ?? false
        );

        return {
            id,
            ...dto,
            show_macro: dto.show_macro ?? true,
            show_micro: dto.show_micro ?? true,
            is_blocking: dto.is_blocking ?? false,
            is_exceptional: dto.is_exceptional ?? false,
            is_external: dto.is_external ?? false,
        };
    },

    async updateEvent(dto: EventDTO): Promise<void> {
        if (!dto.id) {
            throw new Error("L'ID de l'événement est requis pour la mise à jour.");
        }

        // Validation de dates
        if (dto.datetime_start >= dto.datetime_end) {
            throw new Error('La date de début doit être antérieure à la date de fin.');
        }

        // Vérifier que l'événement existe
        await this.getEventById(dto.id);

        await eventRepository.update(
            dto.id,
            dto.type,
            dto.nom,
            dto.description,
            dto.num_semaine || null,
            dto.datetime_start,
            dto.datetime_end,
            dto.show_macro ?? true,
            dto.show_micro ?? true,
            dto.is_blocking ?? false,
            dto.is_exceptional ?? false,
            dto.is_external ?? false
        );
    },

    async deleteEvent(id: string): Promise<void> {
        const rowCount = await eventRepository.delete(id);
        if (rowCount === 0) {
            throw new Error('Aucun événement trouvé avec cet ID.');
        }
    },
};