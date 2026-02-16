/**
 * Utilitaires de lecture de cellule ExcelJS.
 *
 * But:
 * - homogeniser la conversion des types Excel vers string/number;
 * - limiter les cas particuliers dans le parser principal.
 */
import ExcelJS from 'exceljs';

const trimText = (value: string): string => value.replace(/\u00a0/g, ' ').trim();

export const extractCellText = (
  value: ExcelJS.CellValue | null | undefined,
): string => {
  // Cas simples.
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return trimText(value);
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    // RichText: concatene les fragments de style.
    if ('richText' in value && Array.isArray(value.richText)) {
      const text = value.richText.map((part) => part.text ?? '').join('');
      return trimText(text);
    }
    if ('text' in value && typeof value.text === 'string') {
      return trimText(value.text);
    }
    if ('result' in value) {
      // Formule: reutilise la meme logique sur le resultat calcule.
      return extractCellText(value.result as ExcelJS.CellValue | null | undefined);
    }
    if ('hyperlink' in value && typeof value.hyperlink === 'string') {
      return trimText(value.hyperlink);
    }
  }

  return '';
};

export const extractCellNumber = (
  value: ExcelJS.CellValue | null | undefined,
): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;

  const text = extractCellText(value);
  if (!text) return 0;

  // Normalisation large (espaces, %, virgule decimale, caracteres parasites).
  const normalized = text
    .replace(/\u00a0/g, '')
    .replace(/\s+/g, '')
    .replace(/%/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');

  if (!normalized) return 0;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};
