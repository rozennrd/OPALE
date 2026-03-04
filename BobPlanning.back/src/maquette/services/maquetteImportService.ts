/**
 * Service d'import maquette.
 *
 * Ce service:
 * - parse le fichier maquette;
 * - fait un upsert des matieres (insert/update);
 * - cree les events d'examen dans la table event + table de liaison concerner;
 * - reste idempotent (pas de doublons sur les imports repetes).
 */
import { PoolClient } from 'pg';
import { pool } from '../../database/pool';
import { parseMaquetteBuffer } from '../parser/maquetteParser';
import {
  AnalyzeMaquetteOptions,
  ImportMaquetteResult,
  MaquetteExamEventDraft,
  MaquetteMatiereLine,
} from '../types/MaquetteExtracted';
import { toUpperNoSpace } from '../utils/text';

interface ImportMaquetteOptions extends AnalyzeMaquetteOptions {
  // Mode simulation: aucune ecriture en base.
  dryRun?: boolean;
}

interface PromotionRow {
  // Projection minimale de la table promotion.
  id: string;
  nom: string;
}

interface SchoolYearInfo {
  // Annee de reference utilisee pour generer des dates placeholders.
  startYear: number;
  // True si l'annee est deduite (fallback), false si lue dans la maquette.
  inferred: boolean;
}

interface EventTableCapabilities {
  // Capacites detectees dynamiquement pour supporter plusieurs schemas DB.
  hasDescription: boolean;
  hasNumSemaine: boolean;
  hasShowMacro: boolean;
  hasShowMicro: boolean;
  hasIsBlocking: boolean;
  hasIsExceptional: boolean;
  hasIsExternal: boolean;
}

const toNullableInt = (value: number): number | null => {
  // Harmonise les volumes vers INT nullable.
  if (!Number.isFinite(value)) return null;
  return Math.round(value);
};

const getMappedTdHours = (line: MaquetteMatiereLine): number => {
  // Regle metier demandee:
  // heures_td en base = TD + cours magistral + cours interactif.
  return line.heures.td + line.heures.coursMagistral + line.heures.coursInteractif;
};

const getMappedOtherHours = (line: MaquetteMatiereLine): number => {
  // Les heures "autres" regroupent les postes non portes nativement par la table.
  return line.heures.visitesConferences + line.heures.autoGere;
};

const getPromotionNumberFromCode = (promotionCode: string): number | null => {
  const matches = promotionCode.match(/\d{1,2}/g);
  if (!matches || matches.length === 0) return null;
  const value = Number(matches[matches.length - 1]);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const getSemestreForDb = (line: MaquetteMatiereLine): number => {
  const semestres = [...line.semestres].sort((a, b) => a - b);
  const semestreBase = semestres[0] ?? 1;
  const promoNumber = getPromotionNumberFromCode(line.promotionCode);
  if (!promoNumber) return Math.max(1, semestreBase);
  return semestreBase === promoNumber * 2 ? 2 : 1;
};

const parseSchoolYearStartYear = (schoolYear: string | null): SchoolYearInfo => {
  // Accepte: "2024-2025", "24/25", "2024".
  if (schoolYear) {
    const normalized = schoolYear.replace(/\s+/g, '');

    const fullMatch = normalized.match(/\b(20\d{2})[-/](20\d{2})\b/);
    if (fullMatch) {
      return { startYear: Number(fullMatch[1]), inferred: false };
    }

    const shortMatch = normalized.match(/\b(\d{2})[-/](\d{2})\b/);
    if (shortMatch) {
      return { startYear: 2000 + Number(shortMatch[1]), inferred: false };
    }

    const singleYearMatch = normalized.match(/\b(20\d{2})\b/);
    if (singleYearMatch) {
      return { startYear: Number(singleYearMatch[1]), inferred: false };
    }
  }

  return { startYear: new Date().getFullYear(), inferred: true };
};

const getSemesterAnchor = (semestres: number[]): number => {
  // Ancre stable pour trier/positionner les evenements par semestre.
  if (semestres.length === 0) return 1;
  return Math.max(1, Math.min(...semestres));
};

const buildExamEventDateRange = (
  schoolYearStart: number,
  semestres: number[],
  slotIndex: number,
): { datetimeStart: Date; datetimeEnd: Date } => {
  // Date placeholder deterministe:
  // - mois 9 pour semestres impairs, mois 2 pour semestres pairs;
  // - repartition des events sur des creneaux de 2h.
  const semesterAnchor = getSemesterAnchor(semestres);
  const yearOffset = Math.floor((semesterAnchor - 1) / 2);
  const month = semesterAnchor % 2 === 1 ? 8 : 1; // septembre ou fevrier

  const slotsPerDay = 6;
  const day = Math.min(28, 1 + Math.floor(slotIndex / slotsPerDay));
  const hour = 8 + (slotIndex % slotsPerDay) * 2;

  const datetimeStart = new Date(
    Date.UTC(schoolYearStart + yearOffset, month, day, hour, 0, 0),
  );
  const datetimeEnd = new Date(datetimeStart.getTime() + 90 * 60 * 1000);

  return { datetimeStart, datetimeEnd };
};

const truncate = (value: string, maxLength: number): string => {
  // Respect strict des limites VARCHAR en base.
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength);
};

