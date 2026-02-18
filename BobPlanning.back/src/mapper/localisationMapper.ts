import { LocalisationDAO } from '../data/dao/localisationDao';
import { LocalisationDTO } from '../domain/dto/localisationDto';

export const localisationMapper = {
    toDTO(dao: LocalisationDAO): LocalisationDTO {
        return {
            id: dao.id,
            id_salle: dao.id_salle,
            id_event: dao.id_event,
        };
    },
};