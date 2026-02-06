import { matiereRepository } from "../../data/repositories/matiereRepository";
import { matiereMapper } from "../../mapper/matiereMapper";
import { MatiereDTO } from "../dto/matiereDto";
import { CreateMatiereDTO } from "../dto/createMatiereDto";
import { UpdateMatiereDTO } from "../dto/updateMatiereDto";

const isBlank = (s: any) => typeof s !== "string" || s.trim() === "";

export const matiereService = {
  async getMatieres(): Promise<MatiereDTO[]> {
    const daos = await matiereRepository.getAll();
    return daos.map(matiereMapper.toDTO);
  },

  async getMatiereById(id: string): Promise<MatiereDTO> {
    const dao = await matiereRepository.getById(id);
    if (!dao) {
      const e: any = new Error("Matière non trouvée");
      e.statusCode = 404;
      throw e;
    }
    return matiereMapper.toDTO(dao);
  },

  async addMatiere(dto: CreateMatiereDTO): Promise<{ id: string }> {
    if (isBlank(dto.nom)) {
      const e: any = new Error("Le nom de la matière est obligatoire.");
      e.statusCode = 400;
      throw e;
    }

    try {
      const id = await matiereRepository.insert({
        nom: dto.nom.trim(),
        volume_horaire: dto.volume_horaire ?? null,
        id_promo: dto.id_promo ?? null,
        id_specialite: dto.id_specialite ?? null,
        semestre: dto.semestre ?? null,
        nb_partiels: dto.nb_partiels ?? null,
        nb_eval_intermediaire: dto.nb_eval_intermediaire ?? null,
        heures_td: dto.heures_td ?? null,
        heures_tp: dto.heures_tp ?? null,
      });

      return { id };

    } catch (err: any) {
      if (err?.constraint === "fk_matiere_promotion") {
        const e: any = new Error("L'id de la promotion n'a pas été trouvé.");
        e.statusCode = 400; // ou 404 selon ta sémantique
        throw e;
      }

      if (err?.constraint === "fk_matiere_specialite") {
        const e: any = new Error("L'id de la spécialité n'a pas été trouvé.");
        e.statusCode = 400;
        throw e;
      }

      throw err;
    }
  },

  async updateMatiere(dto: UpdateMatiereDTO): Promise<void> {
    if (!dto.id) {
      const e: any = new Error("L'id est obligatoire.");
      e.statusCode = 400;
      throw e;
    }
    if (isBlank(dto.nom)) {
      const e: any = new Error("Le nom de la matière est obligatoire.");
      e.statusCode = 400;
      throw e;
    }

    const updated = await matiereRepository.update({
      id: String(dto.id),
      nom: dto.nom.trim(),
      volume_horaire: dto.volume_horaire ?? null,
      id_promo: dto.id_promo ?? null,
      id_specialite: dto.id_specialite ?? null,
      semestre: dto.semestre ?? null,
      nb_partiels: dto.nb_partiels ?? null,
      nb_eval_intermediaire: dto.nb_eval_intermediaire ?? null,
      heures_td: dto.heures_td ?? null,
      heures_tp: dto.heures_tp ?? null,
    });

    if (!updated) {
      const e: any = new Error(`Matière avec l'ID ${dto.id} non trouvée`);
      e.statusCode = 404;
      throw e;
    }
  },

  async deleteMatiere(id: string): Promise<void> {
    const deleted = await matiereRepository.deleteById(id);
    if (!deleted) {
      const e: any = new Error("Matière non trouvée");
      e.statusCode = 404;
      throw e;
    }
  },
};