const buildExamEventName = (draft: MaquetteExamEventDraft): string => {
  // Nom lisible cote planning.
  const raw = `[${draft.promotionCode}] ${draft.matiereNom} - ${draft.evaluationNom}`;
  return truncate(raw, 255);
};

const buildExamEventDescription = (draft: MaquetteExamEventDraft): string => {
  // Description compacte orientee diagnostic.
  const semestres = [...draft.semestres].sort((a, b) => a - b).join(',');
  const raw =
    `maquette=${draft.cycleCode};promo=${draft.promotionCode};` +
    `matiere=${draft.matiereNom};eval=${draft.evaluationNom};` +
    `type=${draft.evaluationType};poids=${draft.poids};semestres=${semestres}`;

  return truncate(raw, 255);
};

const buildExamDraftKey = (draft: MaquetteExamEventDraft): string => {
  // Cle de deduplication logique des brouillons d'examen.
  const semestres = [...draft.semestres].sort((a, b) => a - b).join(',');
  return [
    toUpperNoSpace(draft.promotionCode),
    draft.matiereNom.trim(),
    draft.evaluationNom.trim(),
    draft.evaluationType,
    draft.poids,
    semestres,
  ].join('|');
};

const sortExamDrafts = (drafts: MaquetteExamEventDraft[]): MaquetteExamEventDraft[] => {
  // Tri stable pour obtenir des dates placeholders deterministes.
  return drafts.sort((left, right) => {
    const leftSem = getSemesterAnchor(left.semestres);
    const rightSem = getSemesterAnchor(right.semestres);

    const byPromotion = left.promotionCode.localeCompare(right.promotionCode);
    if (byPromotion !== 0) return byPromotion;

    const bySemester = leftSem - rightSem;
    if (bySemester !== 0) return bySemester;

    const byMatiere = left.matiereNom.localeCompare(right.matiereNom);
    if (byMatiere !== 0) return byMatiere;

    const byEvaluation = left.evaluationNom.localeCompare(right.evaluationNom);
    if (byEvaluation !== 0) return byEvaluation;

    return left.evaluationType.localeCompare(right.evaluationType);
  });
};

const resolveExamEventTypeValue = async (client: PoolClient): Promise<string> => {
  // Compatibilite schema:
  // - certains environnements utilisent "examen",
  // - d'autres "Examen".
  const sql = `
    SELECT e.enumlabel AS value
    FROM pg_enum e
    INNER JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'type_event'
    ORDER BY e.enumsortorder
  `;

  const result = await client.query<{ value: string }>(sql);
  const labels = result.rows.map((row) => row.value);
  const examValue = labels.find((label) => toUpperNoSpace(label) === 'EXAMEN');
  if (examValue) return examValue;

  throw new Error(
    `Valeur enum type_event pour examen introuvable. Valeurs disponibles: ${labels.join(', ')}`,
  );
};

