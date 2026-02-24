/**
 * Parser principal des maquettes Excel (xlsx/xlsm).
 *
 * Objectif:
 * - transformer des feuilles heterogenes en un modele unique;
 * - retrouver promotions/cycles/semestres/evaluations de maniere robuste;
 * - preparer une sortie directement exploitable par l'import DB.
 */
import ExcelJS from 'exceljs';
import { resolvePromotionCode } from '../config/promotionResolver';
import {
  AnalyzeMaquetteOptions,
  MaquetteAnalyzeResult,
  MaquetteEvaluation,
  MaquetteEvaluationType,
  MaquetteExamEventDraft,
  MaquetteMatiereLine,
  MaquetteSpecialiteType,
} from '../types/MaquetteExtracted';
import { extractCellNumber, extractCellText } from '../utils/cell';
import { extractSchoolYear, extractSemestersAndPeriods, mergeUniqueNumbers } from '../utils/semesters';
import { hasDigit, normalizeText } from '../utils/text';

interface HeaderMap {
  // Index de colonnes detectees dynamiquement.
  specialiteTrackCol: number | null;
  ueCol: number | null;
  moduleCol: number | null;
  semPeriodeCol: number | null;
  nbHeuresEtudiantCol: number | null;
  nbHeuresPlanifieesCol: number | null;
  nbHeuresEncadreesCol: number | null;
  coursMagistralCol: number | null;
  coursInteractifCol: number | null;
  tdCol: number | null;
  tpCol: number | null;
  projetCol: number | null;
  elearningCol: number | null;
  visitesConferencesCol: number | null;
  autoGereCol: number | null;
  evaluationCols: Array<{ col: number; label: string }>;
}

interface ParseRowContext {
  // Contexte evolutif pendant le scan d'une feuille.
  currentUE: string;
  cycleRaw: string;
  sectionSemesters: number[];
  // Derniere specialite/option detectee afin de la propager aux lignes filles
  // qui n'affichent pas explicitement le marqueur.
  currentSpecialite: DetectedSpecialite | null;
}

interface DetectedSpecialite {
  // Code technique stable pour fusionner/identifier les lignes
  // (ex: OPTION_1, SPECIALITE_CYBER_SECURITE, COMMUN).
  code: string;
  // Libelle metier lisible (peut etre absent pour "Option 1" sans intitule).
  label: string | null;
  // Type normalise du bloc detecte.
  type: MaquetteSpecialiteType;
  // Valeur brute telle qu'elle apparait dans la maquette.
  rawLabel: string;
}

// Alias d'entetes connus, issus des variantes constatees dans les maquettes.
const HEADER_ALIAS = {
  specialiteTrack: ['specialite', 'option', 'parcours', 'majeure', 'mineure'],
  ue: ["unite d enseignements ue", "unite d enseignements", "matieres", "matiere"],
  module: ["modules constituant l ue", 'modules', 'module', 'matiere', 'matieres'],
  semPeriode: ['semestre / periode', 'semestre periode', 'semestre'],
  nbHeuresEtudiant: [
    'nb heures etudiant module',
    'nb heures etudiant',
    'nb heures modules',
    'volume annuel',
  ],
  nbHeuresPlanifiees: [
    'nb heures planifiees etudiant module',
    'nb heures planifiees',
    'nb heures planifiees etudiant ue',
  ],
  nbHeuresEncadrees: [
    'nb heures encadrees etudiant module',
    'nb heures encadrees',
    'nb heures encadrees etudiant ue',
  ],
  coursMagistral: ['cours magistral'],
  coursInteractif: ['cours interactif'],
  td: ['td', 'cours td'],
  tp: ['tp'],
  projet: ['projet', 'heures projet', 'travaux de projet'],
  // "digitalise" est traite comme alias de e-learning, pas comme type horaire distinct.
  elearning: ['e learning', 'e-learning', 'elearning', 'digitalise', 'elearning asynchrone'],
  visitesConferences: [
    'visites / conferences',
    'visites conferences',
    'visites conference',
    'visites et conferences',
    'visites & conferences',
  ],
  autoGere: ['auto gere'],
};

