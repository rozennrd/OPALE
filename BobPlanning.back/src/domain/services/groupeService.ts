import { groupeRepository } from "../../data/repositories/groupeRepository";
import { groupeMapper } from "../../mapper/groupeMapper";
import { GroupeDTO } from "../dto/groupeDto";
import { CreateGroupeDTO } from "../dto/createGroupeDto";
import { UpdateGroupeDTO } from "../dto/updateGroupeDto";

export const groupeService = {
  async getGroups(): Promise<GroupeDTO[]> {
    const daos = await groupeRepository.getAll();
    return daos.map(groupeMapper.toDTO);
  },

  async getGroupById(id: string): Promise<GroupeDTO> {
    const dao = await groupeRepository.getById(id);
    if (!dao) {
      const err: any = new Error("Groupe non trouvé.");
      err.statusCode = 404;
      throw err;
    }
    return groupeMapper.toDTO(dao);
  },

  async addGroup(dto: CreateGroupeDTO): Promise<{ id: string }> {
    try {
      const id = await groupeRepository.insert(dto);
      return { id };
    } catch (err: any) {
      if (err?.constraint === "uq_groupe_nom_promo") {
        const e: any = new Error("Un groupe portant ce nom existe déjà pour cette promotion.");
        e.statusCode = 409;
        throw e;
      }
      throw err;
    }
  },

  async updateGroup(dto: UpdateGroupeDTO): Promise<void> {
    try {
      const updated = await groupeRepository.update(dto);
      if (!updated) {
        const err: any = new Error(`Groupe avec l'ID ${dto.id} non trouvé`);
        err.statusCode = 404;
        throw err;
      }
    } catch (err: any) {
      if (err?.constraint === "uq_groupe_nom_promo") {
        const e: any = new Error("Un groupe portant ce nom existe déjà pour cette promotion.");
        e.statusCode = 409;
        throw e;
      }
      throw err;
    }
  },

  async deleteGroup(id: string): Promise<void> {
    const deleted = await groupeRepository.deleteById(id);
    if (!deleted) {
      const err: any = new Error("Groupe non trouvé");
      err.statusCode = 404;
      throw err;
    }
  },
};
