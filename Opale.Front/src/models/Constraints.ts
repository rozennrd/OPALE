import { DateRange } from './DateRange';

export interface Constraints {
    vacances: DateRange[];
    entreprise: DateRange[];
    stages: DateRange[];
    international: DateRange[];
    partiels: DateRange[];
    rattrapages: DateRange[];
}