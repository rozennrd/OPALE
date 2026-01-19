import { ProfDAO } from "../data/dao/profDao";
import { ProfDTO } from "../domain/dto/profDto";

export const profMapper = {
    toDTO(dao: ProfDAO): ProfDTO {
        return {
            id: dao.id,
            nom: dao.nom,
            prenom: dao.prenom,
            email: dao.email,
            type: dao.type,
            distanciel: dao.distanciel,
        };
    },
};