const ENTREPRISE_MODULE_ALIASES = new Set<string>([
  'entreprise',
  'entrprise',
  'en entreprise',
  'periode entreprise',
  'periodes entreprise',
  'periode en entreprise',
  'periodes en entreprise',
  'stage entreprise',
  'stages entreprise',
  'stage en entreprise',
  'stages en entreprise',
  'mission entreprise',
  'missions entreprise',
  'mission en entreprise',
  'missions en entreprise',
]);

const isEntrepriseModuleLabel = (rawLabel: string): boolean => {
  // Ignore les lignes "entreprise" (periodes/stages/missions) qui ne sont pas
  // des matieres a importer.
  const normalized = normalizeText(rawLabel)
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return false;

  if (ENTREPRISE_MODULE_ALIASES.has(normalized)) return true;

  if (/^periodes?\s+(en\s+)?entr[e]?prise(s)?$/.test(normalized)) return true;
  if (/^(stages?|missions?)\s+(en\s+)?entr[e]?prise(s)?$/.test(normalized)) return true;

  return false;
};

const MAX_HEADER_SCAN_ROWS = 3;
const DEFAULT_MAX_SCAN_COLUMNS = 90;

// Une ligne "Cycle : ..." met a jour le contexte cycle en cours.
const isCycleDescriptorRow = (rawCombinedText: string): boolean => {
  return /^\s*cycle\s*:/i.test(rawCombinedText);
};

const getMaxColumnCount = (worksheet: ExcelJS.Worksheet): number => {
  return Math.max(worksheet.columnCount, DEFAULT_MAX_SCAN_COLUMNS);
};

const getCombinedRowText = (
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  maxCol: number,
): string => {
  const row = worksheet.getRow(rowNumber);
  const cells: string[] = [];
  for (let col = 1; col <= maxCol; col += 1) {
    const text = extractCellText(row.getCell(col).value);
    if (text) cells.push(text);
  }
  return cells.join(' ');
};

const buildHeaderByColumn = (
  worksheet: ExcelJS.Worksheet,
  startRowNumber: number,
  maxCol: number,
): { normalized: string[]; raw: string[] } => {
  // Les entetes peuvent etre fusionnes sur 2-3 lignes: on concatene.
  const normalized: string[] = Array(maxCol + 1).fill('');
  const raw: string[] = Array(maxCol + 1).fill('');

  for (let col = 1; col <= maxCol; col += 1) {
    const rawParts: string[] = [];
    for (let offset = 0; offset < MAX_HEADER_SCAN_ROWS; offset += 1) {
      const text = extractCellText(worksheet.getRow(startRowNumber + offset).getCell(col).value);
      if (text) rawParts.push(text);
    }
    const rawHeader = rawParts.join(' ').trim();
    raw[col] = rawHeader;
    normalized[col] = normalizeText(rawHeader);
  }

  return { normalized, raw };
};

const findColumnByAliases = (
  headers: string[],
  aliases: string[],
  options: { fromCol?: number } = {},
): number | null => {
  // Recherche sequentielle d'une colonne en appliquant des alias tolerants.
  // "fromCol" permet d'ignorer un premier bloc de colonnes homonymes
  // (ex: heures UE) pour recuperer le bloc utile (ex: heures module).
  const startCol = Math.max(1, options.fromCol ?? 1);
  for (let col = startCol; col < headers.length; col += 1) {
    const header = headers[col];
    if (!header) continue;
    if (aliases.some((alias) => header.includes(alias))) {
      return col;
    }
  }
  return null;
};

const buildOptionSpecialite = (
  optionIndex: number,
  label: string | null,
  rawLabel: string,
): DetectedSpecialite => {
  // Constructeur central des blocs "Option N"
  // pour garder un format homogene partout dans le parser.
  return {
    code: `OPTION_${optionIndex}`,
    label,
    type: 'OPTION',
    rawLabel,
  };
};

const toSpecialiteCode = (rawLabel: string): string => {
  // Normalise un libelle libre vers un identifiant deterministic
  // utilisable en cle technique et en fusion.
  const normalized = normalizeText(rawLabel)
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 'SPECIALITE';
  return `SPECIALITE_${normalized.replace(/\s+/g, '_').toUpperCase()}`;
};

