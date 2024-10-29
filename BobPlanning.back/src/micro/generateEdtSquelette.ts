import ExcelJS from 'exceljs';
import path from 'path';

interface Cours {
  matiere: string;
  heureDebut: string;
  heureFin: string;
  professeur: string;
}

interface Semaine {
  jour: string;
  cours: Cours[];
}

interface Classe {
  nomClasse: string;
  semaine: Semaine[];
}

interface ColumnsData {
  classes: Classe[];
}

export const generateEdtSquelette = async (columnsData: ColumnsData): Promise<string> => {
  const currentDate: Date = new Date();
  const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  const worksheet: ExcelJS.Worksheet = workbook.addWorksheet('Emploi du Temps');

  const heures: string[] = [
    ' ', '7h30', '8h', '8h30', '9h', '9h30', '10h', '10h30', '11h', '11h30', '12h',
    '12h30', '13h', '13h30', '14h', '14h30', '15h', '15h30', '16h', '16h30', '17h', '17h30', '18h'
  ];

  const joursSemaine: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const classes: Classe[] = Array.isArray(columnsData.classes) && columnsData.classes.length > 0 
    ? columnsData.classes 
    : [{ nomClasse: 'Classe 1', semaine: [] }];

  const nombreColonnes = classes.length;
  const jourCouleurs = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];

  // Fonction pour générer une couleur hexadécimale unique
  generateRandomColor();
  
  const matiereCouleurs: { [matiere: string]: string } = {};

  joursSemaine.forEach((jour, jourIndex) => {
    const dateCellIndex = jourIndex * nombreColonnes + 2;

    // Calcul de la date pour chaque jour
    const startDate: Date = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + ((1 + 7 - currentDate.getDay()) % 7));
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

    for (let i = 0; i < nombreColonnes; i++) {
      worksheet.getRow(4).getCell(dateCellIndex + i).value = classes[i]?.nomClasse || ''; 
      worksheet.getRow(4).getCell(dateCellIndex + i).alignment = { horizontal: 'center' };
      worksheet.getRow(4).getCell(dateCellIndex + i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: jourCouleurs[jourIndex] },
      };
    }
  });

  const heureCouleurs = ['FFFFFF', 'DDDDDD'];

  classes.forEach((classe, classeIndex) => {
    const baseIndex = classeIndex + 2;

    classe.semaine.forEach((semaine) => {
      const jourIndex = joursSemaine.indexOf(semaine.jour); 
      if (jourIndex >= 0) { 
        semaine.cours.forEach((coursData) => {
          if (!matiereCouleurs[coursData.matiere]) {
            matiereCouleurs[coursData.matiere] = generateRandomColor();
          }
          const matiereColor = matiereCouleurs[coursData.matiere];

          const startHourIndex = heures.indexOf(coursData.heureDebut);
          const endHourIndex = heures.indexOf(coursData.heureFin);
          const columnIndex = jourIndex * nombreColonnes + baseIndex;

          worksheet.mergeCells(startHourIndex + 5, columnIndex, endHourIndex + 4, columnIndex);

          const cell = worksheet.getRow(startHourIndex + 5).getCell(columnIndex);
          cell.value = `${coursData.matiere}\nProf: ${coursData.professeur}`;
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
      fgColor: { argb: heureCouleurs[colorIndex] },
    };
  });

  const hoursColumnRightIndex = (nombreColonnes * joursSemaine.length + 2); 
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
      fgColor: { argb: heureCouleurs[colorIndex] },
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

  joursSemaine.forEach((_, jourIndex) => {
    const borderColumnIndex = jourIndex * nombreColonnes + 2 + nombreColonnes;
    for (let rowIndex = 4; rowIndex <= totalRows; rowIndex++) { 
      const cell = worksheet.getRow(rowIndex).getCell(borderColumnIndex);
      cell.border.left = { style: 'medium' };
    }
  });

  const filePath: string = path.join(__dirname, '../files', 'EdtSquelette.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

// Fonction pour générer une couleur hexadécimale unique
const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};