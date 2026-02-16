/**
 * Tests unitaires de la fonctionnalite maquette.
 *
 * Axes verifies:
 * - regles de fusion de matieres (avec/sans chiffres);
 * - resolution des promotions selon cycle + semestres;
 * - priorite des codes explicites de promotion.
 */
import ExcelJS from 'exceljs';
import { parseMaquetteBuffer } from '../src/maquette/parser/maquetteParser';
import { resolvePromotionCode } from '../src/maquette/config/promotionResolver';

describe('maquette parser', () => {
  it('merges same subject names without digits and keeps numbered names separate', async () => {
    // Construction d'un mini classeur representatif des structures maquette.
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ADI');

    sheet.addRow(['2024-2025']);
    sheet.addRow(['Cycle : ADIMAKER 1ere et 2eme annee']);
    sheet.addRow(['SEMESTRE 1']);
    sheet.addRow([
      "Unite d'Enseignements (UE)",
      "Modules constituant l'UE",
      'Semestre / Periode',
      'Nb Heures planifiees etudiant module',
      'Nb Heures encadrees etudiant module',
      'Cours magistral',
      'Cours interactif',
      'TD',
      'TP',
      'Projet',
      'E-learning',
      'Epreuve Interm.',
      'Epreuve Finale',
    ]);
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([
      'UE Maths',
      'Math',
      'S1',
      10,
      8,
      2,
      2,
      3,
      1,
      0,
      0,
      30,
      70,
    ]);
    sheet.addRow(['', 'Math', 'S2', 12, 10, 3, 2, 4, 1, 0, 0, 20, 80]);
    sheet.addRow(['', 'Math1', 'S1', 8, 8, 2, 1, 2, 1, 0, 0, 20, 80]);
    sheet.addRow(['', 'Math2', 'S2', 9, 9, 2, 1, 3, 1, 0, 0, 25, 75]);
    sheet.addRow(['TOTAL SEMESTRE 1']);

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await parseMaquetteBuffer(buffer, { cycleHint: 'ADI' });

    // Attendu metier: "Math" fusionne, "Math1/Math2" restent distinctes.
    expect(result.matieres).toHaveLength(3);

    const mergedMath = result.matieres.find((matiere) => matiere.matiereNom === 'Math');
    expect(mergedMath).toBeDefined();
    expect(mergedMath?.semestres).toEqual([1, 2]);
    expect(mergedMath?.nbSemestres).toBe(2);

    const math1 = result.matieres.find((matiere) => matiere.matiereNom === 'Math1');
    const math2 = result.matieres.find((matiere) => matiere.matiereNom === 'Math2');
    expect(math1?.nbSemestres).toBe(1);
    expect(math2?.nbSemestres).toBe(1);
  });
});

describe('promotion resolver', () => {
  it('resolves AP3/AP4/AP5 using legacy semester mapping for AP', () => {
    // Mapping AP historique base sur les blocs de semestres.
    const ap3 = resolvePromotionCode({
      cycleRaw: 'Cycle : FISA',
      sheetName: 'Maquette AP',
      semestres: [5],
    });
    const ap4 = resolvePromotionCode({
      cycleRaw: 'Cycle : FISA',
      sheetName: 'Maquette AP',
      semestres: [8],
    });
    const ap5 = resolvePromotionCode({
      cycleRaw: 'Cycle : FISA',
      sheetName: 'Maquette AP',
      semestres: [10],
    });

    expect(ap3.promotionCode).toBe('AP3');
    expect(ap4.promotionCode).toBe('AP4');
    expect(ap5.promotionCode).toBe('AP5');
  });

  it('prioritizes an explicit promotion code like APS5 when present', () => {
    // Un code explicite dans la feuille/cycle doit rester prioritaire.
    const resolved = resolvePromotionCode({
      cycleRaw: 'Cycle : APS5',
      sheetName: 'APS5',
      semestres: [1],
    });

    expect(resolved.promotionCode).toBe('APS5');
  });
});
