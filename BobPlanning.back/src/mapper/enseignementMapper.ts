// mapper/enseignementMapper.ts
import { EnseignementDAO } from "../data/dao/enseignementDao";
import { EnseignementDTO } from "../domain/dto/enseignementDto";

export const enseignementMapper = {
  toDTO(dao: EnseignementDAO): EnseignementDTO {
    return { ...dao };
  },
};
