import ExcelJS from 'exceljs';
import path from 'path';
import { getWeekNumber, getPublicHolidays, getHolidays } from '../tools/holidaysAndWeek';
import { EdtMacroData, Promos } from '../types/EdtMacroData';

export const generateEdtMacro = async (data: EdtMacroData) => {

  //
  // ──────────────────────────────────────────────────────────────
  // ALIGNER LA DATE DE DÉBUT SUR UN LUNDI
  // ──────────────────────────────────────────────────────────────
  //
  let currentDate = new Date(data.DateDeb);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }

  //
  // ──────────────────────────────────────────────────────────────
  // PARAMÈTRES CYPRE
  // ──────────────────────────────────────────────────────────────
  //
  let weekCount = 1;
  let adiStarted = false;
  let adiStartWeek = 1;

  //
  // ──────────────────────────────────────────────────────────────
  // EXCEL SETUP
  // ──────────────────────────────────────────────────────────────
  //
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MultiPromo');

  const columns: any[] = [
    { header: "Numéro de la semaine", key: "weekNumber", width: 18 },
    { header: "La semaine commence le lundi :", key: "mondayDate", width: 20 },
    { header: "Pedago dont jurys", key: "pedagoJury", width: 20 },
    { header: "Jurys", key: "jury", width: 20 },
    { header: "Jour fériés / congés", key: "holidays", width: 22 },
    { header: "Semaine de cours num CyPré", key: "cypreWeek", width: 22 },
    { header: "Nombre Epreuves surveillées semaine", key: "examsNumber", width: 25 },
    { header: "Evenements Promo / RE / conf / salon", key: "events", width: 25 },
  ];

  //
  // ──────────────────────────────────────────────────────────────
  // AJOUT DES PROMOS EN COLONNES + TRI DES PÉRIODES
  // ──────────────────────────────────────────────────────────────
  //
  data.Promos.forEach((promo: Promos) => {
    columns.push({ header: promo.nom, key: promo.nom, width: 22 });

    if (promo.periode && promo.periode.length > 0) {
      promo.periode.sort(
        (a, b) =>
          new Date(a.DateDebutP).getTime() -
          new Date(b.DateDebutP).getTime()
      );

    }
  });

  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);
  headerRow.height = 50;
  worksheet.getCell('G1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF99FF99' },
  };

  //
  // ──────────────────────────────────────────────────────────────
  // VACANCES & JOURS FÉRIÉS
  // ──────────────────────────────────────────────────────────────
  //
  const publicHolidays = await getPublicHolidays(data.DateDeb.getFullYear());
  const holidays = await getHolidays("Bordeaux", data.DateDeb.getFullYear());


  type Holiday = {
    start_date: string;
    end_date: string;
    description: string;
  };

  // Tri vacances par date
  let isPublicHolliday: boolean = false;

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
  while (currentDate < data.DateFin) {

    //
    // ────────── DÉTERMINATION DES VACANCES / JOURS FÉRIÉS ──────────
    //
    let holidayDescription = "";
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
      mondayDate: currentDate.toLocaleDateString("fr-FR"),
      pedagoJury: "",
      jury: "",
      holidays: holidayDescription,
      cypreWeek: "",
      examsNumber: "",
      events: "",
    };

    const promosEnCours: string[] = [];

    //
    // ────────── LOGIQUE PAR PROMO ──────────
    //
    data.Promos.forEach(promo => {
      const periodes = promo.periode ?? [];

      // Bornes de la semaine (lundi → dimanche)
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      //
      // 1) Aucune période définie pour cette promo
      //
      if (periodes.length === 0) {
        if (promo.type === "Initial") {
          // Initial : vacances visibles
          if (holidayDescription.includes("Vacances")) {
            rowData[promo.nom] = "VACANCES";
          } else {
            rowData[promo.nom] = "";
            promosEnCours.push(promo.nom); // cours
          }
        } else {
          // Apprentissage : jamais de vacances, cours par défaut
          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom);
        }
        return;
      }

      //
      // 2) On cherche une période active qui recouvre AU MOINS une partie de la semaine
      //
      const active = periodes.find(p => {
        const start = new Date(p.DateDebutP);
        const end = new Date(p.DateFinP);
        return end >= weekStart && start <= weekEnd;
      });

      //
      // 3) Cas : il y a un évènement actif cette semaine
      //
      if (active) {
        const t = active.type.toLowerCase();

        if (t.includes("rattrapage")) {
          // "Rattrapage semestre 1 ou 3", etc.
          rowData[promo.nom] = active.type;
        } else if (t.includes("stage")) {
          // "Stage Exécutant 1 mois" / "Stage International Break 2 mois"
          rowData[promo.nom] = active.type;
        } else if (t.includes("mobilité")) {
          rowData[promo.nom] = active.type; // "Mobilité internationale"
        } else if (t.includes("projet de fin") || t.includes("pfe")) {
          rowData[promo.nom] = active.type; // "Projet de fin d'études"
        } else if (t.includes("entreprise")) {
          rowData[promo.nom] = active.type; // "Entreprise"
        } else {
          // Évènement inconnu → on considère que c'est une semaine de cours
          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom);
        }

        return;
      }

      //
      // 4) Cas : aucun évènement actif cette semaine
      //
      if (promo.type === "Initial") {
        if (holidayDescription.includes("Vacances")) {
          rowData[promo.nom] = "VACANCES";
        } else {
          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom); // cours
        }
      } else {
        // Apprentissage : pas de vacances → cours
        rowData[promo.nom] = "";
        promosEnCours.push(promo.nom);
      }
    });




    //
    // ────────── CYPRE : semaine numérotée si cours ADI1 en cours ──────────
    //
    if (adiStarted) {
      if (!holidayDescription.includes("Vacances")) {
        rowData.cypreWeek = `Se${((weekCount - adiStartWeek) % 16) + 1}`;
        weekCount++;
      }
    }

    //
    // ────────── AJOUT DE LA LIGNE DANS EXCEL ──────────
    //
    const row = worksheet.addRow(rowData);

    //
    // Couleurs : Soutenance
    //
    data.Promos.forEach(promo => {
      if (rowData[promo.nom] === "Soutenance") {
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF99CC' },
        };
        row.getCell(promo.nom).font = { bold: true };
      }
    });

    //
    // Couleurs : Rattrapage
    //
    data.Promos.forEach(promo => {
      if (rowData[promo.nom]?.toLowerCase().includes("rattrapage")) {
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
        };
        row.getCell(promo.nom).font = { bold: true };
      }
    });

    //
    // Couleurs : cours (vert)
    //
    promosEnCours.forEach(nom => {
      row.getCell(nom).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF99FF99' },
      };
    });

    //
    // Couleur jours fériés
    //
    if (isPublicHoliday) {
      row.getCell("holidays").font = { color: { argb: "FF0000" } };
    }

    //
    // Semaine suivante
    //
    currentDate.setDate(currentDate.getDate() + 7);
  }

  //
  // ────────── BORDURES ──────────
  //
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  //
  // ────────── EXPORT EXCEL ──────────
  //
  const filePath = path.join(__dirname, '../../files', 'EdtMacro.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
