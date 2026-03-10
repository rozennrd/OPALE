import { ProfDAO } from "../data/dao/profDao";
import { ProfDTO } from "../domain/dto/profDto";

const normalizeType = (value: string): ProfDTO['type'] => {
    const raw = (value ?? '').trim().toLowerCase();
    if (raw === 'intervenant') return 'Intervenant';
    if (raw === 'invite' || raw === 'invité') return 'Invite';
    return 'Permanent';
};

const normalizeModalite = (value?: string | null): ProfDTO['modalite_enseignement'] => {
    const raw = (value ?? '').trim().toLowerCase();
    if (raw === 'distanciel') return 'Distanciel';
    if (raw === 'hybride') return 'Hybride';
    return 'Présentiel';
};

const normalizeCampus = (value?: string | null): ProfDTO['campus_origin'] => {
    const raw = (value ?? '').trim().toLowerCase();
    if (raw === 'lille') return 'Lille';
    if (raw === 'chateauroux' || raw === 'châteauroux') return 'Chateauroux';
    return 'Bordeaux';
};

export const profMapper = {
    toDTO(dao: ProfDAO): ProfDTO {
        return {
            id: dao.id,
            nom: dao.nom,
            prenom: dao.prenom,
            email: dao.email,
            email_perso: dao.email_perso,
            telephone: dao.telephone,
            type: normalizeType(dao.type),
            modalite_enseignement: normalizeModalite(dao.modalite_enseignement),
            campus_origin: normalizeCampus(dao.campus_origin)
        };
    },
};