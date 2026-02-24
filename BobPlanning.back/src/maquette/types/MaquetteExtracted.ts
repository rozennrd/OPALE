/**
 * Types de reference de la feature maquette.
 *
 * Objectif:
 * - decrire un format interne stable, independant des variations Excel;
 * - rendre explicites les champs utilises par l'analyse et l'import.
 */
export type MaquetteEvaluationType =
  | 'INTERMEDIAIRE'
  | 'FINALE'
  | 'CONTROLE_CONTINU'
  | 'TRAVAUX_PRATIQUES'
  | 'PROJET'
  | 'AUTRE';

export type MaquetteSpecialiteType = 'OPTION' | 'SPECIALITE' | 'COMMUN';

export interface MaquetteEvaluation {
  // Libelle detecte dans l'entete (ex: Epreuve Finale, CC1, TP2...).
  nom: string;
  // Type normalise, utile pour le mapping vers les evenements.
  type: MaquetteEvaluationType;
  // Pondération numerique extraite de la cellule.
  poids: number;
  // Semestres portes par cette evaluation (fusion possible).
  semestres: number[];
  // Position relative de la colonne dans la feuille (quand connue).
  ordre: number | null;
  // Libelle brut conserve pour diagnostic.
  rawLabel: string;
}

export interface MaquetteExamEventDraft {
  // Informations minimales necessaires pour creer un event "examen".
  promotionCode: string;
  cycleCode: string;
  matiereNom: string;
  evaluationNom: string;
  evaluationType: MaquetteEvaluationType;
  poids: number;
  semestres: number[];
}

export interface MaquetteHeures {
  // Vue consolidee des volumes horaires detectes.
  total: number;
  totalAvecProf: number;
  coursMagistral: number;
  coursInteractif: number;
  td: number;
  tp: number;
  projet: number;
  elearning: number;
  visitesConferences: number;
  autoGere: number;
}

export interface MaquetteSourcePosition {
  // Traçabilite: feuille + ligne source de la maquette.
  sheetName: string;
  rowNumber: number;
}

export interface MaquetteMatiereLine {
  // Ligne metier normalisee issue d'une ou plusieurs lignes Excel fusionnees.
  anneeScolaire: string | null;
  cycleCode: string;
  cycleRaw: string;
  promotionCode: string;
  specialiteCode: string | null;
  specialiteLabel: string | null;
  specialiteType: MaquetteSpecialiteType | null;
  ueNom: string;
  matiereNom: string;
  semestres: number[];
  periodes: number[];
  nbSemestres: number;
  heures: MaquetteHeures;
  evaluations: MaquetteEvaluation[];
  examEventDrafts: MaquetteExamEventDraft[];
  sources: MaquetteSourcePosition[];
}

export interface MaquetteAnalyzeResult {
  // Sortie complete de l'analyse sans ecriture DB.
  matieres: MaquetteMatiereLine[];
  warnings: string[];
  metadata: {
    anneeScolaire: string | null;
    cycleRaw: string;
    cycleCode: string;
    promotions: string[];
    specialites: Array<{
      code: string;
      label: string | null;
      type: MaquetteSpecialiteType;
    }>;
    feuilles: string[];
    sectionSemesterDetections: Array<{
      sheetName: string;
      rowNumber: number;
      semestres: number[];
      rawText: string;
    }>;
  };
}

export interface AnalyzeMaquetteOptions {
  // Hints API: permettent de forcer un comportement de resolution.
  cycleHint?: string | null;
  promotionHint?: string | null;
}

export interface ImportMaquetteResult {
  // Compteurs d'import matieres.
  insertedMatieres: number;
  updatedMatieres: number;
  skippedMatieres: number;
  // Compteurs d'import evenements d'examen.
  insertedExamEvents?: number;
  skippedExamEvents?: number;
  // Alertes fonctionnelles (promos absentes, ambiguite semestre, etc.).
  warnings: string[];
  // Brouillons retournes pour audit/trace.
  examEventsToCreate: MaquetteExamEventDraft[];
}
