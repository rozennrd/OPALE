import { localisationRepository } from '../../data/repositories/localisationRepository';
import { localisationMapper } from '../../mapper/localisationMapper';
import { LocalisationDTO } from '../dto/localisationDto';

export const localisationService = {
    // Récupère toutes les localisations
    async getAllLocalisations(): Promise<LocalisationDTO[]> {
        const daos = await localisationRepository.getAll();
        return daos.map(localisationMapper.toDTO);
    },

    // Récupère les salles d'un événement
    async getLocalisationsByEvent(id_event: string): Promise<LocalisationDTO[]> {
        const daos = await localisationRepository.getByEventId(id_event);
        return daos.map(localisationMapper.toDTO);
    },

    // Récupère les événements d'une salle
    async getLocalisationsBySalle(id_salle: string): Promise<LocalisationDTO[]> {
        const daos = await localisationRepository.getBySalleId(id_salle);
        return daos.map(localisationMapper.toDTO);
    },

    // Récupère une localisation par son ID
    async getLocalisationById(id: string): Promise<LocalisationDTO> {
        const dao = await localisationRepository.getById(id);
        if (!dao) {
            const err: any = new Error(`Localisation avec l'ID ${id} non trouvée`);
            err.statusCode = 404;
            throw err;
        }
        return localisationMapper.toDTO(dao);
    },

    // Crée une nouvelle localisation
    async addLocalisation(dto: LocalisationDTO): Promise<LocalisationDTO> {
        // Vérifie si la localisation existe déjà
        const exists = await localisationRepository.exists(dto.id_salle, dto.id_event);
        if (exists) {
            const err: any = new Error("Cette salle est déjà associée à cet événement");
            err.statusCode = 409;
            throw err;
        }

        const id = await localisationRepository.insert(dto.id_salle, dto.id_event);

        return {
            id,
            id_salle: dto.id_salle,
            id_event: dto.id_event,
        };
    },

    // Met à jour une localisation existante
    async updateLocalisation(dto: LocalisationDTO): Promise<void> {
        if (!dto.id) {
            const err: any = new Error("L'ID de la localisation est requis pour la mise à jour");
            err.statusCode = 400;
            throw err;
        }

        // Vérifie que la localisation existe
        const existing = await localisationRepository.getById(dto.id);
        if (!existing) {
            const err: any = new Error(`Localisation avec l'ID ${dto.id} non trouvée`);
            err.statusCode = 404;
            throw err;
        }

        // Vérifie si la nouvelle combinaison salle/event existe déjà (sauf si c'est la même)
        if (existing.id_salle !== dto.id_salle || existing.id_event !== dto.id_event) {
            const exists = await localisationRepository.exists(dto.id_salle, dto.id_event);
            if (exists) {
                const err: any = new Error("Cette salle est déjà associée à cet événement");
                err.statusCode = 409;
                throw err;
            }
        }

        const updated = await localisationRepository.update(dto.id, dto.id_salle, dto.id_event);
        if (!updated) {
            const err: any = new Error(`Impossible de mettre à jour la localisation`);
            err.statusCode = 500;
            throw err;
        }
    },

    // Supprime une localisation par son ID
    async deleteLocalisation(id: string): Promise<void> {
        const deleted = await localisationRepository.deleteById(id);
        if (!deleted) {
            const err: any = new Error(`Localisation avec l'ID ${id} non trouvée`);
            err.statusCode = 404;
            throw err;
        }
    },

    // Supprime toutes les localisations d'un événement
    async deleteLocalisationsByEvent(id_event: string): Promise<number> {
        return await localisationRepository.deleteByEventId(id_event);
    },

    // Supprime toutes les localisations d'une salle
    async deleteLocalisationsBySalle(id_salle: string): Promise<number> {
        return await localisationRepository.deleteBySalleId(id_salle);
    },
};