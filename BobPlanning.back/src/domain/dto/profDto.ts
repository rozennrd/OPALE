export interface ProfDTO {
    id?: string;
    nom: string;
    prenom: string;
    email?: string;
    email_perso?: string;
    type: 'Permanent' | 'Intervenant' | 'Invite';
    distanciel?: boolean;
    campus_origin?: 'Bordeaux' | 'Lille' | 'Chateauroux';
}