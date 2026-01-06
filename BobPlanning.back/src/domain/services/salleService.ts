import { salleRepository } from "../../data/repositories/salleRepository";
import { salleMapper } from "../../mapper/salleMapper";
import { SalleDTO } from "../dto/salleDto";
import { SalleCreatedDTO } from '../dto/salleCreatedDto';
import { CreateSalleDTO } from '../dto/createSalleDto';
import { UpdateSalleDto } from "../dto/updateSalleDto";

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
  },

  async updateSalle(dto: UpdateSalleDto): Promise<void> {
    const updated = await salleRepository.update(dto);

    if (!updated) {
      // Ici tu peux aussi throw une NotFoundError custom si tu as un système d'erreurs
      const err: any = new Error(`Salle avec l'ID ${dto.id} non trouvée`);
      err.statusCode = 404;
      throw err;
    }
  },
};
