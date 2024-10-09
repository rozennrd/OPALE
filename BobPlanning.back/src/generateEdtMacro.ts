import ExcelJS from 'exceljs';
import path from 'path';
import axios from 'axios';
import { console } from 'inspector';

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

async function getPublicHolidays(startYear: number): Promise<Record<string, string>> {
  const endYear = startYear + 1;
  const urlFirstYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${startYear}.json`;
  const urlLastYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${endYear}.json`;

  let holidays: Record<string, string> = {};

  try {
    const [holidays2023, holidays2024] = await Promise.all([
      fetch(urlFirstYear).then((response) => response.json()),
      fetch(urlLastYear).then((response) => response.json()),
    ]);

    holidays = { ...holidays2023, ...holidays2024 };

  } catch (error) {
    console.error("Error fetching public holidays: ", error);
  }
  return holidays;
}

async function getHolidays(city: string = "Bordeaux", startYear: number): Promise<any> {
  const scholarYear = `${startYear}-${startYear + 1}`;
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?`;
  
  let holidays: Record<string, string>[] = [];

  try {
    console.log("Fetching school holidays...");
    holidays = await axios.get(url, {
      params: {
        where: `location="${city}"`,
        limit: 20,
        refine: `annee_scolaire:${scholarYear}`,
      }
    }).then((response) => response.data.results);
  } catch (error) {
    console.error("Error fetching school holidays: ", error);
  }

  return holidays;
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

  const publicHolidays = await getPublicHolidays(startDate.getFullYear());

  const holidays = await getHolidays("Bordeaux", startDate.getFullYear());

  let i: number = 0;
  let isPublicHolliday: boolean = false;
  const sortedHolidays = holidays.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  let holydayStartDate = new Date(sortedHolidays[i].start_date);
  let holydayEndDate = new Date(sortedHolidays[i].end_date);
  while (currentDate < endDate) {
    let holidayDescription : string = ""; 
    isPublicHolliday = false; 

    //gestion vacances scolaires
    if (currentDate > holydayStartDate && currentDate < holydayEndDate) {
      if (sortedHolidays[i].description === "Vacances de la Toussaint") {
        for (let i = 0; i < 7; i++) {
          const currentWeekDate = new Date(currentDate);
          currentWeekDate.setDate(currentWeekDate.getDate() + i);
          if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {;
            holidayDescription += "Vacances de la toussaint ";
          } 
        }
      } else {
        holidayDescription += " " + sortedHolidays[i].description;
      }
    } else {
      //Verif seulement sur jour ouvert (lundi au vendredi)
      for (let i = 0; i < 5; i++) {
        const currentWeekDate = new Date(currentDate);
        currentWeekDate.setDate(currentWeekDate.getDate() + i);
        if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {;
          holidayDescription += " " + publicHolidays[currentWeekDate.toISOString().split('T')[0]];
          isPublicHolliday = true;
        } 
      }
    }

    if (holydayEndDate < currentDate && i < sortedHolidays.length - 1) {
      i++;
      holydayStartDate = new Date(sortedHolidays[i].start_date);
      holydayEndDate = new Date(sortedHolidays[i].end_date);
    }
    
    let row = worksheet.addRow({
      weekNumber: getWeekNumber(currentDate),
      mondayDate: currentDate.toLocaleDateString("fr-FR"),
      pedagoJury: '',
      jury: '',
      holidays: holidayDescription,
      cypreWeek: '',
      examsNumber: '',
      events: '',
    });

    if (isPublicHolliday) {
      row.getCell('holidays').font = { color: { argb: 'FF0000' } }; // Set font color to red (ARGB format)
    }

    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  const filePath = path.join(__dirname, '../files', 'EdtMacro.xlsx');

  await workbook.xlsx.writeFile(filePath);

  return filePath;
};