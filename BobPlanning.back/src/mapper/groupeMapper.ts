import { GroupeDAO } from "../data/dao/groupeDao";
import { GroupeDTO } from "../domain/dto/groupeDto";

export const groupeMapper = {
  toDTO(dao: GroupeDAO): GroupeDTO {
    return {
      id: dao.id,
      id_promo: dao.id_promo,
      nom: dao.nom,
      effectifs: dao.effectifs,
    };
  },
};
