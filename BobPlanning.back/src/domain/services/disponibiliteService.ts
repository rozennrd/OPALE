import { disponibiliteRepository } from '../../data/repositories/disponibiliteRepository'
import { disponibiliteMapper } from '../../mapper/disponibiliteMapper'
import { DisponibiliteDTO } from '../dto/disponibiliteDto'
import { CreateDisponibiliteDTO } from '../dto/createDisponibiliteDto'
import { UpdateDisponibiliteDTO } from '../dto/updateDisponibiliteDto'

const badRequest = (msg: string) => {
    const e: any = new Error(msg)
    e.statusCode = 400
    return e
}

const conflict = (msg: string) => {
    const e: any = new Error(msg)
    e.statusCode = 409
    return e
}

export const disponibiliteService = {
    async getDisponibilites(): Promise<DisponibiliteDTO[]> {
        const daos = await disponibiliteRepository.getAll()
        return daos.map(disponibiliteMapper.toDTO)
    },

    async getDisponibiliteById(id: string): Promise<DisponibiliteDTO> {
        const dao = await disponibiliteRepository.getById(id)
        if (!dao) {
            const e: any = new Error('Disponibilité non trouvée')
            e.statusCode = 404
            throw e
        }
        return disponibiliteMapper.toDTO(dao)
    },

    async addDisponibilite(dto: CreateDisponibiliteDTO): Promise<{ id: string }> {
        if (!dto.id_prof) throw badRequest('id_prof est obligatoire.')
        if (dto.num_semaine === undefined || dto.num_semaine === null) {
            throw badRequest('num_semaine est obligatoire.')
        }

        const week = Number(dto.num_semaine)
        if (!Number.isInteger(week) || week < 0) {
            throw badRequest('num_semaine doit être un entier >= 0.')
        }

        const alreadyExists = await disponibiliteRepository.existsByProfAndWeek(
            String(dto.id_prof),
            week,
        )
        if (alreadyExists) {
            throw conflict(
                "Impossible d'insérer : une disponibilité avec ce couple (id_prof, num_semaine) existe déjà.",
            )
        }

        try {
            const id = await disponibiliteRepository.insert({
                id_prof: String(dto.id_prof),
                num_semaine: week,
                dispo_micro: dto.dispo_micro ?? null,
            })
            return { id }
        } catch (err: any) {
            if (err?.constraint === 'uq_dispo_prof_semaine') {
                throw conflict(
                    "Impossible d'insérer : une disponibilité avec ce couple (id_prof, num_semaine) existe déjà.",
                )
            }
            if (err?.constraint === 'fk_dispo_prof') {
                throw badRequest("L'id du professeur n'a pas été trouvé.")
            }
            throw err
        }
    },

    async updateDisponibilite(dto: UpdateDisponibiliteDTO): Promise<void> {
        if (!dto.id) throw badRequest('id est obligatoire.')
        if (!dto.id_prof) throw badRequest('id_prof est obligatoire.')
        if (dto.num_semaine === undefined || dto.num_semaine === null) {
            throw badRequest('num_semaine est obligatoire.')
        }

        const week = Number(dto.num_semaine)
        if (!Number.isInteger(week) || week < 0) {
            throw badRequest('num_semaine doit être un entier >= 0.')
        }

        const duplicate =
            await disponibiliteRepository.existsByProfAndWeekExcludingId(
                String(dto.id),
                String(dto.id_prof),
                week,
            )
        if (duplicate) {
            throw conflict(
                "Impossible de mettre à jour : une disponibilité avec ce couple (id_prof, num_semaine) existe déjà.",
            )
        }

        try {
            const updated = await disponibiliteRepository.update({
                id: String(dto.id),
                id_prof: String(dto.id_prof),
                num_semaine: week,
                dispo_micro: dto.dispo_micro ?? null,
            })

            if (!updated) {
                const e: any = new Error(
                    `Disponibilité avec l'ID ${dto.id} non trouvée`,
                )
                e.statusCode = 404
                throw e
            }
        } catch (err: any) {
            if (err?.constraint === 'uq_dispo_prof_semaine') {
                throw conflict(
                    "Impossible de mettre à jour : une disponibilité avec ce couple (id_prof, num_semaine) existe déjà.",
                )
            }
            if (err?.constraint === 'fk_dispo_prof') {
                throw badRequest("L'id du professeur n'a pas été trouvé.")
            }
            throw err
        }
    },

    async deleteDisponibilite(id: string): Promise<void> {
        const deleted = await disponibiliteRepository.deleteById(id)
        if (!deleted) {
            const e: any = new Error('Disponibilité non trouvée')
            e.statusCode = 404
            throw e
        }
    },
}
