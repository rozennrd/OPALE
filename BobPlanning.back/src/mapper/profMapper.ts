import { ProfDAO } from "../data/dao/profDao";
import { ProfDTO } from "../domain/dto/profDto";

export const profMapper = {
    toDTO(dao: ProfDAO): ProfDTO {
        return {
            id: dao.id,
            nom: dao.nom,
            prenom: dao.prenom,
            email: dao.email,
            email_perso: dao.email_perso,
            type: dao.type as 'Permanent' | 'Intervenant' | 'Invite',
            distanciel: dao.distanciel,
            campus_origin: dao.campus_origin as 'Bordeaux' | 'Lille' | 'Chateauroux'
        };
    },
};