const parseSpecialiteMarker = (rawText: string): DetectedSpecialite | null => {
  // Interprete un texte brut (cellule) et renvoie une specialite si detectee.
  // Cas pris en charge:
  // - tronc commun / commun
  // - option numerotee (Option 1, Option 2...)
  // - specialite/parcours/majeure/mineure.
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const normalized = normalizeText(trimmed);
  if (!normalized) return null;

  if (
    normalized.includes('tronc commun') ||
    normalized === 'commun' ||
    normalized.startsWith('commun ')
  ) {
    return {
      code: 'COMMUN',
      label: 'Commun',
      type: 'COMMUN',
      rawLabel: trimmed,
    };
  }

  const optionMatch = normalized.match(/\boption\s*(\d{1,2})\b/);
  if (optionMatch) {
    const index = Number(optionMatch[1]);
    // On retire le prefixe "Option N" pour ne garder que le libelle metier.
    const labelCandidate = trimmed
      .replace(/option\s*\d{1,2}\s*[:\-–—]?\s*/i, '')
      .trim();
    const label = labelCandidate ? labelCandidate : null;
    return buildOptionSpecialite(index, label, trimmed);
  }

  if (['specialite', 'parcours', 'majeure', 'mineure'].some((token) => normalized.includes(token))) {
    const labelCandidate = trimmed
      .replace(/(specialite|parcours|majeure|mineure)\s*[:\-–—]?\s*/i, '')
      .trim();
    const label = labelCandidate || trimmed;
    return {
      code: toSpecialiteCode(label),
      label,
      type: 'SPECIALITE',
      rawLabel: trimmed,
    };
  }

  return null;
};

const parseSpecialiteFromTrackCell = (trackCell: string): DetectedSpecialite | null => {
  // Priorite 1: interpretation directe du contenu (Option 1, Specialite X...).
  const marker = parseSpecialiteMarker(trackCell);
  if (marker) return marker;

  // Priorite 2: colonnes "track" parfois limitees a un numero seul ("1", "2"...).
  const numericOption = trackCell.trim().match(/^(\d{1,2})$/);
  if (!numericOption) return null;

  return buildOptionSpecialite(Number(numericOption[1]), null, `Option ${numericOption[1]}`);
};

const resolveRowSpecialite = (params: {
  trackCell: string;
  leftOfUeCell: string;
  ueCell: string;
}): DetectedSpecialite | null => {
  // Strategie de resolution par priorite:
  // 1) colonne dediee specialite/option
  // 2) cellule a gauche de l'UE
  // 3) cellule UE elle-meme.
  const fromTrack = parseSpecialiteFromTrackCell(params.trackCell);
  const fromLeftOfUe = parseSpecialiteMarker(params.leftOfUeCell);
  const fromUe = parseSpecialiteMarker(params.ueCell);

  const candidate = fromTrack ?? fromLeftOfUe ?? fromUe;
  if (!candidate) return null;

  // Cas frequent: "Option 1" dans une colonne et libelle de specialite dans la cellule UE.
  if (!candidate.label && params.ueCell.trim()) {
    const ueMarker = parseSpecialiteMarker(params.ueCell);
    if (!ueMarker) {
      candidate.label = params.ueCell.trim();
      if (candidate.type === 'SPECIALITE') {
        candidate.code = toSpecialiteCode(candidate.label);
      }
    }
  }

  return candidate;
};

const detectEvaluationLabel = (headerNormalized: string): string | null => {
  // Mapping tolerant des libelles d'evaluations vers un label stable.
  if (!headerNormalized) return null;

  if (headerNormalized.includes('epreuve interm') || headerNormalized.includes('ds intermediaire')) {
    return 'Epreuve Interm.';
  }
  if (headerNormalized.includes('epreuve finale')) {
    return 'Epreuve Finale';
  }
  if (headerNormalized.includes('exam 1') || headerNormalized === 'exam1') {
    return 'Exam 1';
  }
  if (headerNormalized.includes('exam 2') || headerNormalized === 'exam2') {
    return 'Exam 2';
  }

  const ccMatch = headerNormalized.match(/\bcc\s*(\d+)\b/);
  if (ccMatch) return `CC${ccMatch[1]}`;

  const tpMatch = headerNormalized.match(/\btp\s*(\d+)\b/);
  if (tpMatch) return `TP${tpMatch[1]}`;

  if (/\brap\b/.test(headerNormalized)) return 'Rap.';
  if (/\bsout\b/.test(headerNormalized)) return 'Sout.';
  if (/\bproj\b/.test(headerNormalized)) return 'Proj.';

  return null;
};

