import { SalleDAO } from '../data/dao/salleDao';
import { SalleDTO } from '../domain/dto/salleDto';


export const salleMapper = {
  toDTO(dao: SalleDAO): SalleDTO {
    return {
      id: dao.id,
      nom: dao.nom,
      nom_complet: dao.nom_complet,
      type_principal: dao.type_principal,
      types_secondaires: dao.types_secondaires,
      etage: dao.etage,
      capacite: dao.capacite,
      description: dao.description,
      utilisable: dao.utilisable
    };
  },
};