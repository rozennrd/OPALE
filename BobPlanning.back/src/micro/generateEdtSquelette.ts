import ExcelJS from 'exceljs';
import path from 'path';

interface Cours {
  Matiere: string;
  HeureDebut: string;
  HeureFin: string;
  Professeur: string;
  Salle: string;
}

interface Semaine {
  Jour: string;
  EnCours: boolean;
  Message: string;
  Cours: Cours[];
}

interface Promo {
  Name: string;
  Semaine: Semaine[];
}

interface EdtMicro {
  DateDebut: string;
  Promo: Promo[];
}

interface ColumnsData {
  EdtMicro: EdtMicro[];
}

const generateLightColor = (): string => {
  const colors = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateEdtSquelette = async (columnsData: ColumnsData): Promise<string> => {
  const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  const worksheet: ExcelJS.Worksheet = workbook.addWorksheet('Emploi du Temps');

  const heures: string[] = [
    ' ', '7h30', '8h', '8h30', '9h', '9h30', '10h', '10h30', '11h', '11h30', '12h',
    '12h30', '13h', '13h30', '14h', '14h30', '15h', '15h30', '16h', '16h30', '17h', '17h30', '18h', '18h30', '19h'
  ];

  const joursSemaine: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const edtMicro = columnsData.EdtMicro[0];
  const startDate = new Date(edtMicro.DateDebut);
  const promos = edtMicro.Promo;
  const nombreColonnes = promos.length;

  const jourCouleurs = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];
  const matiereCouleurs: { [matiere: string]: string } = {};

  joursSemaine.forEach((jour, jourIndex) => {
    const dateCellIndex = jourIndex * nombreColonnes + 2;
    const currentDayDate = new Date(startDate);
    currentDayDate.setDate(startDate.getDate() + jourIndex);

    worksheet.getRow(2).getCell(dateCellIndex).value = currentDayDate.toLocaleDateString("fr-FR");
    worksheet.getRow(2).getCell(dateCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(2).getCell(dateCellIndex).font = { bold: true };

    worksheet.getRow(3).getCell(dateCellIndex).value = jour;
    worksheet.getRow(3).getCell(dateCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(3).getCell(dateCellIndex).font = { bold: true };
    worksheet.getRow(3).getCell(dateCellIndex).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: jourCouleurs[jourIndex] },
    };

    if (nombreColonnes > 1) {
      worksheet.mergeCells(2, dateCellIndex, 2, dateCellIndex + nombreColonnes - 1);
      worksheet.mergeCells(3, dateCellIndex, 3, dateCellIndex + nombreColonnes - 1);
    }

    promos.forEach((promo, promoIndex) => {
      const promoIndexCell = dateCellIndex + promoIndex;
      worksheet.getRow(4).getCell(promoIndexCell).value = promo.Name;
      worksheet.getRow(4).getCell(promoIndexCell).alignment = { horizontal: 'center' };
      worksheet.getRow(4).getCell(promoIndexCell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: jourCouleurs[jourIndex] },
      };

      const semaine = promo.Semaine.find((s) => s.Jour === jour);
      if (semaine) {
        const startHourIndex = 1; // Index de 7h30
        const endHourIndex = heures.length - 1; // Index de 19h

        // Afficher le message sur toutes les cellules si EnCours est false
        if (!semaine.EnCours) {
          worksheet.mergeCells(startHourIndex + 5, promoIndexCell, endHourIndex + 4, promoIndexCell);
          const messageCell = worksheet.getRow(startHourIndex + 5).getCell(promoIndexCell);
          messageCell.value = semaine.Message || "journée sans cours";
          messageCell.alignment = { horizontal: 'center', vertical: 'middle' };
          messageCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCCCCC' },
          };
          return; // Passer à la journée suivante
        }

        // Afficher les cours si EnCours est true
        semaine.Cours.forEach((coursData) => {
          if (!matiereCouleurs[coursData.Matiere]) {
            matiereCouleurs[coursData.Matiere] = generateLightColor();
          }
          const matiereColor = matiereCouleurs[coursData.Matiere];

          const startHourIndex = heures.indexOf(coursData.HeureDebut);
          const endHourIndex = heures.indexOf(coursData.HeureFin);

          worksheet.mergeCells(startHourIndex + 5, promoIndexCell, endHourIndex + 4, promoIndexCell);

          const cell = worksheet.getRow(startHourIndex + 5).getCell(promoIndexCell);
          const duration = endHourIndex - startHourIndex;

          if (duration >= 3) {
            cell.value = `${coursData.Matiere}\nProf: ${coursData.Professeur}\nSalle: ${coursData.Salle}`;
          } else {
            cell.value = `${coursData.Matiere} | Prof: ${coursData.Professeur} | Salle: ${coursData.Salle}`;
          }
          cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: matiereColor },
          };
        });
      }
    });
  });

  joursSemaine.forEach((_, jourIndex) => {
    const baseIndex = jourIndex * nombreColonnes + 2;
    for (let i = 0; i < nombreColonnes; i++) {
      worksheet.getColumn(baseIndex + i).width = 25;
    }
  });

  // Colonne des heures à gauche
  const hoursColumnLeftIndex = 1;
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).alignment = { horizontal: 'center' };
  worksheet.getColumn(hoursColumnLeftIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5);
    const hourCell = row.getCell(hoursColumnLeftIndex);
    hourCell.value = heure;
    hourCell.alignment = { horizontal: 'center' };
    const colorIndex = Math.floor(index / 2) % 2;
    hourCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: ['FFFFFF', 'DDDDDD'][colorIndex] },
    };
  });

  // Colonne des heures à droite du dernier jour (vendredi)
  const hoursColumnRightIndex = (joursSemaine.length * nombreColonnes + 2); // Index à droite
  worksheet.getRow(4).getCell(hoursColumnRightIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnRightIndex).alignment = { horizontal: 'center' };
  worksheet.getColumn(hoursColumnRightIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5);
    const hourCell = row.getCell(hoursColumnRightIndex);
    hourCell.value = heure;
    hourCell.alignment = { horizontal: 'center' };
    const colorIndex = Math.floor(index / 2) % 2;
    hourCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: ['FFFFFF', 'DDDDDD'][colorIndex] },
    };
  });

  const totalRows = worksheet.rowCount;
  const totalColumns = worksheet.columnCount;

  for (let rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
    for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }

    // Enregistrement du fichier
    const filePath = path.resolve(__dirname, '../..//files/EdtMicro.xlsx');
    await workbook.xlsx.writeFile(filePath);
    
    return filePath;
  };
  