const resolveEventTableCapabilities = async (
  client: PoolClient,
): Promise<EventTableCapabilities> => {
  // Detection runtime des colonnes disponibles pour inserer sans casser.
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event'
  `;

  const result = await client.query<{ column_name: string }>(sql);
  const columns = new Set(result.rows.map((row) => row.column_name));

  return {
    hasDescription: columns.has('description'),
    hasNumSemaine: columns.has('num_semaine'),
    hasShowMacro: columns.has('show_macro'),
    hasShowMicro: columns.has('show_micro'),
    hasIsBlocking: columns.has('is_blocking'),
    hasIsExceptional: columns.has('is_exceptional'),
    hasIsExternal: columns.has('is_external'),
  };
};

const getNbPartiels = (line: MaquetteMatiereLine): number => {
  // Partiels = evaluations intermediaires + finales.
  return line.evaluations.filter(
    (evaluation) => evaluation.type === 'INTERMEDIAIRE' || evaluation.type === 'FINALE',
  ).length;
};

const getNbEvalIntermediaire = (line: MaquetteMatiereLine): number => {
  // Evals intermediaires = intermediaire + controle continu.
  return line.evaluations.filter(
    (evaluation) =>
      evaluation.type === 'INTERMEDIAIRE' || evaluation.type === 'CONTROLE_CONTINU',
  ).length;
};

const findExistingMatiere = async (
  client: PoolClient,
  line: MaquetteMatiereLine,
  promotionId: string,
): Promise<string | null> => {
  // Recherche de la ligne cible pour logique upsert.
  const semestre = getSemestreForDb(line);
  const sql = `
    SELECT id
    FROM matiere
    WHERE nom = $1
      AND id_promo = $2
      AND semestre = $3
      AND id_specialite IS NULL
    LIMIT 1
  `;
  const result = await client.query(sql, [line.matiereNom, promotionId, semestre]);
  return (result.rows[0]?.id as string | undefined) ?? null;
};

const insertMatiere = async (
  client: PoolClient,
  line: MaquetteMatiereLine,
  promotionId: string,
): Promise<void> => {
  // Insertion alignee sur le schema actuel de la table matiere.
  const semestre = getSemestreForDb(line);
  const sql = `
    INSERT INTO matiere (
      nom, volume_horaire, id_promo, id_specialite,
      semestre, nb_partiels, nb_eval_intermediaire,
      heures_td, heures_tp, heures_projet, heures_elearning, heures_autre
    )
    VALUES ($1,$2,$3,NULL,$4,$5,$6,$7,$8,$9,$10,$11)
  `;

  await client.query(sql, [
    line.matiereNom,
    line.heures.total,
    promotionId,
    semestre,
    getNbPartiels(line),
    getNbEvalIntermediaire(line),
    toNullableInt(getMappedTdHours(line)),
    toNullableInt(line.heures.tp),
    toNullableInt(line.heures.projet),
    toNullableInt(line.heures.elearning),
    toNullableInt(getMappedOtherHours(line)),
  ]);
};

const updateMatiere = async (
  client: PoolClient,
  matiereId: string,
  line: MaquetteMatiereLine,
  promotionId: string,
): Promise<void> => {
  // Mise a jour de la ligne existante (idempotence import).
  const semestre = getSemestreForDb(line);
  const sql = `
    UPDATE matiere
    SET nom = $2,
        volume_horaire = $3,
        id_promo = $4,
        id_specialite = NULL,
        semestre = $5,
        nb_partiels = $6,
        nb_eval_intermediaire = $7,
        heures_td = $8,
        heures_tp = $9,
        heures_projet = $10,
        heures_elearning = $11,
        heures_autre = $12
    WHERE id = $1
  `;

  await client.query(sql, [
    matiereId,
    line.matiereNom,
    line.heures.total,
    promotionId,
    semestre,
    getNbPartiels(line),
    getNbEvalIntermediaire(line),
    toNullableInt(getMappedTdHours(line)),
    toNullableInt(line.heures.tp),
    toNullableInt(line.heures.projet),
    toNullableInt(line.heures.elearning),
    toNullableInt(getMappedOtherHours(line)),
  ]);
};

const findExistingExamEvent = async (
  client: PoolClient,
  examEventTypeValue: string,
  nom: string,
  promotionId: string,
  datetimeStart: Date,
  datetimeEnd: Date,
): Promise<string | null> => {
  // Detection d'un event deja cree pour eviter les doublons.
  const sql = `
    SELECT e.id
    FROM event e
    INNER JOIN concerner c ON c.id_event = e.id
    WHERE e.type = $1
      AND e.nom = $2
      AND c.id_promo = $3
      AND e.datetime_start = $4
      AND e.datetime_end = $5
    LIMIT 1
  `;

  const result = await client.query(sql, [
    examEventTypeValue,
    nom,
    promotionId,
    datetimeStart,
    datetimeEnd,
  ]);
  return (result.rows[0]?.id as string | undefined) ?? null;
};

const insertExamEvent = async (
  client: PoolClient,
  examEventTypeValue: string,
  eventTableCapabilities: EventTableCapabilities,
  nom: string,
  description: string,
  datetimeStart: Date,
  datetimeEnd: Date,
): Promise<string> => {
  // Construction SQL dynamique pour supporter les differences de schema event.
  const columns: string[] = ['type', 'nom'];
  const values: Array<string | number | boolean | Date | null> = [
    examEventTypeValue,
    nom,
  ];

  if (eventTableCapabilities.hasDescription) {
    columns.push('description');
    values.push(description);
  }

  if (eventTableCapabilities.hasNumSemaine) {
    columns.push('num_semaine');
    values.push(null);
  }

  columns.push('datetime_start', 'datetime_end');
  values.push(datetimeStart, datetimeEnd);

  if (eventTableCapabilities.hasShowMacro) {
    columns.push('show_macro');
    values.push(false);
  }

  if (eventTableCapabilities.hasShowMicro) {
    columns.push('show_micro');
    values.push(false);
  }

  if (eventTableCapabilities.hasIsBlocking) {
    columns.push('is_blocking');
    values.push(false);
  }

  if (eventTableCapabilities.hasIsExceptional) {
    columns.push('is_exceptional');
    values.push(false);
  }

  if (eventTableCapabilities.hasIsExternal) {
    columns.push('is_external');
    values.push(true);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  const sql = `
    INSERT INTO event (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING id
  `;

  const result = await client.query(sql, values);
  return result.rows[0].id as string;
};

const attachEventToPromotion = async (
  client: PoolClient,
  eventId: string,
  promotionId: string,
): Promise<void> => {
  // Liaison event->promotion avec garde anti-doublon.
  const sql = `
    INSERT INTO concerner (id_event, id_promo, id_groupe, id_specialite)
    SELECT $1, $2, NULL, NULL
    WHERE NOT EXISTS (
      SELECT 1
      FROM concerner
      WHERE id_event = $1
        AND id_promo = $2
        AND id_groupe IS NULL
        AND id_specialite IS NULL
    )
  `;

  await client.query(sql, [eventId, promotionId]);
};

export const maquetteImportService = {
  async import(
    buffer: Buffer,
    options: ImportMaquetteOptions = {},
  ): Promise<ImportMaquetteResult> {
    // 1) Parsing.
    const analyzed = await parseMaquetteBuffer(buffer, options);
    const warnings = [...analyzed.warnings];
    const examEventsToCreate: MaquetteExamEventDraft[] = analyzed.matieres.flatMap(
      (matiere) => matiere.examEventDrafts,
    );

    if (options.dryRun) {
      // 2) Simulation: expose uniquement la projection.
      return {
        insertedMatieres: 0,
        updatedMatieres: 0,
        skippedMatieres: 0,
        insertedExamEvents: 0,
        skippedExamEvents: 0,
        warnings,
        examEventsToCreate,
      };
    }

    const client = await pool.connect();
    try {
      // 3) Transaction unique pour garantir la coherence.
      await client.query('BEGIN');

      const promotionsResult = await client.query<PromotionRow>(
        'SELECT id, nom FROM promotion',
      );
      const promotionMap = new Map<string, string>();
      promotionsResult.rows.forEach((promotion) => {
        promotionMap.set(toUpperNoSpace(promotion.nom), promotion.id);
      });

      let insertedMatieres = 0;
      let updatedMatieres = 0;
      let skippedMatieres = 0;
      let insertedExamEvents = 0;
      let skippedExamEvents = 0;

      for (const line of analyzed.matieres) {
        if (line.semestres.length > 1) {
          const semestre = getSemestreForDb(line);
          warnings.push(
            `Matiere "${line.matiereNom}" multi-semestres (${line.semestres.join(
              ',',
            )}) importee avec semestre=${semestre}.`,
          );
        }

        const promotionId = promotionMap.get(toUpperNoSpace(line.promotionCode));
        if (!promotionId) {
          // Cas normalise: promo absente en base, ligne ignoree + warning.
          skippedMatieres += 1;
          warnings.push(
            `Promotion inconnue "${line.promotionCode}" pour la matiere "${line.matiereNom}".`,
          );
          continue;
        }

        const existingId = await findExistingMatiere(client, line, promotionId);
        if (!existingId) {
          await insertMatiere(client, line, promotionId);
          insertedMatieres += 1;
          continue;
        }

        await updateMatiere(client, existingId, line, promotionId);
        updatedMatieres += 1;
      }

      const schoolYearInfo = parseSchoolYearStartYear(analyzed.metadata.anneeScolaire);
      if (schoolYearInfo.inferred) {
        warnings.push(
          `Annee scolaire non detectee. Date placeholder des examens basee sur ${schoolYearInfo.startYear}.`,
        );
      }

      const uniqueExamDrafts = sortExamDrafts(
        Array.from(
          new Map(
            examEventsToCreate.map((draft) => [buildExamDraftKey(draft), draft]),
          ).values(),
        ),
      );

      const examEventTypeValue = await resolveExamEventTypeValue(client);
      const eventTableCapabilities = await resolveEventTableCapabilities(client);
      const examSlotsByPromotionSemester = new Map<string, number>();

      for (const draft of uniqueExamDrafts) {
        const promotionId = promotionMap.get(toUpperNoSpace(draft.promotionCode));
        if (!promotionId) {
          skippedExamEvents += 1;
          continue;
        }

        const semesterAnchor = getSemesterAnchor(draft.semestres);
        const slotKey = `${promotionId}|${semesterAnchor}`;
        // Compteur local pour espacer les events d'une meme promo/semestre.
        const slotIndex = examSlotsByPromotionSemester.get(slotKey) ?? 0;
        examSlotsByPromotionSemester.set(slotKey, slotIndex + 1);

        const { datetimeStart, datetimeEnd } = buildExamEventDateRange(
          schoolYearInfo.startYear,
          draft.semestres,
          slotIndex,
        );

        const eventName = buildExamEventName(draft);
        const eventDescription = buildExamEventDescription(draft);

        const existingEventId = await findExistingExamEvent(
          client,
          examEventTypeValue,
          eventName,
          promotionId,
          datetimeStart,
          datetimeEnd,
        );

        if (existingEventId) {
          await attachEventToPromotion(client, existingEventId, promotionId);
          // Event deja present: on le compte comme skip.
          skippedExamEvents += 1;
          continue;
        }

        const createdEventId = await insertExamEvent(
          client,
          examEventTypeValue,
          eventTableCapabilities,
          eventName,
          eventDescription,
          datetimeStart,
          datetimeEnd,
        );
        await attachEventToPromotion(client, createdEventId, promotionId);
        insertedExamEvents += 1;
      }

      await client.query('COMMIT');

      return {
        insertedMatieres,
        updatedMatieres,
        skippedMatieres,
        insertedExamEvents,
        skippedExamEvents,
        warnings,
        examEventsToCreate,
      };
    } catch (error) {
      // 4) Repli transactionnel en cas d'erreur.
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
