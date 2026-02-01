import { ProfDTO } from '../dto/profDto';
import { profMapper } from '../../mapper/profMapper';
import { profRepository } from '../../data/repositories/profRepository';

export const profService = {
    async getProfsData(): Promise<ProfDTO[]> {
        const daos = await profRepository.getAll();
        return daos.map(profMapper.toDTO);
    },

    async getProfById(id: string): Promise<ProfDTO> {
        const dao = await profRepository.getById(id);
        if (!dao) {
            throw new Error(`Professeur avec l'ID ${id} non trouvé`);
        }
        return profMapper.toDTO(dao);
    },

    async createProf(dto: ProfDTO): Promise<ProfDTO> {
        const id = await profRepository.insert(
            dto.nom,
            dto.prenom,
            dto.email || null,
            dto.email_perso || null,
            dto.type,
            dto.distanciel || false,
            dto.campus_origin || null
        );

        return {
            id,
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            email_perso: dto.email_perso,
            type: dto.type,
            distanciel: dto.distanciel,
            campus_origin: dto.campus_origin
        };
    },

    async updateProf(dto: ProfDTO): Promise<void> {
        if (!dto.id) {
            throw new Error("L'ID du professeur est requis pour la mise à jour.");
        }

        // Vérifier que le prof existe
        await this.getProfById(dto.id);

        await profRepository.update(
            dto.id,
            dto.nom,
            dto.prenom,
            dto.email || null,
            dto.email_perso || null,
            dto.type,
            dto.distanciel || false,
            dto.campus_origin || null
        );
    },

    async deleteProf(id: string): Promise<void> {
        const rowCount = await profRepository.delete(id);
        if (rowCount === 0) {
            throw new Error('Aucun professeur trouvé avec cet ID.');
        }
    },
};