const buildHeaderMap = (
  worksheet: ExcelJS.Worksheet,
  headerRowNumber: number,
): HeaderMap => {
  // Detecte toutes les colonnes metier utiles dans une feuille.
  const maxCol = getMaxColumnCount(worksheet);
  const headers = buildHeaderByColumn(worksheet, headerRowNumber, maxCol);

  const evaluationCols: Array<{ col: number; label: string }> = [];
  for (let col = 1; col <= maxCol; col += 1) {
    const label = detectEvaluationLabel(headers.normalized[col]);
    if (label) {
      evaluationCols.push({ col, label });
    }
  }

  const ueCol = findColumnByAliases(headers.normalized, HEADER_ALIAS.ue);
  const moduleCol = findColumnByAliases(headers.normalized, HEADER_ALIAS.module);
  // Les colonnes "Nb Heures *" existent parfois en doublon (UE puis module).
  // Regle metier: on selectionne celles situees apres la colonne module.
  const moduleHoursStartCol = moduleCol ? moduleCol + 1 : 1;

  return {
    specialiteTrackCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.specialiteTrack),
    ueCol,
    moduleCol,
    semPeriodeCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.semPeriode),
    nbHeuresEtudiantCol: findColumnByAliases(
      headers.normalized,
      HEADER_ALIAS.nbHeuresEtudiant,
      { fromCol: moduleHoursStartCol },
    ),
    nbHeuresPlanifieesCol: findColumnByAliases(
      headers.normalized,
      HEADER_ALIAS.nbHeuresPlanifiees,
      { fromCol: moduleHoursStartCol },
    ),
    nbHeuresEncadreesCol: findColumnByAliases(
      headers.normalized,
      HEADER_ALIAS.nbHeuresEncadrees,
      { fromCol: moduleHoursStartCol },
    ),
    coursMagistralCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.coursMagistral),
    coursInteractifCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.coursInteractif),
    tdCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.td),
    tpCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.tp),
    projetCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.projet),
    elearningCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.elearning),
    visitesConferencesCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.visitesConferences),
    autoGereCol: findColumnByAliases(headers.normalized, HEADER_ALIAS.autoGere),
    evaluationCols,
  };
};

const classifyEvaluationType = (label: string): MaquetteEvaluationType => {
  // Classification metier utilisee ensuite pour les brouillons d'examens.
  const normalized = normalizeText(label);
  if (
    normalized.includes('epreuve interm') ||
    normalized.includes('ds intermediaire') ||
    normalized.includes('exam 1')
  ) {
    return 'INTERMEDIAIRE';
  }
  if (normalized.includes('epreuve finale') || normalized.includes('exam 2')) {
    return 'FINALE';
  }
  if (normalized.startsWith('cc')) {
    return 'CONTROLE_CONTINU';
  }
  if (normalized.startsWith('tp')) {
    return 'TRAVAUX_PRATIQUES';
  }
  if (normalized.startsWith('rap') || normalized.startsWith('sout') || normalized.startsWith('proj')) {
    return 'PROJET';
  }
  return 'AUTRE';
};

const buildExamEventDrafts = (line: MaquetteMatiereLine): MaquetteExamEventDraft[] => {
  // Chaque evaluation donne un brouillon de futur event d'examen.
  return line.evaluations.map((evaluation) => ({
    promotionCode: line.promotionCode,
    cycleCode: line.cycleCode,
    matiereNom: line.matiereNom,
    evaluationNom: evaluation.nom,
    evaluationType: evaluation.type,
    poids: evaluation.poids,
    semestres: [...evaluation.semestres],
  }));
};

