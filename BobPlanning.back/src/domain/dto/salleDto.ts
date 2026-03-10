export interface SalleDTO {
  id: string;
  nom: string;
  nom_complet: string | null;
  type_principal: string;
  types_secondaires: string[] | null;
  etage: number;
  capacite: number;
  description: string | null;
  utilisable: boolean;
}
