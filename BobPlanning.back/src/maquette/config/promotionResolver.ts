/**
 * Resolution cycle/promotion pour des maquettes heterogenes.
 *
 * Priorites appliquees:
 * 1) hints API explicites (cycleHint/promotionHint);
 * 2) code promo explicite detecte dans la feuille ou le libelle cycle;
 * 3) heuristique standard par paire de semestres (S1/S2->1 ... S9/S10->5);
 * 4) fallback generique.
 */
import { normalizeText, toUpperNoSpace } from '../utils/text';

export interface PromotionResolverInput {
  // Hint issu de l'API (souvent fourni par le front).
  cycleHint?: string | null;
  // Hint explicite de promotion, prioritaire s'il est renseigne.
  promotionHint?: string | null;
  // Texte brut du cycle detecte dans la maquette.
  cycleRaw: string;
  // Nom d'onglet (souvent porteur de codes type CIR1, APS5...).
  sheetName: string;
  // Semestres detectes sur la ligne matiere.
  semestres: number[];
}

// Extrait un code de type AP4/CIR2/APS5 mais ignore S1/P2.
const extractExplicitPromotion = (text: string): string | null => {
  const matches = text.toUpperCase().match(/\b[A-Z]{2,}\d{1,2}\b/g);
  if (!matches || matches.length === 0) return null;

  const filtered = matches.filter((token) => !/^S\d+$/.test(token) && !/^P\d+$/.test(token));
  return filtered[0] ?? null;
};

const inferCycleCode = (cycleHint: string | null | undefined, cycleRaw: string): string => {
  // Si un cycle est force en entree API, on ne tente pas d'heuristique.
  if (cycleHint && cycleHint.trim()) return toUpperNoSpace(cycleHint.trim());

  // Heuristique tolerant aux variations d'accents/ponctuation.
  const normalized = normalizeText(cycleRaw);
  if (normalized.includes('adi')) return 'ADI';
  if (normalized.includes('cir')) return 'CIR';
  if (normalized.includes('isen')) return 'ISEN';
  if (normalized.includes('fisa') || normalized.includes('apprentissage')) return 'AP';
  return 'CYCLE';
};

const resolveSemesterPairPromotion = (
  cycleCode: string,
  semestres: number[],
): string | null => {
  // Regle "par annee": max semestre/2 arrondi superieur.
  if (semestres.length === 0) return null;
  const maxSem = Math.max(...semestres);
  const yearIndex = Math.max(1, Math.ceil(maxSem / 2));
  return `${cycleCode}${yearIndex}`;
};

const resolveSemesterExactPromotion = (
  cycleCode: string,
  semestres: number[],
): string | null => {
  // Fallback "par semestre exact" (ex: ADI1 si minSem=1).
  if (semestres.length === 0) return null;
  const minSem = Math.min(...semestres);
  return `${cycleCode}${minSem}`;
};

export const resolvePromotionCode = (
  input: PromotionResolverInput,
): { cycleCode: string; promotionCode: string } => {
  // 1) Resolution du cycle.
  const cycleCode = inferCycleCode(input.cycleHint, input.cycleRaw);

  // 2) Promotion forcee explicitement par l'appel API.
  if (input.promotionHint && input.promotionHint.trim()) {
    return {
      cycleCode,
      promotionCode: toUpperNoSpace(input.promotionHint.trim()),
    };
  }

  // 3) Promotion explicite detectee dans le nom d'onglet.
  const explicitInSheet = extractExplicitPromotion(input.sheetName);
  if (explicitInSheet) {
    return {
      cycleCode,
      promotionCode: explicitInSheet,
    };
  }

  // 4) Promotion explicite detectee dans le texte cycle.
  const explicitInCycle = extractExplicitPromotion(input.cycleRaw);
  if (explicitInCycle) {
    return {
      cycleCode,
      promotionCode: explicitInCycle,
    };
  }

  // 5) Heuristique standard par paire de semestres:
  // S1/S2 -> Cycle1, S3/S4 -> Cycle2, ... S9/S10 -> Cycle5.
  const perYear = resolveSemesterPairPromotion(cycleCode, input.semestres);
  if (perYear) {
    return {
      cycleCode,
      promotionCode: perYear,
    };
  }

  // 6) Fallback generique.
  const perSemester = resolveSemesterExactPromotion(cycleCode, input.semestres);
  return {
    cycleCode,
    promotionCode: perSemester ?? cycleCode,
  };
};
