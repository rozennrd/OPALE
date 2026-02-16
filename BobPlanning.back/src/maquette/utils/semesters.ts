/**
 * Extraction des semestres/periodes/annee scolaire depuis du texte libre.
 * Utilise dans le parser pour reconstruire le contexte pedagogique.
 */
import { normalizeText } from './text';

const uniqueSorted = (values: number[]): number[] =>
  Array.from(new Set(values.filter((v) => Number.isFinite(v)))).sort((a, b) => a - b);

export const extractSemestersAndPeriods = (
  input: string,
): { semesters: number[]; periods: number[] } => {
  const semesters: number[] = [];
  const periods: number[] = [];
  const normalized = input.replace(/\u00a0/g, ' ');

  // Formats supportes: S1, S 2, S1-S2, etc.
  const semesterMatches = normalized.matchAll(/S\s*(\d{1,2})/gi);
  for (const match of semesterMatches) {
    semesters.push(Number(match[1]));
  }

  // Formats supportes: P1, P 2, etc.
  const periodMatches = normalized.matchAll(/P\s*(\d{1,2})/gi);
  for (const match of periodMatches) {
    periods.push(Number(match[1]));
  }

  if (semesters.length === 0) {
    // Fallback utile quand la cellule contient seulement "1", "2", etc.
    const onlyNumber = normalizeText(input).match(/^(\d{1,2})$/);
    if (onlyNumber) {
      semesters.push(Number(onlyNumber[1]));
    }
  }

  return {
    semesters: uniqueSorted(semesters),
    periods: uniqueSorted(periods),
  };
};

export const extractSchoolYear = (input: string): string | null => {
  // Ex: "2024-2025" ou "2024/2025".
  const match = input.match(/\b(20\d{2}\s*[-/]\s*20\d{2})\b/);
  if (!match) return null;
  return match[1].replace(/\s+/g, '');
};

export const mergeUniqueNumbers = (left: number[], right: number[]): number[] =>
  uniqueSorted([...left, ...right]);
