export interface ProfDAO {
    id: string;
    nom: string;
    prenom: string;
    email: string | null;
    type: 'permanent' | 'intervenant' | 'invite';
    distanciel: boolean;
}
