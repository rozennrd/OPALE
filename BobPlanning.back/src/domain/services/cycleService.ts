// domain/services/cycleService.ts
import { cycleRepository } from "../../data/repositories/cycleRepository";
import { cycleMapper } from "../../mapper/cycleMapper";
import { CycleDTO } from "../dto/cycleDto";
import { CreateCycleDTO } from "../dto/createCycleDto";
import { CycleTypeDTO } from "../dto/cycleTypeDto";

export const cycleService = {
  async getCycles(): Promise<CycleDTO[]> {
    const daos = await cycleRepository.getAll();
    return daos.map(cycleMapper.toDTO);
  },

  async getCycleById(id: string): Promise<CycleDTO> {
    const dao = await cycleRepository.getById(id);
    if (!dao) {
      const err: any = new Error("Cycle non trouvé");
      err.statusCode = 404;
      throw err;
    }
    return cycleMapper.toDTO(dao);
  },

  async getCycleTypes(): Promise<CycleTypeDTO[]> {
    return await cycleRepository.getTypes();
  },

  async addCycle(dto: CreateCycleDTO): Promise<{ id: string }> {
    const nom = dto.nom.trim();
    const existing = await cycleRepository.getByName(nom);
    if (existing) {
      const err: any = new Error("Un cycle avec ce nom existe deja.");
      err.statusCode = 409;
      throw err;
    }

    const id = await cycleRepository.insert(nom, dto.type);
    return { id };
  },

  async updateCycle(dto: CycleDTO): Promise<void> {
    const nom = dto.nom.trim();
    const existing = await cycleRepository.getByName(nom, dto.id);
    if (existing) {
      const err: any = new Error("Un cycle avec ce nom existe deja.");
      err.statusCode = 409;
      throw err;
    }

    const updated = await cycleRepository.update(dto.id, nom, dto.type);
    if (!updated) {
      const err: any = new Error(`Cycle avec l'ID ${dto.id} non trouvé`);
      err.statusCode = 404;
      throw err;
    }
  },

  async deleteCycle(id: string): Promise<void> {
    const deleted = await cycleRepository.deleteById(id);
    if (!deleted) {
      const err: any = new Error("Cycle non trouvé");
      err.statusCode = 404;
      throw err;
    }
  },
};