const mergeEvaluations = (
  left: MaquetteEvaluation[],
  right: MaquetteEvaluation[],
): MaquetteEvaluation[] => {
  // Fusion par cle metier: nom + type + semestres.
  const map = new Map<string, MaquetteEvaluation>();
  const register = (evaluation: MaquetteEvaluation) => {
    const key = `${evaluation.nom}|${evaluation.type}|${evaluation.semestres.join(',')}`;
    const existing = map.get(key);
    if (existing) {
      existing.poids += evaluation.poids;
      existing.ordre =
        existing.ordre === null
          ? evaluation.ordre
          : evaluation.ordre === null
            ? existing.ordre
            : Math.min(existing.ordre, evaluation.ordre);
      return;
    }
    map.set(key, {
      ...evaluation,
      semestres: [...evaluation.semestres],
    });
  };

  left.forEach(register);
  right.forEach(register);

  return Array.from(map.values());
};

const parseDataRow = (
  worksheet: ExcelJS.Worksheet,
  rowNumber: number,
  headerMap: HeaderMap,
  rowContext: ParseRowContext,
  options: AnalyzeMaquetteOptions,
  anneeScolaire: string | null,
): MaquetteMatiereLine | null => {
  // Parse une ligne "matiere" et la convertit en format interne.
  if (!headerMap.moduleCol) return null;

  const row = worksheet.getRow(rowNumber);

  const readText = (column: number | null): string =>
    column ? extractCellText(row.getCell(column).value) : '';
  const readNumber = (column: number | null): number =>
    column ? extractCellNumber(row.getCell(column).value) : 0;

  const ueCell = readText(headerMap.ueCol);
  const leftOfUeCell =
    headerMap.ueCol && headerMap.ueCol > 1
      ? readText(headerMap.ueCol - 1)
      : '';
  const trackCell = readText(headerMap.specialiteTrackCol);

  const rowSpecialite = resolveRowSpecialite({
    trackCell,
    leftOfUeCell,
    ueCell,
  });
  if (rowSpecialite) {
    if (
      rowContext.currentSpecialite &&
      rowContext.currentSpecialite.code === rowSpecialite.code &&
      rowContext.currentSpecialite.label &&
      !rowSpecialite.label
    ) {
      // Si la ligne courante ne porte que "Option N", on conserve le dernier
      // libelle explicite connu pour cette option.
      rowSpecialite.label = rowContext.currentSpecialite.label;
    }
    // Le contexte specialite reste actif pour les lignes suivantes (modules).
    rowContext.currentSpecialite = rowSpecialite;
  }

  if (ueCell) rowContext.currentUE = ueCell;

  const moduleName = readText(headerMap.moduleCol);
  if (!moduleName) return null;

  const moduleNameNormalized = normalizeText(moduleName);
  if (!moduleNameNormalized || moduleNameNormalized.startsWith('total')) {
    return null;
  }

  if (isEntrepriseModuleLabel(moduleName)) {
    return null;
  }

  const semPeriodeCell = readText(headerMap.semPeriodeCol);
  const semPeriodeParsed = extractSemestersAndPeriods(semPeriodeCell);
  const semestres =
    semPeriodeParsed.semesters.length > 0
      ? semPeriodeParsed.semesters
      : [...rowContext.sectionSemesters];
  const periodes = semPeriodeParsed.periods;

  if (semestres.length === 0) {
    return null;
  }

  const promoResolution = resolvePromotionCode({
    cycleHint: options.cycleHint,
    promotionHint: options.promotionHint,
    cycleRaw: rowContext.cycleRaw,
    sheetName: worksheet.name,
    semestres,
  });

  const coursMagistral = readNumber(headerMap.coursMagistralCol);
  const coursInteractif = readNumber(headerMap.coursInteractifCol);
  const td = readNumber(headerMap.tdCol);
  const tp = readNumber(headerMap.tpCol);
  const projet = readNumber(headerMap.projetCol);
  const elearning = readNumber(headerMap.elearningCol);
  const visitesConferences = readNumber(headerMap.visitesConferencesCol);
  const autoGere = readNumber(headerMap.autoGereCol);

  const totalFromColumns = [
    readNumber(headerMap.nbHeuresPlanifieesCol),
    readNumber(headerMap.nbHeuresEtudiantCol),
    readNumber(headerMap.nbHeuresEncadreesCol),
  ].find((value) => value > 0);

  // Repli: si aucun total explicite fiable, on reconstruit depuis les details.
  const detailSum =
    coursMagistral +
    coursInteractif +
    td +
    tp +
    projet +
    elearning +
    visitesConferences +
    autoGere;

  const evaluations: MaquetteEvaluation[] = [];
  headerMap.evaluationCols.forEach((evaluationCol, index) => {
    const poids = readNumber(evaluationCol.col);
    if (poids <= 0) return;

    evaluations.push({
      nom: evaluationCol.label,
      type: classifyEvaluationType(evaluationCol.label),
      poids,
      semestres: [...semestres],
      ordre: index + 1,
      rawLabel: evaluationCol.label,
    });
  });

  const line: MaquetteMatiereLine = {
    anneeScolaire,
    cycleCode: promoResolution.cycleCode,
    cycleRaw: rowContext.cycleRaw,
    promotionCode: promoResolution.promotionCode,
    specialiteCode: rowContext.currentSpecialite?.code ?? null,
    specialiteLabel: rowContext.currentSpecialite?.label ?? null,
    specialiteType: rowContext.currentSpecialite?.type ?? null,
    ueNom: rowContext.currentUE,
    matiereNom: moduleName,
    semestres: [...semestres],
    periodes: [...periodes],
    nbSemestres: semestres.length,
    heures: {
      // "total" prend d'abord un total explicite maquette, sinon somme detail.
      total: totalFromColumns ?? detailSum,
      // "totalAvecProf" est prioritairement alimente depuis heures encadrees.
      totalAvecProf: readNumber(headerMap.nbHeuresEncadreesCol) || detailSum,
      coursMagistral,
      coursInteractif,
      td,
      tp,
      projet,
      elearning,
      visitesConferences,
      autoGere,
    },
    evaluations,
    examEventDrafts: [],
    sources: [{ sheetName: worksheet.name, rowNumber }],
  };

  line.examEventDrafts = buildExamEventDrafts(line);
  return line;
};

