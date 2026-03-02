import { salleRepository } from '../../data/repositories/salleRepository';
import { salleMapper } from '../../mapper/salleMapper';
import { SalleDTO } from '../dto/salleDto';
import { SalleCreatedDTO } from '../dto/salleCreatedDto';
import { CreateSalleDTO } from '../dto/createSalleDto';
import { UpdateSalleDto } from '../dto/updateSalleDto';

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
      dto.nom_complet ?? null,
      dto.type_principal,
      dto.types_secondaires ?? null,
      dto.etage,
      dto.capacite,
      dto.utilisable,
      dto.description ?? null,
    );

    return {
      id,
      nom: dto.nom,
    };
  },

  async updateSalle(dto: UpdateSalleDto): Promise<void> {
    const updated = await salleRepository.update(dto);

    if (!updated) {
      const err: any = new Error(`Salle avec l'ID ${dto.id} non trouvée`);
      err.statusCode = 404;
      throw err;
    }
  },

  async deleteSalle(id: string): Promise<void> {
    const deleted = await salleRepository.deleteById(id);

    if (!deleted) {
      const err: any = new Error(`Salle avec l'ID ${id} non trouvée`);
      err.statusCode = 404;
      throw err;
    }
  },
};
