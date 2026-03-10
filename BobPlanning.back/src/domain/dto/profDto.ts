export interface ProfDTO {
    id?: string;
    nom: string;
    prenom: string;
    email?: string;
    email_perso?: string;
    telephone?: string;
    type: 'Permanent' | 'Intervenant' | 'Invite';
    modalite_enseignement?: 'Distanciel' | 'Hybride' | 'Présentiel';
    campus_origin?: 'Bordeaux' | 'Lille' | 'Chateauroux';
}