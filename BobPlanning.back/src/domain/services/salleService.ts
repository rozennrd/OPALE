import { salleRepository } from "../../data/repositories/salleRepository";
import { salleMapper } from "../../mapper/salleMapper";
import { SalleDTO } from "../dto/salleDto";
import { SalleCreatedDTO } from '../dto/salleCreatedDto';
import { CreateSalleDTO } from '../dto/createSalleDto';

export const salleService = {
  // Récupère toutes les salles
  async getSalles(): Promise<SalleDTO[]> {
    const daos = await salleRepository.getAll();
    return daos.map(salleMapper.toDTO);
  },

  // Crée une nouvelle salle
  async createSalle(dto: CreateSalleDTO): Promise<SalleCreatedDTO> {
    const id = await salleRepository.insert(
      dto.nom,
      dto.type,
      dto.capacite,
      dto.etage
    );

    return {
      id,
      nom: dto.nom
    };
  }
};
