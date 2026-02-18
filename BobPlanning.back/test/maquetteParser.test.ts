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

  it('uses module hour columns when UE and module hour headers are duplicated', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('AP');

    sheet.addRow(['2024-2025']);
    sheet.addRow(['Cycle : ISEN FISA']);
    sheet.addRow(['SEMESTRE 5']);
    sheet.addRow([
      "Unite d'Enseignements (UE)",
      'Nb Heures etudiant UE',
      'Nb heures planifiees etudiant UE',
      'Nb Heures encadrees etudiant UE',
      "Modules constituant l'UE",
      'Semestre / Periode',
      'Nb Heures etudiant module',
      'Nb heures planifiees etudiant module',
      'Nb Heures encadrees etudiant module',
      'Cours magistral',
      'Cours interactif',
      'TD',
      'TP',
    ]);
    // Respecte la structure observee: les en-tetes sont souvent suivies de lignes vides.
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([
      'UE Systeme',
      999, // UE
      888, // UE
      777, // UE
      'Reseaux',
      'S5',
      10, // module
      20, // module
      30, // module
      0,
      0,
      0,
      0,
    ]);
    sheet.addRow(['TOTAL SEMESTRE 5']);

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await parseMaquetteBuffer(buffer, { cycleHint: 'AP' });

    expect(result.matieres).toHaveLength(1);
    const matiere = result.matieres[0];
    // "total" priorise "nbHeuresPlanifiees*" -> doit venir de la zone module (20), pas UE (888).
    expect(matiere.heures.total).toBe(20);
    // "totalAvecProf" doit venir de "nbHeuresEncadrees*" module (30), pas UE (777).
    expect(matiere.heures.totalAvecProf).toBe(30);
  });

  it('detects option blocks and propagates option context to nested module rows', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ISEN5');

    sheet.addRow(['2025-2026']);
    sheet.addRow(['Cycle : ISEN campus Bordeaux - FISA']);
    sheet.addRow(['SEMESTRE 9 et 10']);
    sheet.addRow([
      'Option',
      "Unite d'Enseignements (UE)",
      "Modules constituant l'UE",
      'Semestre / Periode',
      'Nb Heures planifiees etudiant module',
      'Nb Heures encadrees etudiant module',
      'Cours interactif',
      'TD',
      'TP',
      'Projet',
      'E-learning',
      'Epreuve Finale',
    ]);
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([
      'Option 1',
      'Cyber Securite',
      'Cryptographie',
      'S9',
      28,
      28,
      28,
      0,
      0,
      0,
      0,
      100,
    ]);
    sheet.addRow([
      '',
      '',
      'Pentesting',
      'S10',
      28,
      28,
      4,
      0,
      24,
      0,
      0,
      100,
    ]);
    sheet.addRow([
      'Option 2',
      'Developpement logiciel',
      'Java EE',
      'S10',
      28,
      28,
      14,
      0,
      14,
      0,
      0,
      100,
    ]);
    sheet.addRow(['TOTAL SEMESTRE 10']);

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await parseMaquetteBuffer(buffer, { cycleHint: 'AP' });

    expect(result.matieres).toHaveLength(3);

    const cryptographie = result.matieres.find((matiere) => matiere.matiereNom === 'Cryptographie');
    const pentesting = result.matieres.find((matiere) => matiere.matiereNom === 'Pentesting');
    const javaEE = result.matieres.find((matiere) => matiere.matiereNom === 'Java EE');

    expect(cryptographie?.specialiteType).toBe('OPTION');
    expect(cryptographie?.specialiteCode).toBe('OPTION_1');
    expect(cryptographie?.specialiteLabel).toBe('Cyber Securite');

    // Doit heriter du contexte "Option 1" meme si la ligne ne porte plus le marqueur.
    expect(pentesting?.specialiteType).toBe('OPTION');
    expect(pentesting?.specialiteCode).toBe('OPTION_1');
    expect(pentesting?.specialiteLabel).toBe('Cyber Securite');

    expect(javaEE?.specialiteType).toBe('OPTION');
    expect(javaEE?.specialiteCode).toBe('OPTION_2');
    expect(javaEE?.specialiteLabel).toBe('Developpement logiciel');

    expect(result.metadata.specialites).toEqual([
      { code: 'OPTION_1', label: 'Cyber Securite', type: 'OPTION' },
      { code: 'OPTION_2', label: 'Developpement logiciel', type: 'OPTION' },
    ]);
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
