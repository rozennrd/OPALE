import { DisponibiliteDAO } from '../data/dao/disponibiliteDao'
import { DisponibiliteDTO } from '../domain/dto/disponibiliteDto'

export const disponibiliteMapper = {
    toDTO(dao: DisponibiliteDAO): DisponibiliteDTO {
        return { ...dao }
    },
}