const mergeLines = (lines: MaquetteMatiereLine[]): MaquetteMatiereLine[] => {
  // Fusion finale des lignes parsees (multi-feuilles, doublons semestres, etc.).
  const mergedMap = new Map<string, MaquetteMatiereLine>();

  lines.forEach((line) => {
    // Regle demandee: matiere avec chiffre = pas de fusion automatique.
    const forceUnique = hasDigit(line.matiereNom);
    // La specialite fait partie de la cle pour eviter de fusionner des matieres
    // homonymes appartenant a des options/specialites differentes.
    const baseKey =
      `${line.cycleCode}|${line.promotionCode}|${line.specialiteCode ?? ''}|` +
      `${line.ueNom}|${line.matiereNom.trim()}`;
    const key = forceUnique
      ? `${baseKey}|${line.sources[0]?.sheetName ?? ''}|${line.sources[0]?.rowNumber ?? 0}`
      : baseKey;

    const existing = mergedMap.get(key);
    if (!existing) {
      mergedMap.set(key, {
        ...line,
        semestres: [...line.semestres],
        periodes: [...line.periodes],
        evaluations: [...line.evaluations],
        examEventDrafts: [...line.examEventDrafts],
        sources: [...line.sources],
      });
      return;
    }

    existing.semestres = mergeUniqueNumbers(existing.semestres, line.semestres);
    existing.periodes = mergeUniqueNumbers(existing.periodes, line.periodes);
    existing.nbSemestres = existing.semestres.length;
    if (!existing.specialiteLabel && line.specialiteLabel) {
      // On enrichit le libelle seulement s'il manque sur la ligne existante.
      existing.specialiteLabel = line.specialiteLabel;
    }
    existing.sources = [...existing.sources, ...line.sources];
    existing.evaluations = mergeEvaluations(existing.evaluations, line.evaluations);

    existing.heures = {
      total: existing.heures.total + line.heures.total,
      totalAvecProf: existing.heures.totalAvecProf + line.heures.totalAvecProf,
      coursMagistral: existing.heures.coursMagistral + line.heures.coursMagistral,
      coursInteractif: existing.heures.coursInteractif + line.heures.coursInteractif,
      td: existing.heures.td + line.heures.td,
      tp: existing.heures.tp + line.heures.tp,
      projet: existing.heures.projet + line.heures.projet,
      elearning: existing.heures.elearning + line.heures.elearning,
      visitesConferences:
        existing.heures.visitesConferences + line.heures.visitesConferences,
      autoGere: existing.heures.autoGere + line.heures.autoGere,
    };

    existing.examEventDrafts = buildExamEventDrafts(existing);
  });

  return Array.from(mergedMap.values()).sort((a, b) =>
    `${a.promotionCode}-${a.matiereNom}`.localeCompare(`${b.promotionCode}-${b.matiereNom}`),
  );
};

