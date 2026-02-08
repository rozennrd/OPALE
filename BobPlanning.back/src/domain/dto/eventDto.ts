export type TypeEvent = 'cours' | 'entreprise' | 'examen' | 'reunion' | 'fermeture' | 'soutenance' | 'portes ouvertes' | 'stage' | 'mobilite' | 'PFE' | 'rattrapage' | 'autre';

export interface EventDTO {
    id?: string;
    type: TypeEvent;
    nom: string;
    num_semaine?: number;
    datetime_start: Date;
    datetime_end: Date;
    show_macro?: boolean;
    show_micro?: boolean;
    is_blocking?: boolean;
    is_exceptional?: boolean;
    is_external?: boolean;
}