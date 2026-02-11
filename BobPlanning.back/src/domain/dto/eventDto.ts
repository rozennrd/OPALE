export type TypeEvent = 'Cours'| 'Entreprise'| 'Examen'| 'Reunion'| 'Fermeture'| 'Soutenance'| 'JPO'| 'Stage'| 'Mobilite'| 'PFE'| 'Rattrapage'| 'Conference'| 'Rentrée'| 'Réunion parents'| 'Journée Immersion'| 'Concours'| 'Salon'| 'Fin des cours'| 'Autre';

export interface EventDTO {
    id?: string;
    type: TypeEvent;
    nom: string;
    description: string;
    num_semaine?: number;
    datetime_start: Date;
    datetime_end: Date;
    show_macro?: boolean;
    show_micro?: boolean;
    is_blocking?: boolean;
    is_exceptional?: boolean;
    is_external?: boolean;
}