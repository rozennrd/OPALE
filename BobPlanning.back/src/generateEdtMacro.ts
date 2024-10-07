import ExcelJS from 'exceljs';
import path from 'path';

export const generateEdtMacro = async (startDate: Date, endDate: Date) => {
  let currentDate: Date = new Date(startDate);

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

    //TODO verif currentDate = lundi
    worksheet.addRow({
      weekNumber: '',
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