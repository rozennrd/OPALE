import { SpecialiteDTO } from '../dto/specialiteDto';
import { specialiteMapper } from '../../mapper/specialiteMapper';
import { specialiteRepository } from '../../data/repositories/specialiteRepository';

export const specialiteService = {
    async getSpecialites(): Promise<SpecialiteDTO[]> {
        const daos = await specialiteRepository.getAll();
        return daos.map(specialiteMapper.toDTO);
    },

    async getSpecialiteById(id: string): Promise<SpecialiteDTO> {
        const dao = await specialiteRepository.getById(id);
        if (!dao) {
            throw new Error(`Spécialité avec l'ID ${id} non trouvée`);
        }
        return specialiteMapper.toDTO(dao);
    },

    async createSpecialite(dto: SpecialiteDTO): Promise<SpecialiteDTO> {
        const id = await specialiteRepository.insert(
            dto.id_groupe,
            dto.id_promo,
            dto.nom,
            dto.effectifs
        );

        return {
            id,
            id_groupe: dto.id_groupe,
            id_promo: dto.id_promo,
            nom: dto.nom,
            effectifs: dto.effectifs,
        };
    },

    async updateSpecialite(dto: SpecialiteDTO): Promise<void> {
        if (!dto.id) {
            throw new Error("L'ID de la spécialité est requis pour la mise à jour.");
        }

        // Vérifier que la spécialité existe
        await this.getSpecialiteById(dto.id);

        await specialiteRepository.update(
            dto.id,
            dto.id_groupe,
            dto.id_promo,
            dto.nom,
            dto.effectifs
        );
    },

    async deleteSpecialite(id: string): Promise<void> {
        const rowCount = await specialiteRepository.delete(id);
        if (rowCount === 0) {
            throw new Error('Aucune spécialité trouvée avec cet ID.');
        }
    },
};