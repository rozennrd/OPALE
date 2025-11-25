import { Promotion } from './Promotion';

export interface Cycle {
    id: string;
    name: string;
    promotions: Promotion[];
}