export const parseMaquetteBuffer = async (
  buffer: Buffer,
  options: AnalyzeMaquetteOptions = {},
): Promise<MaquetteAnalyzeResult> => {
  // Chargement unique du classeur en memoire.
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const warnings: string[] = [];
  const extractedLines: MaquetteMatiereLine[] = [];
  const promotions = new Set<string>();
  const sheetNames: string[] = [];

  let anneeScolaire: string | null = null;
  let firstCycleRaw = '';
  let firstCycleCode = '';

  workbook.eachSheet((worksheet) => {
    // Chaque feuille est scannee de haut en bas pour trouver:
    // - en-tete,
    // - blocs de semestres,
    // - lignes matieres.
    sheetNames.push(worksheet.name);
    const maxCol = getMaxColumnCount(worksheet);

    let headerMap: HeaderMap | null = null;
    const rowContext: ParseRowContext = {
      currentUE: '',
      cycleRaw: worksheet.name,
      sectionSemesters: [],
      currentSpecialite: null,
    };

    for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const combined = getCombinedRowText(worksheet, rowNumber, maxCol);
      if (!combined.trim()) continue;

      const normalizedCombined = normalizeText(combined);

      if (!anneeScolaire) {
        anneeScolaire = extractSchoolYear(combined);
      }

      if (isCycleDescriptorRow(combined)) {
        rowContext.cycleRaw = combined;
        if (!firstCycleRaw) firstCycleRaw = combined;
      }

      if (normalizedCombined.includes('semestre')) {
        const section = extractSemestersAndPeriods(combined);
        if (section.semesters.length > 0) {
          rowContext.sectionSemesters = section.semesters;
        }
      }

      if (normalizedCombined.includes('unite d enseignements')) {
        // Debut d'un bloc de donnees "UE/Modules".
        headerMap = buildHeaderMap(worksheet, rowNumber);
        rowContext.currentUE = '';

        if (!headerMap.moduleCol) {
          warnings.push(
            `Feuille ${worksheet.name} ligne ${rowNumber}: colonne "Modules" introuvable.`,
          );
          headerMap = null;
        }
        continue;
      }

      if (!headerMap) continue;

      if (
        normalizedCombined.startsWith('total ') ||
        normalizedCombined.includes(' total semestre') ||
        normalizedCombined.includes('total annee') ||
        normalizedCombined.includes('ects entreprise')
      ) {
        headerMap = null;
        rowContext.currentUE = '';
        continue;
      }

      const parsedLine = parseDataRow(
        worksheet,
        rowNumber,
        headerMap,
        rowContext,
        options,
        anneeScolaire,
      );
      if (!parsedLine) continue;

      promotions.add(parsedLine.promotionCode);
      if (!firstCycleCode) firstCycleCode = parsedLine.cycleCode;
      extractedLines.push(parsedLine);
    }
  });

  const merged = mergeLines(extractedLines);
  // Synthese metadata des specialites detectees pour aider l'analyse front
  // (filtres, previsualisation, resume d'import).
  const specialites = Array.from(
    new Map(
      merged
        .filter((line) => line.specialiteCode && line.specialiteType)
        .map((line) => [
          line.specialiteCode as string,
          {
            code: line.specialiteCode as string,
            label: line.specialiteLabel,
            type: line.specialiteType as MaquetteSpecialiteType,
          },
        ]),
    ).values(),
  ).sort((left, right) => left.code.localeCompare(right.code));

  return {
    matieres: merged,
    warnings,
    metadata: {
      anneeScolaire,
      cycleRaw: firstCycleRaw,
      cycleCode: firstCycleCode,
      promotions: Array.from(promotions).sort(),
      specialites,
      feuilles: sheetNames,
    },
  };
};
