import ExcelJS from 'exceljs';
import path from 'path';

function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7;

  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = target.valueOf();

  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }

  const weekNumber = 1 + Math.round(((firstThursday - target.valueOf()) / 86400000 - 3) / 7);
  return weekNumber;
}

export const generateEdtMacro = async (startDate: Date, endDate: Date) => {
  // Set date to lundi
  let currentDate: Date = new Date(startDate);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('MultiPromo');

  worksheet.columns = [
    { header: "Numéro de la semaine", key: "weekNumber", width: 20 },
    { header: "La semaine commence le lundi :", key: "mondayDate", width: 20 },
    { header: "Pedago dont jurys", key: "pedagoJury", width: 20 },
    { header: "Jurys", key: "jury", width: 20 },
    { header: "Jour fériés / congés", key: "holidays", width: 20 },
    { header: "Semaine de cours num CyPré", key: "cypreWeek", width: 20 },
    { header: "Nombre Epreuves surveillées semaine (cellule conditionnelle)", key: "examsNumber", width: 20 },
    { header: "Evenements Promo/ RE/conf/salon", key: "events", width: 20 },
  ];

  while (currentDate < endDate) {

   
    worksheet.addRow({
      weekNumber: getWeekNumber(currentDate),
      mondayDate: currentDate.toLocaleDateString("fr-FR"),
      pedagoJury: '',
      jury: '',
      holidays: '',
      cypreWeek: '',
      examsNumber: '',
      events: '',
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  const filePath = path.join(__dirname, '../files', 'EdtMacro.xlsx');

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};