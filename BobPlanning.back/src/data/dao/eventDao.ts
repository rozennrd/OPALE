export interface EventDAO {
    id: string;
    type: string;
    nom: string;
    num_semaine: number | null;
    datetime_start: Date;
    datetime_end: Date;
    show_macro: boolean;
    show_micro: boolean;
    is_blocking: boolean;
    is_exceptional: boolean;
    is_external: boolean;
}