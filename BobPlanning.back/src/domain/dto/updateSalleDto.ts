export interface UpdateSalleDto {
  id: string;
  nom: string;
  nom_complet?: string | null;
  type_principal: string;
  types_secondaires?: string[] | null;
  etage: number;
  capacite: number;
  utilisable: boolean;
  description?: string | null;
}
