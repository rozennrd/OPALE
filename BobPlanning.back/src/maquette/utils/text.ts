/**
 * Utilitaires de normalisation texte.
 * Ces helpers servent a rendre robustes les comparaisons sur les entetes Excel.
 */
export const normalizeText = (value: string): string => {
  // Etapes: suppression accents + ponctuation + espaces multiples + lowercase.
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2019']/g, ' ')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[.,;:!?%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

export const toUpperNoSpace = (value: string): string => {
  // Cle compacte pour comparaison de codes (ex: "AP 4" -> "AP4").
  return value.replace(/\s+/g, '').toUpperCase();
};

// Regle de fusion metier: un chiffre dans le nom force une ligne distincte.
export const hasDigit = (value: string): boolean => /\d/.test(value);
