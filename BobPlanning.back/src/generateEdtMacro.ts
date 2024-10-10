import ExcelJS from 'exceljs';
import path from 'path';
import axios from 'axios';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

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

export const generateEdtMacro = async (startDate: Date, endDate: Date, promos: any[]) => {
  
  // Set date to lundi
  let currentDate: Date = new Date(startDate);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }

  //For column cypre
  let weekCount = 1;
  let adiStarted = false; 
  let adiStartWeek = 1;
  let endPeriodeInitial = new Date();

  //Generate Excel
  const workbook = new ExcelJS.Workbook();
  //Add a page to the Excel
  const worksheet = workbook.addWorksheet('MultiPromo');

  //Add columns
  let columns = [
    { header: "Numéro de la semaine", key: "weekNumber", width: 20 },
    { header: "La semaine commence le lundi :", key: "mondayDate", width: 20 },
    { header: "Pedago dont jurys", key: "pedagoJury", width: 20 },
    { header: "Jurys", key: "jury", width: 20 },
    { header: "Jour fériés / congés", key: "holidays", width: 20 },
    { header: "Semaine de cours num CyPré", key: "cypreWeek", width: 20 },
    { header: "Nombre Epreuves surveillées semaine (cellule conditionnelle)", key: "examsNumber", width: 20 },
    { header: "Evenements Promo/ RE/conf/salon", key: "events", width: 20 },
  ];
  promos.forEach(promo => {   
    columns.push({ header: promo.Name, key: promo.Name, width: 20 });
    //Order periode
    if (Array.isArray(promo.Periode) && promo.Periode.length > 0) {
      promo.i = 0; 
      promo.Periode.sort((a: any, b: any) => new Date(a.DateDebutP).getTime() - new Date(b.DateDebutP).getTime());
    };
    if (promo.Name === "ADI1") {
      endPeriodeInitial = new Date(promo.Periode[0].DateFinP);
    }
  });
  worksheet.columns = columns;

 // Appliquer la couleur verte à la première ligne
 const headerRow = worksheet.getRow(1);
 const examsNumberCell = worksheet.getCell('G1');
   examsNumberCell.fill = {
     type: 'pattern',
     pattern: 'solid',
     fgColor: { argb: 'FF99FF99' }, // vert clair
   };
   
 headerRow.height = 50; 
 headerRow.alignment = { wrapText: true };

  //Get holidays
  const publicHolidays = await getPublicHolidays(startDate.getFullYear());
  const holidays = await getHolidays("Bordeaux", startDate.getFullYear());

  let i: number = 0;

  //Tri vacances par date
  let isPublicHolliday: boolean = false;
  const sortedHolidays = holidays.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  let holydayStartDate = new Date(sortedHolidays[i].start_date);
  let holydayEndDate = new Date(sortedHolidays[i].end_date);

  //Loop through the weeks
  while (currentDate < endDate) {
    let holidayDescription : string = ""; 
    isPublicHolliday = false; 

    //gestion vacances scolaires
    if (currentDate > holydayStartDate && currentDate < holydayEndDate) {
      // 1 seule semaine de vacances pour la toussaint (sur jours feries)
      if (sortedHolidays[i].description === "Vacances de la Toussaint") {
        for (let i = 0; i < 7; i++) {
          const currentWeekDate = new Date(currentDate);
          currentWeekDate.setDate(currentWeekDate.getDate() + i);
          if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {;
            holidayDescription += "Vacances de la toussaint ";
          } 
        }
      //Ajout des vacances scolaires
      } else {
        holidayDescription += " " + sortedHolidays[i].description;
      }
    } else {
      //Verif jours feries seulement sur jour ouvert (lundi au vendredi)
      for (let i = 0; i < 5; i++) {
        const currentWeekDate = new Date(currentDate);
        currentWeekDate.setDate(currentWeekDate.getDate() + i);
        if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {;
          holidayDescription += " " + publicHolidays[currentWeekDate.toISOString().split('T')[0]];
          isPublicHolliday = true;
        } 
      }
    }

    // Si vacances terminé, on passe a la prochaine
    if (holydayEndDate < currentDate && i < sortedHolidays.length - 1) {
      i++;
      holydayStartDate = new Date(sortedHolidays[i].start_date);
      holydayEndDate = new Date(sortedHolidays[i].end_date);
    }
    
    //Initialisation informations semaine
    let rowData: any = {
      weekNumber: getWeekNumber(currentDate),
      mondayDate: currentDate.toLocaleDateString("fr-FR"),
      pedagoJury: '',
      jury: '',
      holidays: holidayDescription,
      cypreWeek: '',
      examsNumber: '',
      events: '',
    };

    let promosEnCours : string[] = [];

    //Information semaine par promo
    promos.forEach(promo => {
      //Gestion formation initiale
      if (promo.Name === "ADI1" || promo.Name === "ADI2" || promo.Name === "CIR1" || promo.Name === "CIR2" || promo.Name === "ISEN3" || promo.Name === "ISEN4" || promo.Name === "ISEN5") {
        if (new Date(promo.Periode[0].DateFinP) < currentDate) {
          if (promo.Name === "ADI1" || promo.Name === "CIR1") {
            rowData[promo.Name] = "Stage Exécutant 1 mois";
          } else if (promo.Name === "ADI2" || promo.Name === "CIR2") {
            rowData[promo.Name] = "Stage International Break 2 mois";
          } else {
            rowData[promo.Name] = "";
            //TODO gerer cas isen (voir avec damien cas précis)
          }
        } else if (holidayDescription.includes("Vacances")) {
          rowData[promo.Name] = "VACANCES";
        } else if (new Date(promo.Periode[0].DateDebutP) <= currentDate) {
          rowData[promo.Name] = "";
          promosEnCours.push(promo.Name);
          if (!adiStarted) {
            adiStarted = true; 
            adiStartWeek = weekCount; // Capture the start week for ADI
          }
        } else {
          //Pour bordure
          rowData[promo.Name] = "";
        }
      //Gestion formation continue  
      } else if (promo.Name === "AP3" || promo.Name === "AP4" || promo.Name === "AP5") {
        if (new Date(promo.Periode[promo.i].DateDebutP) <= currentDate && new Date(promo.Periode[promo.i].DateFinP) >= currentDate) {
          rowData[promo.Name] = "";
          promosEnCours.push(promo.Name);
        } else if (new Date(promo.Periode[promo.i].DateFinP) < currentDate) {
          if (i < promo.Periode.length) {
            promo.i++;
          }
          rowData[promo.Name] = "Entreprise";
        } else if (new Date(promo.Periode[promo.i].DateDebutP) > currentDate) {
          rowData[promo.Name] = "Entreprise";
        } else {
          rowData[promo.Name] = "";
        }
      }
    });

    if (adiStarted) {
      if (holidayDescription.includes("Vacances") || holidayDescription.includes("Stage")) {
        rowData.cypreWeek = ""; // Case vide si vacances
      } else if (currentDate < endPeriodeInitial) {
        rowData.cypreWeek = `Se${((weekCount - adiStartWeek) % 16) + 1}`; // Compter jusqu'à 16 puis repartir de 1
      }
    } else {
      rowData.cypreWeek = ""; // Case vide si pas encore commencé
    }
  

    //Ajout ligne
    let row = worksheet.addRow(rowData);

    if (adiStarted && !holidayDescription.includes("Vacances")) {
      weekCount++;
    }

    promosEnCours.forEach(promEnCours => {
      row.getCell(promEnCours).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF99FF99' }, //TODO change color
        
      };
    });

    // Jours feries en rouge
    if (isPublicHolliday) {
      row.getCell('holidays').font = { color: { argb: 'FF0000' } };
    }

    // Go to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

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
  
  //Chemin fichier
  const filePath = path.join(__dirname, '../files', 'EdtMacro.xlsx');

  //Writes files
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};