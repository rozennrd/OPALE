import ExcelJS from 'exceljs';
import path from 'path';
import { getWeekNumber, getPublicHolidays, getHolidays } from '../tools/holidaysAndWeek';
import { EdtMacroData, Promos } from '../types/EdtMacroData';

export const generateEdtMacro = async (data: EdtMacroData) => {

  // --- Align start date on Monday ---
  let currentDate = new Date(data.DateDeb);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }

  // CyPré week calculation
  let weekCount = 1;
  let adiStarted = false;
  let adiStartWeek = 1;
  let endperiodeInitial = new Date();

  // --- Excel init ---
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MultiPromo');

  let columns: any[] = [
    { header: "Numéro de la semaine", key: "weekNumber", width: 20 },
    { header: "La semaine commence le lundi :", key: "mondayDate", width: 20 },
    { header: "Pedago dont jurys", key: "pedagoJury", width: 20 },
    { header: "Jurys", key: "jury", width: 20 },
    { header: "Jour fériés / congés", key: "holidays", width: 20 },
    { header: "Semaine de cours num CyPré", key: "cypreWeek", width: 20 },
    { header: "Nombre Epreuves surveillées semaine", key: "examsNumber", width: 20 },
    { header: "Evenements Promo / RE / conf / salon", key: "events", width: 20 },
  ];

  // Add promo columns
  data.Promos.forEach((promo: Promos) => {
    columns.push({ header: promo.nom, key: promo.nom, width: 20 });

    // Sort periods if any
    if (promo.periode && promo.periode.length > 0) {
      promo.i = 0;
      promo.periode.sort((a, b) =>
        new Date(a.DateDebutP).getTime() - new Date(b.DateDebutP).getTime()
      );
    }

    // First ADI period for CyPré
    if (promo.nom === "ADI1" && promo.periode.length > 0) {
      endperiodeInitial = new Date(promo.periode[0].DateFinP);
    }

    console.log("PROMO", promo.nom, "periode:", promo.periode);
  });

  worksheet.columns = columns;

  // Header formatting
  const headerRow = worksheet.getRow(1);
  worksheet.getCell('G1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF99FF99' },
  };
  headerRow.height = 50;
  headerRow.alignment = { wrapText: true };

  // Holidays
  const publicHolidays = await getPublicHolidays(data.DateDeb.getFullYear());
  const holidays = await getHolidays("Bordeaux", data.DateDeb.getFullYear());

  let i = 0;
  const sortedHolidays = holidays.sort(
    (a: { start_date: string; end_date: string; description: string },
     b: { start_date: string; end_date: string; description: string }) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  let holydayStart = new Date(sortedHolidays[i].start_date);
  let holydayEnd = new Date(sortedHolidays[i].end_date);

  let rattrapageFirst = true;
  let rattrapageSecond = true;

  // --- MAIN LOOP THROUGH WEEKS ---
  while (currentDate < data.DateFin) {

    // Holiday detection
    let holidayDescription = "";
    let isPublicHoliday = false;

    if (currentDate > holydayStart && currentDate < holydayEnd) {

      // Toussaint case
      if (sortedHolidays[i].description === "Vacances de la Toussaint") {
        for (let j = 0; j < 7; j++) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + j);
          if (publicHolidays[d.toISOString().split('T')[0]]) {
            holidayDescription += "Vacances de la Toussaint + Toussaint";
          }
        }
      } else {
        holidayDescription += sortedHolidays[i].description;
      }

    } else {
      // Weekday public holidays
      for (let j = 0; j < 5; j++) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + j);
        const key = d.toISOString().split('T')[0];
        if (publicHolidays[key]) {
          holidayDescription += " " + publicHolidays[key];
          isPublicHoliday = true;
        }
      }
    }

    // Move to next holiday period
    if (holydayEnd < currentDate && i < sortedHolidays.length - 1) {
      i++;
      holydayStart = new Date(sortedHolidays[i].start_date);
      holydayEnd = new Date(sortedHolidays[i].end_date);
    }

    // Row structure
    let rowData: any = {
      weekNumber: getWeekNumber(currentDate),
      mondayDate: currentDate.toLocaleDateString("fr-FR"),
      pedagoJury: "",
      jury: "",
      holidays: holidayDescription,
      cypreWeek: "",
      examsNumber: "",
      events: "",
    };

    let promosEnCours: string[] = [];

    let setFirst = true;
    let setSecond = true;

    // --- PROCESS PROMOS ---
    data.Promos.forEach(promo => {

      // ============================
      // UNIVERSAL PROTECTION
      // ============================
      if (!promo.periode || promo.periode.length === 0) {

        if (holidayDescription.includes("Vacances")) {
          rowData[promo.nom] = "VACANCES";
        } else {
          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom);
        }

        return; // ← STOP HERE — avoids any access to promo.periode[i]
      }

      const currentPeriod = promo.periode[promo.i];
      const dStart = new Date(currentPeriod.DateDebutP);
      const dEnd = new Date(currentPeriod.DateFinP);

      // ============================
      // FORMATION INITIALE
      // ============================
      if (["ADI1","ADI2","CIR1","CIR2","ISEN3","ISEN4","ISEN5"].includes(promo.nom)) {

        if (dEnd < currentDate) {

          if (rattrapageSecond) {
            setSecond = false;
            rowData[promo.nom] = "Rattrapage semestre 2 ou 4";
          }
          else if (["ADI1","CIR1"].includes(promo.nom)) {
            rowData[promo.nom] = currentPeriod.type;  // Stage 1 mois
          }
          else if (["ADI2","CIR2"].includes(promo.nom)) {
            rowData[promo.nom] = currentPeriod.type;  // Stage 2 mois
          }
          else {
            rowData[promo.nom] = "";
          }

        }
        else if (holidayDescription.includes("Vacances")) {

          if (rattrapageFirst && holidayDescription.includes("Vacances d'Hiver")) {
            setFirst = false;
            rowData[promo.nom] = "Rattrapage semestre 1 ou 3";
          } else {
            rowData[promo.nom] = "VACANCES";
          }

        }
        else if (dStart <= currentDate) {

          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom);

          if (!adiStarted) {
            adiStarted = true;
            adiStartWeek = weekCount;
          }

        } else {
          rowData[promo.nom] = "";
        }
      }

        // ============================
        // FORMATION CONTINUE : AP3 / AP4 / AP5
      // ============================
      else if (["AP3","AP4","AP5"].includes(promo.nom)) {

        if (dStart <= currentDate && dEnd >= currentDate) {
          rowData[promo.nom] = "";
          promosEnCours.push(promo.nom);
        }

        else if (promo.nom === "AP4" && promo.i === promo.periode.length - 1 && dEnd < currentDate) {
          rowData[promo.nom] = "Mobilité Internationale";
        }

        else if (
          promo.nom === "AP5" &&
          promo.i === promo.periode.length - 1 &&
          dEnd < currentDate &&
          currentDate.getTime() < data.DateFin.getTime() - 7*24*60*60*1000
        ) {
          rowData[promo.nom] = "Projet de fin d'études";
        }

        else if (dEnd < currentDate) {
          if (promo.i < promo.periode.length - 1) promo.i++;
          rowData[promo.nom] = "Entreprise";
        }

        else if (dStart > currentDate) {
          rowData[promo.nom] = "Entreprise";
        }

        else {
          rowData[promo.nom] = "";
        }

        // Soutenance (dernière semaine)
        if (
          promo.nom === "AP5" &&
          currentDate.getTime() >= data.DateFin.getTime() - 7*24*60*60*1000
        ) {
          rowData[promo.nom] = "Soutenance";
        }

      }

    });

    // Update rattrapage flags
    if (!setFirst) rattrapageFirst = false;
    if (!setSecond) rattrapageSecond = false;

    // CyPré logic
    if (adiStarted) {
      if (holidayDescription.includes("Vacances") || holidayDescription.includes("Stage")) {
        rowData.cypreWeek = "";
      } else if (currentDate < endperiodeInitial) {
        rowData.cypreWeek = `Se${((weekCount - adiStartWeek) % 16) + 1}`;
      }
    }

    // Add row
    let row = worksheet.addRow(rowData);

    if (adiStarted && !holidayDescription.includes("Vacances")) {
      weekCount++;
    }

    // Colors : Soutenance
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

    // Colors : Rattrapage
    data.Promos.forEach(promo => {
      if (rowData[promo.nom]?.includes("Rattrapage")) {
        row.getCell(promo.nom).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
        };
        row.getCell(promo.nom).font = { bold: true };
      }
    });

    // Colors : cours (green)
    promosEnCours.forEach(nom => {
      row.getCell(nom).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF99FF99' },
      };
    });

    // Public holiday : red
    if (isPublicHoliday) {
      row.getCell('holidays').font = { color: { argb: 'FF0000' } };
    }

    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Borders
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

  // Save file
  const filePath = path.join(__dirname, '../../files', 'EdtMacro.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
