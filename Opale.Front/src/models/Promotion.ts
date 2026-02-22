import { GroupSpecialtyItem } from './GroupSpecialtyItem';
import { Constraints } from './Constraints';

export interface Promotion {
    id: string;
    label: string;
    students: number;
    startDate: string;
    endDate: string;
    isApprentissage: boolean;
    groups: GroupSpecialtyItem[];
    specialties: GroupSpecialtyItem[];
    constraints: Constraints;
}