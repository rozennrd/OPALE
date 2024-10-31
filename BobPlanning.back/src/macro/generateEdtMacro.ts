import ExcelJS from 'exceljs';
import path from 'path';
import { getWeekNumber, getPublicHolidays, getHolidays } from '../tools/holidaysAndWeek';
import { EdtMacroData } from '../types/EdtMacroData';

export const generateEdtMacro = async (data: EdtMacroData) => {

  // Set date to lundi
  let currentDate: Date = new Date(data.DateDeb);
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
  data.Promos.forEach(promo => {
    columns.push({ header: promo.Name, key: promo.Name, width: 20 });
    //Order periode
    if (Array.isArray(promo.Periode) && promo.Periode.length > 0) {
      promo.i = 0;
      promo.Periode.sort((a: any, b: any) => new Date(a.DateDebutP).getTime() - new Date(b.DateDebutP).getTime());
    };
    if (promo.Name === "ADI1") {
      console.log(promo.Periode[0].DateFinP);
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
  const publicHolidays = await getPublicHolidays(data.DateDeb.getFullYear());
  const holidays = await getHolidays("Bordeaux", data.DateDeb.getFullYear());

  let i: number = 0;

  //Tri vacances par date
  let isPublicHolliday: boolean = false;
  const sortedHolidays = holidays.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  let holydayStartDate = new Date(sortedHolidays[i].start_date);
  let holydayEndDate = new Date(sortedHolidays[i].end_date);

  let rattrapageFirstSemester = true;
  let rattrapageSecondSemester = true;
  //Loop through the weeks
  while (currentDate < data.DateFin) {
    let holidayDescription: string = "";
    isPublicHolliday = false;

    //gestion vacances scolaires
    if (currentDate > holydayStartDate && currentDate < holydayEndDate) {
      // 1 seule semaine de vacances pour la toussaint (sur jours feries)
      if (sortedHolidays[i].description === "Vacances de la Toussaint") {
        for (let i = 0; i < 7; i++) {
          const currentWeekDate = new Date(currentDate);
          currentWeekDate.setDate(currentWeekDate.getDate() + i);
          if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {
            ;
            holidayDescription += "Vacances de la toussaint + toussaint";
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
        if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {
          ;
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

    let promosEnCours: string[] = [];

    let setFirstRattrapage = true; 
    let setSecondRattrapage = true;
    //Information semaine par promo
    data.Promos.forEach(promo => {

      //Gestion formation initiale
      if (promo.Name === "ADI1" || promo.Name === "ADI2" || promo.Name === "CIR1" || promo.Name === "CIR2" || promo.Name === "ISEN3" || promo.Name === "ISEN4" || promo.Name === "ISEN5") {
        if (promo.Periode && promo.Periode.length > 0) {
          if (new Date(promo.Periode[0].DateFinP) < currentDate) {
            if (rattrapageSecondSemester) {
              setSecondRattrapage = false;
              rowData[promo.Name] = "Rattrapage semestre 2 ou 4";
            } else if (promo.Name === "ADI1" || promo.Name === "CIR1") {
              rowData[promo.Name] = "Stage Exécutant 1 mois";
            } else if (promo.Name === "ADI2" || promo.Name === "CIR2") {
              rowData[promo.Name] = "Stage International Break 2 mois";
            } else {
              rowData[promo.Name] = "";
              //TODO gerer cas isen (voir avec damien cas précis)
            }
          } else if (holidayDescription.includes("Vacances")) {
            if (rattrapageFirstSemester && holidayDescription.includes("Vacances d'Hiver")) {
                setFirstRattrapage = false;
                rowData[promo.Name] = "Rattrapage semestre 1 ou 3";
            } else {
              rowData[promo.Name] = "VACANCES";
            }
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
        } else {
          console.log(`Aucune période définie pour la promo ${promo.Name}`);
          rowData[promo.Name] = "Aucune période";
        }
      }

      //Gestion formation continue
    
      else if (promo.Name === "AP3" || promo.Name === "AP4" || promo.Name === "AP5") {

        // Remplir les semaines pour "AP3", "AP4", "AP5"
        if (promo.Periode && promo.Periode.length > 0 && new Date(promo.Periode[promo.i].DateDebutP) <= currentDate && new Date(promo.Periode[promo.i].DateFinP) >= currentDate) {
          rowData[promo.Name] = "";
          promosEnCours.push(promo.Name);
        }

        // Cas spécifique pour "Mobilité Internationale" pour "AP4"
        else if (promo.Name === "AP4" && promo.Periode && promo.i === promo.Periode.length - 1 && new Date(promo.Periode[promo.i].DateFinP) < currentDate) {
          rowData[promo.Name] = "Mobilité Internationale";
        }

        // Cas spécifique pour "Projet de fin d'études" uniquement jusqu'à l'avant-dernière semaine
        else if (promo.Name === "AP5" && promo.Periode && promo.i === promo.Periode.length - 1 && new Date(promo.Periode[promo.i].DateFinP) < currentDate && currentDate.getTime() < data.DateFin.getTime() - 7 * 24 * 60 * 60 * 1000) {
          rowData[promo.Name] = "Projet de fin d'études";
        }

        // Cas général pour "Entreprise"
        else if (promo.Periode && new Date(promo.Periode[promo.i].DateFinP) < currentDate) {
          if (i < promo.Periode.length) {
            promo.i++;
          }
          rowData[promo.Name] = "Entreprise";
        } else if (promo.Periode && new Date(promo.Periode[promo.i].DateDebutP) > currentDate) {
          rowData[promo.Name] = "Entreprise";
        } else {
          rowData[promo.Name] = "";
        }

        // Ajouter "Soutenance" uniquement pour la dernière semaine
        if (promo.Name === "AP5" && currentDate.getTime() >= data.DateFin.getTime() - 7 * 24 * 60 * 60 * 1000) {
          rowData[promo.Name] = "Soutenance";
        }
      }

    });

    
    if (!setFirstRattrapage) {
      rattrapageFirstSemester = false;
    }
    if (!setSecondRattrapage) {
      rattrapageSecondSemester = false;
    }


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
    data.Promos.forEach(promo => {
      if (rowData[promo.Name] == "Soutenance") {
        row.getCell(promo.Name).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF99CC' },
        };
        row.getCell(promo.Name).font = { bold: true };
      }
    });

    data.Promos.forEach(promo => {
      if (rowData[promo.Name].includes("Rattrapage semestre")) {
        row.getCell(promo.Name).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
        };
        row.getCell(promo.Name).font = { bold: true };
      }
    });

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
  const filePath = path.join(__dirname, '../../files', 'EdtMacro.xlsx');

  //Writes files
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};