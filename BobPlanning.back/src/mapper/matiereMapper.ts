import { MatiereDAO } from "../data/dao/matiereDao";
import { MatiereDTO } from "../domain/dto/matiereDto";

export const matiereMapper = {
  toDTO(dao: MatiereDAO): MatiereDTO {
    return { ...dao };
  },
};
