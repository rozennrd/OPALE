import { SpecialiteDAO } from "../data/dao/specialiteDao";
import { SpecialiteDTO } from "../domain/dto/specialiteDto";

export const specialiteMapper = {
    toDTO(dao: SpecialiteDAO): SpecialiteDTO {
        return {
            id: dao.id,
            id_groupe: dao.id_groupe,
            id_promo: dao.id_promo,
            nom: dao.nom,
            effectifs: dao.effectifs,
        };
    },
};