import { EventDAO } from '../data/dao/eventDao';
import {EventDTO, TypeEvent} from '../domain/dto/eventDto';

export const eventMapper = {
    toDTO(dao: EventDAO): EventDTO {
        return {
            id: dao.id,
            type: dao.type as TypeEvent,
            nom: dao.nom,
            description: dao.description,
            num_semaine: dao.num_semaine || undefined,
            datetime_start: dao.datetime_start,
            datetime_end: dao.datetime_end,
            show_macro: dao.show_macro,
            show_micro: dao.show_micro,
            is_blocking: dao.is_blocking,
            is_exceptional: dao.is_exceptional,
            is_external: dao.is_external,
        };
    },
};