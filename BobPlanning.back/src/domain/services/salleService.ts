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
    const nom = dto.nom.trim();
    const nomComplet = dto.nom_complet?.trim() || null;
    const existingNom = await salleRepository.getByNom(nom);
    if (existingNom) {
      const e: any = new Error('Une salle avec ce code existe deja.');
      e.statusCode = 409;
      throw e;
    }
    if (nomComplet) {
      const existingNomComplet = await salleRepository.getByNomComplet(nomComplet);
      if (existingNomComplet) {
        const e: any = new Error('Une salle avec ce nom/surnom existe deja.');
        e.statusCode = 409;
        throw e;
      }
    }

    try {
      const id = await salleRepository.insert(
        nom,
        nomComplet ?? null,
        dto.type_principal,
        dto.types_secondaires ?? null,
        dto.etage,
        dto.capacite,
        dto.utilisable,
        dto.description ?? null,
      );

      return {
        id,
        nom,
      };
    } catch (err: any) {
      if (err?.constraint === 'uq_salle_nom') {
        const e: any = new Error('Une salle avec ce code existe deja.');
        e.statusCode = 409;
        throw e;
      }
      if (err?.constraint === 'uq_salle_nom_complet') {
        const e: any = new Error('Une salle avec ce nom/surnom existe deja.');
        e.statusCode = 409;
        throw e;
      }
      throw err;
    }
  },

  async updateSalle(dto: UpdateSalleDto): Promise<void> {
    const nom = dto.nom.trim();
    const nomComplet = dto.nom_complet?.trim() || null;
    const existingNom = await salleRepository.getByNom(nom, dto.id);
    if (existingNom) {
      const e: any = new Error('Une salle avec ce code existe deja.');
      e.statusCode = 409;
      throw e;
    }
    if (nomComplet) {
      const existingNomComplet = await salleRepository.getByNomComplet(nomComplet, dto.id);
      if (existingNomComplet) {
        const e: any = new Error('Une salle avec ce nom/surnom existe deja.');
        e.statusCode = 409;
        throw e;
      }
    }

    try {
      const updated = await salleRepository.update({
        ...dto,
        nom,
        nom_complet: nomComplet,
      });

      if (!updated) {
        const err: any = new Error(`Salle avec l'ID ${dto.id} non trouvée`);
        err.statusCode = 404;
        throw err;
      }
    } catch (err: any) {
      if (err?.constraint === 'uq_salle_nom') {
        const e: any = new Error('Une salle avec ce code existe deja.');
        e.statusCode = 409;
        throw e;
      }
      if (err?.constraint === 'uq_salle_nom_complet') {
        const e: any = new Error('Une salle avec ce nom/surnom existe deja.');
        e.statusCode = 409;
        throw e;
      }
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
