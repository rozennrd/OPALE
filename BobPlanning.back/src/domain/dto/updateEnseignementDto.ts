// domain/dto/updateEnseignementDto.ts
import { CreateEnseignementDTO } from './createEnseignementDto';

export interface UpdateEnseignementDTO extends CreateEnseignementDTO {
  id: string;
}
