// domain/services/enseignementService.ts
import { enseignementRepository } from "../../data/repositories/enseignementRepository";
import { enseignementMapper } from "../../mapper/enseignementMapper";
import { EnseignementDTO } from "../dto/enseignementDto";
import { CreateEnseignementDTO } from "../dto/createEnseignementDto";
import { UpdateEnseignementDTO } from "../dto/updateEnseignementDto";

const badRequest = (msg: string) => {
  const e: any = new Error(msg);
  e.statusCode = 400;
  return e;
};

export const enseignementService = {
  async getEnseignements(): Promise<EnseignementDTO[]> {
    const daos = await enseignementRepository.getAll();
    return daos.map(enseignementMapper.toDTO);
  },

  async getEnseignementById(id: string): Promise<EnseignementDTO> {
    const dao = await enseignementRepository.getById(id);
    if (!dao) {
      const e: any = new Error("Enseignement non trouvé");
      e.statusCode = 404;
      throw e;
    }
    return enseignementMapper.toDTO(dao);
  },

  async addEnseignement(dto: CreateEnseignementDTO): Promise<{ id: string }> {
    if (!dto.id_matiere) throw badRequest("id_matiere est obligatoire.");
    if (!dto.id_prof) throw badRequest("id_prof est obligatoire.");
    if (dto.heures_td === undefined || dto.heures_td === null) throw badRequest("heures_td est obligatoire.");
    if (dto.heures_tp === undefined || dto.heures_tp === null) throw badRequest("heures_tp est obligatoire.");
    if (dto.heures_projet === undefined || dto.heures_projet === null) throw badRequest("heures_projet est obligatoire.");
    if (dto.heures_elearning === undefined || dto.heures_elearning === null) throw badRequest("heures_elearning est obligatoire.");
    if (dto.heures_autre === undefined || dto.heures_autre === null) throw badRequest("heures_autre est obligatoire.");
    if (!Number.isInteger(Number(dto.heures_td)) || Number(dto.heures_td) < 0) {
      throw badRequest("heures_td doit être un entier >= 0.");
    }

    if (!Number.isInteger(Number(dto.heures_tp)) || Number(dto.heures_tp) < 0) {
      throw badRequest("heures_tp doit être un entier >= 0.");
    }

    try {
      const id = await enseignementRepository.insert({
        id_matiere: String(dto.id_matiere),
        id_prof: String(dto.id_prof),
        heures_td: Number(dto.heures_td),
        heures_tp: Number(dto.heures_tp),
        heures_projet: Number(dto.heures_projet),
        heures_elearning: Number(dto.heures_elearning),
        heures_autre: Number(dto.heures_autre),
      });
      return { id };
    } catch (err: any) {
      if (err?.constraint === "fk_enseignement_matiere") {
        throw badRequest("L'id de la matière n'a pas été trouvé.");
      }
      if (err?.constraint === "fk_enseignement_professeur") {
        throw badRequest("L'id du professeur n'a pas été trouvé.");
      }
      throw err;
    }
  },

  async updateEnseignement(dto: UpdateEnseignementDTO): Promise<void> {
    if (!dto.id) throw badRequest("id est obligatoire.");
    if (!dto.id_matiere) throw badRequest("id_matiere est obligatoire.");
    if (!dto.id_prof) throw badRequest("id_prof est obligatoire.");
    if (dto.heures_td === undefined || dto.heures_td === null) throw badRequest("heures_td est obligatoire.");
    if (dto.heures_tp === undefined || dto.heures_tp === null) throw badRequest("heures_tp est obligatoire.");
    if (dto.heures_projet === undefined || dto.heures_projet === null) throw badRequest("heures_projet est obligatoire.");
    if (dto.heures_elearning === undefined || dto.heures_elearning === null) throw badRequest("heures_elearning est obligatoire.");
    if (dto.heures_autre === undefined || dto.heures_autre === null) throw badRequest("heures_autre est obligatoire.");
    if (!Number.isInteger(Number(dto.heures_td)) || Number(dto.heures_td) < 0) {
      throw badRequest("nb_heures doit être un entier >= 0.");
    }
    if (!Number.isInteger(Number(dto.heures_tp)) || Number(dto.heures_tp) < 0) {
      throw badRequest("heures_tp doit être un entier >= 0.");
    }
    if (!Number.isInteger(Number(dto.heures_projet)) || Number(dto.heures_projet) < 0) {
      throw badRequest("heures_projet doit être un entier >= 0.");
    }
    if (!Number.isInteger(Number(dto.heures_elearning)) || Number(dto.heures_elearning) < 0) {
      throw badRequest("heures_elearning doit être un entier >= 0.");
    }
    if (!Number.isInteger(Number(dto.heures_autre)) || Number(dto.heures_autre) < 0) {
      throw badRequest("heures_autre doit être un entier >= 0.");
    }

    try {
      const updated = await enseignementRepository.update({
        id: String(dto.id),
        id_matiere: String(dto.id_matiere),
        id_prof: String(dto.id_prof),
        heures_td: Number(dto.heures_td),
        heures_tp: Number(dto.heures_tp),
        heures_projet: Number(dto.heures_projet),
        heures_elearning: Number(dto.heures_elearning),
        heures_autre: Number(dto.heures_autre),
      });

      if (!updated) {
        const e: any = new Error(`Enseignement avec l'ID ${dto.id} non trouvé`);
        e.statusCode = 404;
        throw e;
      }
    } catch (err: any) {
      if (err?.constraint === "fk_enseignement_matiere") {
        throw badRequest("L'id de la matière n'a pas été trouvé.");
      }
      if (err?.constraint === "fk_enseignement_professeur") {
        throw badRequest("L'id du professeur n'a pas été trouvé.");
      }
      throw err;
    }
  },

  async deleteEnseignement(id: string): Promise<void> {
    const deleted = await enseignementRepository.deleteById(id);
    if (!deleted) {
      const e: any = new Error("Enseignement non trouvé");
      e.statusCode = 404;
      throw e;
    }
  },
};
