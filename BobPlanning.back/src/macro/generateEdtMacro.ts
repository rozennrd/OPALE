import ExcelJS from 'exceljs';
import path from 'path';
import {
  getHolidays,
  getPublicHolidays,
  getWeekNumber,
} from '../tools/holidaysAndWeek';
import { EdtMacroData, EventMacro, Promos } from '../types/EdtMacroData';
import { COLOR, FONT_NAME, getCycleColor } from './ColorTypeEvent';

export const generateEdtMacro = async (data: EdtMacroData) => {
  //
  // ──────────────────────────────────────────────────────────────
  // ALIGNER LA DATE DE DÉBUT SUR UN LUNDI
  // ──────────────────────────────────────────────────────────────
  //
  const allStarts = data.Promos.map((p) =>
    new Date(p.date_start).getTime(),
  ).filter((t) => !isNaN(t));
  const allEnds = data.Promos.map((p) => new Date(p.date_end).getTime()).filter(
    (t) => !isNaN(t),
  );

  const computedStart =
    allStarts.length > 0
      ? new Date(Math.min(...allStarts))
      : new Date(data.DateDeb);
  const computedEnd =
    allEnds.length > 0
      ? new Date(Math.max(...allEnds))
      : new Date(data.DateFin);

  // ────────── ALIGNER LE DÉBUT AU LUNDI ──────────
  let currentDate = new Date(computedStart);
  const startDay = currentDate.getDay();
  if (startDay !== 1) {
    const diff = startDay === 0 ? -6 : 1 - startDay;
    currentDate.setDate(currentDate.getDate() + diff);
  }

  // ────────── ALIGNER LA FIN AU VENDREDI ──────────
  const dateFin = new Date(computedEnd);
  const endDay = dateFin.getDay();
  if (endDay !== 5) {
    const diff = endDay === 0 ? 5 : 5 - endDay;
    dateFin.setDate(dateFin.getDate() + diff);
  }

  //
  // ──────────────────────────────────────────────────────────────
  // PARAMÈTRES CYPRE
  // ──────────────────────────────────────────────────────────────
  //
  // Trouver la première promo de type Initial (référence CyPré)
  const initialPromo = data.Promos.find(
    (p) => (p.type ?? '').toLowerCase() === 'initial',
  );

  // Point de départ CyPré : date_start alignée au premier lundi
  let cyPreStart: Date | null = null;
  if (initialPromo) {
    cyPreStart = new Date(initialPromo.date_start);
    // Aligner la date au lundi
    const day = cyPreStart.getDay();
    if (day !== 1) {
      cyPreStart.setDate(cyPreStart.getDate() - (day - 1));
    }
  }
  // Compteur global des semaines CyPré
  let cyPreWeekCount = 0;

  //
  // ──────────────────────────────────────────────────────────────
  // PRÉ-CALCUL COULEURS CYCLES
  // Index couleur par cycle + année dans le cycle (dégradé getCycleColor)
  // ──────────────────────────────────────────────────────────────
  //
  const cycleIds = [...new Set(data.Promos.map((p) => p.id_cycle))];

  const cycleIndexMap: Record<string, number> = {};
  cycleIds.forEach((id, idx) => {
    cycleIndexMap[id] = idx;
  });

  const yearInCycleMap: Record<string, number> = {};
  cycleIds.forEach((cycleId) => {
    data.Promos.filter((p) => p.id_cycle === cycleId)
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
      )
      .forEach((p, idx) => {
        yearInCycleMap[p.id] = idx;
      });
  });

  //
  // ──────────────────────────────────────────────────────────────
  // TRI DES PROMOS : par cycle puis par date_start
  // → garantit que les cycles sont côte à côte dans l'Excel
  // ──────────────────────────────────────────────────────────────
  //
  const sortedPromos = [...data.Promos].sort((a, b) => {
    const cDiff =
      (cycleIndexMap[a.id_cycle] ?? 0) - (cycleIndexMap[b.id_cycle] ?? 0);
    if (cDiff !== 0) return cDiff;
    return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
  });

  //
  // ──────────────────────────────────────────────────────────────
  // EXCEL SETUP
  // ──────────────────────────────────────────────────────────────
  //
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MultiPromo');

  const columns: any[] = [
    { header: 'Numéro de la semaine', key: 'weekNumber', width: 10 },
    { header: 'La semaine commence le lundi :', key: 'mondayDate', width: 15 },
    { header: 'Temps études, admin et comm', key: 'tempsEtudeAdminComm', width: 15,},
    { header: 'Jurys', key: 'jury', width: 10 },
    { header: 'Jour fériés / congés', key: 'holidays', width: 15 },
    { header: 'Semaine de cours num CyPré', key: 'cypreWeek', width: 10 },
    { header: 'Nombre Epreuves surveillées semaine', key: 'examsNumber', width: 18 },
    { header: 'Evènements JUNIA', key: 'eventsJunia', width: 20 },
    { header: 'Evènements hors JUNIA', key: 'eventsExternal', width: 20 },
  ];

  sortedPromos.forEach((promo: Promos) => {
    columns.push({ header: promo.nom, key: promo.nom, width: 15 });

    if (promo.periode && promo.periode.length > 0) {
      promo.periode.sort(
        (a, b) =>
          new Date(a.DateDebutP).getTime() - new Date(b.DateDebutP).getTime(),
      );
    }
  });

  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);
  headerRow.height = 50;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR.DATE_WEEK },
    };
    cell.font = {
      name: FONT_NAME,
      bold: true,
      color: { argb: COLOR.TEXT_DEFAULT },
    };
  });

  //
  // ──────────────────────────────────────────────────────────────
  // VACANCES & JOURS FÉRIÉS
  // ──────────────────────────────────────────────────────────────
  //
  // ────────── CHARGER LES VACANCES SUR TOUTES LES ANNÉES ──────────
  const startYear = currentDate.getFullYear();
  const endYear = dateFin.getFullYear();

  let publicHolidays: any = {};
  let holidays: any[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const ph = await getPublicHolidays(year);
    const h = await getHolidays('Bordeaux', year);

    publicHolidays = { ...publicHolidays, ...ph };
    holidays = [...holidays, ...h];
  }

  type Holiday = {
    start_date: string;
    end_date: string;
    description: string;
  };

  // Tri vacances par date
  const sortedHolidays: Holiday[] = holidays.sort(
    (a: Holiday, b: Holiday) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );

  let hIndex = 0;

  let holidayStart = new Date(sortedHolidays[hIndex].start_date);
  let holidayEnd = new Date(sortedHolidays[hIndex].end_date);

  //
  // ──────────────────────────────────────────────────────────────
  // BOUCLE PRINCIPALE SEMAINE PAR SEMAINE
  // ──────────────────────────────────────────────────────────────
  //
  while (currentDate <= dateFin) {
    //
    // ────────── DÉTERMINATION DES VACANCES / JOURS FÉRIÉS ──────────
    //
    let holidayDescription = '';
    let isPublicHoliday = false;

    if (currentDate >= holidayStart && currentDate <= holidayEnd) {
      holidayDescription = sortedHolidays[hIndex].description;
    } else {
      for (let d = 0; d < 5; d++) {
        const day = new Date(currentDate);
        day.setDate(day.getDate() + d);
        const key = day.toISOString().split('T')[0];

        if (publicHolidays[key]) {
          holidayDescription += publicHolidays[key];
          isPublicHoliday = true;
        }
      }
    }

    if (holidayEnd < currentDate && hIndex < sortedHolidays.length - 1) {
      hIndex++;
      holidayStart = new Date(sortedHolidays[hIndex].start_date);
      holidayEnd = new Date(sortedHolidays[hIndex].end_date);
    }

    //
    // ────────── STRUCTURE DE LIGNE ──────────
    //
    const rowData: any = {
      weekNumber: getWeekNumber(currentDate),
      mondayDate: currentDate.toLocaleDateString('fr-FR'),
      tempsEtudeAdminComm: '',
      jury: '',
      holidays: holidayDescription,
      cypreWeek: '',
      examsNumber: '',
      eventsJunia: '',
      eventsExternal: '',
    };

    const promosEnCours: string[] = [];

    // Bornes de la semaine (lundi → dimanche)
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    //
    // ────────── LOGIQUE PAR PROMO ──────────
    //
    sortedPromos.forEach((promo) => {
      const periodes = promo.periode ?? [];

      //
      // 1) Aucune période définie pour cette promo
      //
      if (periodes.length === 0) {
        if (promo.type === 'Initial') {
          if (holidayDescription.includes('Vacances')) {
            rowData[promo.nom] = 'VACANCES';
          } else {
            rowData[promo.nom] = '';
            promosEnCours.push(promo.nom);
          }
        } else {
          // Apprentissage : jamais de vacances, cours par défaut
          rowData[promo.nom] = '';
          promosEnCours.push(promo.nom);
        }
        return;
      }

      //
      // 2) Période active cette semaine
      //
      const active = periodes.find((p) => {
        const start = new Date(p.DateDebutP);
        const end = new Date(p.DateFinP);
        return end >= weekStart && start <= weekEnd;
      });

      if (active) {
        const t = active.type.toLowerCase();

        if (t.includes('rattrapage')) {
          rowData[promo.nom] = active.type;
          return;
        } else if (
          t.includes('examen') ||
          t.includes('partiel') ||
          t.includes('jury')
        ) {
          rowData[promo.nom] = active.type;
          return;
        } else if (t.includes('stage')) {
          rowData[promo.nom] = active.type;
        } else if (
          t.includes('mobilité') ||
          t.includes('mobilite') ||
          t.includes('international')
        ) {
          rowData[promo.nom] = active.type;
        } else if (t.includes('projet de fin') || t.includes('pfe')) {
          const end = new Date(active.DateFinP);
          if (end >= weekStart && end <= weekEnd) {
            rowData[promo.nom] = 'Soutenance';
          } else {
            rowData[promo.nom] = active.type;
          }
        } else if (t.includes('entreprise')) {
          rowData[promo.nom] = active.type;
        } else {
          // Période inconnue → cours
          rowData[promo.nom] = '';
          promosEnCours.push(promo.nom);
        }

        return;
      }

      //
      // 3) Aucune période active → cours ou vacances
      //
      if (promo.type === 'Initial') {
        if (holidayDescription.includes('Vacances')) {
          rowData[promo.nom] = 'VACANCES';
        } else {
          rowData[promo.nom] = '';
          promosEnCours.push(promo.nom);
        }
      } else {
        rowData[promo.nom] = '';
        promosEnCours.push(promo.nom);
      }
    });

    //
    // ────────── EVENTS MACRO de la semaine ──────────
    // Events sans promo → colonne "events" (globale)
    // Events avec promo → colonne de la promo concernée
    //
    const eventsThisWeek: EventMacro[] = (data.EventsMacro ?? []).filter(
      (ev: EventMacro) => {
        const s = new Date(ev.datetime_start);
        const e = new Date(ev.datetime_end);
        return e >= weekStart && s <= weekEnd;
      },
    );

    // Events globaux (aucune promo associée)
    const globalEvents = eventsThisWeek.filter(
      (ev: EventMacro) => !ev.promotions || ev.promotions.length === 0,
    );

    if (globalEvents.length > 0) {
      const juniaNames: string[] = [];
      const externalNames: string[] = [];

      globalEvents.forEach((ev: EventMacro) => {
        const cleanName = ev.nom.split(' - ')[0];

        if (ev.is_external) {
          externalNames.push(cleanName);
        } else {
          juniaNames.push(cleanName);
        }
      });

      rowData.eventsJunia = juniaNames.join('\n');
      rowData.eventsExternal = externalNames.join('\n');
    }

    // Events liés à une promo → écrire dans la colonne de la promo
    // Events liés à une promo → écrire dans la colonne de la promo
    eventsThisWeek.forEach((ev: EventMacro) => {
      if (ev.promotions && ev.promotions.length > 0) {
        ev.promotions.forEach((promoId: string) => {
          const promo = sortedPromos.find((p) => p.id === promoId);
          if (promo) {
            const existing = rowData[promo.nom] ?? '';
            const cleanName = ev.nom.split(' - ')[0];

            // Vérifier si le nom est déjà présent pour éviter doublon
            const existingLines = existing.split('\n');
            if (!existingLines.includes(cleanName)) {
              rowData[promo.nom] = existing ? existing + '\n' + cleanName : cleanName;
            }
          }
        });
      }
    });

    //
    // ────────── CYPRE : semaine numérotée pour les cycles Initiaux ──────────
    //
    if (cyPreStart && currentDate >= cyPreStart) {
      // 1) Semaine active = pas vacances
      if (!holidayDescription.includes('Vacances')) {
        // On avance de 1
        cyPreWeekCount++;

        // Numéro entre 1 et 16
        const displayWeek = ((cyPreWeekCount - 1) % 16) + 1;

        rowData.cypreWeek = `Se${displayWeek}`;
      } else {
        rowData.cypreWeek = '';
      }
    } else {
      rowData.cypreWeek = '';
    }

    //
    // ────────── AJOUT DE LA LIGNE DANS EXCEL ──────────
    //
    const row = worksheet.addRow(rowData);

    // Fond violet — N° semaine + date lundi (chaque ligne data)
    row.getCell('weekNumber').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR.DATE_WEEK },
    };
    row.getCell('mondayDate').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR.DATE_WEEK },
    };

    //
    // Couleurs : vacances zone Bordeaux (colonne holidays)
    //
    if (holidayDescription.includes('Vacances')) {
      row.getCell('holidays').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLOR.VAC_BDX },
      };
      row.getCell('holidays').font = {
        name: FONT_NAME,
        color: { argb: COLOR.TEXT_DEFAULT },
      };
    }
    if (isPublicHoliday) {
      row.getCell('holidays').font = {
        name: FONT_NAME,
        bold: true,
        color: { argb: COLOR.JOUR_FERIE_FG },
      };
    }

    //
    // Couleurs promos — on parcourt sortedPromos (même ordre que les colonnes)
    //
    sortedPromos.forEach((promo) => {
      const val = (rowData[promo.nom] ?? '').toLowerCase();

      if (rowData[promo.nom] === 'VACANCES') {
        // Vacances
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLOR.VAC_BDX },
        };
        row.getCell(promo.nom).font = {
          name: FONT_NAME,
          italic: true,
          color: { argb: COLOR.TEXT_DEFAULT },
        };
      } else if (val.includes('entreprise')) {
        // Entreprise
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLOR.ENTREPRISE },
        };
        row.getCell(promo.nom).font = {
          name: FONT_NAME,
          color: { argb: COLOR.TEXT_DEFAULT },
        };
      } else if (
        val.includes('stage') ||
        val.includes('mobilité') ||
        val.includes('mobilite') ||
        val.includes('international')
      ) {
        // Stage / Mobilité
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLOR.STAGE_MOBILITY },
        };
        row.getCell(promo.nom).font = {
          name: FONT_NAME,
          color: { argb: COLOR.TEXT_DEFAULT },
        };
      } else if (
        val.includes('rattrapage') ||
        val.includes('examen') ||
        val.includes('partiel') ||
        val.includes('jury') ||
        rowData[promo.nom] === 'Soutenance'
      ) {
        // Partiels, rattrapages, jurys, soutenances → ALERT_RED
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLOR.ALERT_RED },
        };
        row.getCell(promo.nom).font = {
          name: FONT_NAME,
          bold: true,
          color: { argb: COLOR.TEXT_WHITE },
        };
      } else if (promosEnCours.includes(promo.nom)) {
        // Cours → couleur cycle
        const cycleIndex = cycleIndexMap[promo.id_cycle] ?? 0;
        const yearIndex = yearInCycleMap[promo.id] ?? 0;
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: getCycleColor(cycleIndex, yearIndex) },
        };
        row.getCell(promo.nom).font = {
          name: FONT_NAME,
          color: { argb: COLOR.TEXT_DEFAULT },
        };
      }
    });

    //
    // Couleur evenements JUNIA vs EXTERNES
    //
    // Colonne JUNIA
    if (rowData.eventsJunia) {
      row.getCell('eventsJunia').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLOR.EVENT_JUNIA },
      };

      row.getCell('eventsJunia').font = {
        name: FONT_NAME,
        color: { argb: COLOR.TEXT_DEFAULT },
      };
    }

    // Colonne EXTERNAL
    if (rowData.eventsExternal) {
      row.getCell('eventsExternal').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLOR.EVENT_OTHER },
      };

      row.getCell('eventsExternal').font = {
        name: FONT_NAME,
        color: { argb: COLOR.TEXT_DEFAULT },
      };
    }

    //
    // Semaine suivante
    //
    currentDate.setDate(currentDate.getDate() + 7);
  }

  //
  // ────────── BORDURES ──────────
  //
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  //
  // ────────── MISE EN FORME GLOBALE ──────────
  //

  // Centrer + retour à la ligne sur toutes les cellules
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    });
  });

  // Zoom automatique (80% par défaut, stable)
  worksheet.views = [
    {
      state: 'normal',
      zoomScale: 75,
    },
  ];

  //
  // ────────── EXPORT EXCEL ──────────
  //
  const filePath = path.join(__dirname, '../../files', 'EdtMacro.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
