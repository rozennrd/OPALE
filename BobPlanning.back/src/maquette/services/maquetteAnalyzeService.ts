/**
 * Service d'analyse "read-only":
 * encapsule le parser pour separer proprement couche API et couche parsing.
 */
import { AnalyzeMaquetteOptions, MaquetteAnalyzeResult } from '../types/MaquetteExtracted';
import { parseMaquetteBuffer } from '../parser/maquetteParser';

export const maquetteAnalyzeService = {
  /**
   * Retourne la vue normalisee de la maquette sans aucune ecriture en base.
   */
  async analyze(
    buffer: Buffer,
    options: AnalyzeMaquetteOptions = {},
  ): Promise<MaquetteAnalyzeResult> {
    return parseMaquetteBuffer(buffer, options);
  },
};
