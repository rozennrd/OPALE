import { SalleDAO } from '../data/dao/salleDao';
import { SalleDTO } from '../domain/dto/salleDto';


export const salleMapper = {
  toDTO(dao: SalleDAO): SalleDTO {
    return {
      id: dao.id,
      nom: dao.nom,
      type: dao.type,
      capacite: dao.capacite,
      etage: dao.etage,
      description: dao.description
    };
  },
};