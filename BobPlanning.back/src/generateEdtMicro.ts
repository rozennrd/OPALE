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

  // Heures et jours de la semaine
  const heures: string[] = [
    ' ', '7h30', '8h', '8h30', '9h', '9h30', '10h', '10h30', '11h', '11h30', '12h',
    '12h30', '13h', '13h30', '14h', '14h30', '15h', '15h30', '16h', '16h30', '17h', '17h30', '18h'
  ];

  const joursSemaine: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const classes: Classe[] = Array.isArray(columnsData.classes) && columnsData.classes.length > 0 
    ? columnsData.classes 
    : [{ nomClasse: 'Classe 1', semaine: [] }]; // Valeur par défaut

  const nombreColonnes = classes.length;

  // Couleurs pour chaque jour de la semaine
  const jourCouleurs = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];

  // Initialisation des cellules pour les jours et heures
  joursSemaine.forEach((jour, jourIndex) => {
    const dateCellIndex = jourIndex * nombreColonnes + 2; // Indice de la cellule de la date

    // Écrire la date au-dessus du jour
    const startDate: Date = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + ((1 + 7 - currentDate.getDay()) % 7));
    const currentDayDate = new Date(startDate);
    currentDayDate.setDate(startDate.getDate() + jourIndex);
    
    // Écrire la date
    worksheet.getRow(2).getCell(dateCellIndex).value = currentDayDate.toLocaleDateString("fr-FR");
    worksheet.getRow(2).getCell(dateCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(2).getCell(dateCellIndex).font = { bold: true };

    // Écrire le jour
    worksheet.getRow(3).getCell(dateCellIndex).value = jour;
    worksheet.getRow(3).getCell(dateCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(3).getCell(dateCellIndex).font = { bold: true };
    
    // Appliquer la couleur pour le jour
    worksheet.getRow(3).getCell(dateCellIndex).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: jourCouleurs[jourIndex] },
    };

    // Fusionner les cellules pour le jour
    if (nombreColonnes > 1) {
      worksheet.mergeCells(2, dateCellIndex, 2, dateCellIndex + nombreColonnes - 1);
      worksheet.mergeCells(3, dateCellIndex, 3, dateCellIndex + nombreColonnes - 1);
    }

    // Remplir la ligne avec les noms des classes
    for (let i = 0; i < nombreColonnes; i++) {
      worksheet.getRow(4).getCell(dateCellIndex + i).value = classes[i]?.nomClasse || ''; 
      worksheet.getRow(4).getCell(dateCellIndex + i).alignment = { horizontal: 'center' };

      // Appliquer la même couleur de jour sur les classes
      worksheet.getRow(4).getCell(dateCellIndex + i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: jourCouleurs[jourIndex] },
      };
    }
  });

  // Alternance des couleurs pour les heures complètes et demi-heures
  const heureCouleurs = ['FFFFFF', 'DDDDDD']; // Blanc et Gris

  // Remplir les lignes suivantes avec les informations de chaque cours
  classes.forEach((classe, classeIndex) => {
    const baseIndex = classeIndex + 2; // Indice de base pour la classe

    // Assurez-vous que semaine est un tableau
    classe.semaine.forEach((semaine) => {
      const jourIndex = joursSemaine.indexOf(semaine.jour); 
      if (jourIndex >= 0) { 
        semaine.cours.forEach((coursData) => {
          // Trouver les indices correspondant à l'heure de début et de fin
          const startHourIndex = heures.indexOf(coursData.heureDebut);
          const endHourIndex = heures.indexOf(coursData.heureFin);
    
          // Calcul de l'index de la colonne pour le jour et la classe
          const columnIndex = jourIndex * nombreColonnes + baseIndex;
    
          // Fusionner uniquement les cellules correspondant à la durée réelle du cours
          worksheet.mergeCells(startHourIndex + 5, columnIndex, endHourIndex + 4, columnIndex);
    
          // Remplir la première cellule fusionnée avec les informations du cours
          const cell = worksheet.getRow(startHourIndex + 5).getCell(columnIndex);
          cell.value = `${coursData.matiere}\nProf: ${coursData.professeur}`;
          cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };

          // Appliquer le fond vert pour les cellules contenant des cours
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00FF00' } // Vert
          };
        });
      }
    });
  });

  // Ajustement des largeurs des colonnes et ajout des bordures
  joursSemaine.forEach((_, jourIndex) => {
    const baseIndex = jourIndex * nombreColonnes + 2; 
    for (let i = 0; i < nombreColonnes; i++) {
      worksheet.getColumn(baseIndex + i).width = 25; 
    }
  });

  // Ajout de la colonne des heures à gauche
  const hoursColumnLeftIndex = 1;
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).alignment = { horizontal: 'center' };
  worksheet.getColumn(hoursColumnLeftIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5); 
    const hourCell = row.getCell(hoursColumnLeftIndex);
    hourCell.value = heure;
    hourCell.alignment = { horizontal: 'center' };

    // Appliquer la couleur alternée uniquement sur la colonne des heures
    const colorIndex = Math.floor(index / 2) % 2;
    hourCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: heureCouleurs[colorIndex] },
    };
  });

  // Ajout d'une colonne des heures à droite
  const hoursColumnRightIndex = (nombreColonnes * joursSemaine.length + 2); // Position à droite de la dernière colonne
  worksheet.getRow(4).getCell(hoursColumnRightIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnRightIndex).alignment = { horizontal: 'center' };
  worksheet.getColumn(hoursColumnRightIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5); 
    const hourCell = row.getCell(hoursColumnRightIndex);
    hourCell.value = heure;
    hourCell.alignment = { horizontal: 'center' };

    // Appliquer la couleur alternée uniquement sur la colonne des heures
    const colorIndex = Math.floor(index / 2) % 2;
    hourCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: heureCouleurs[colorIndex] },
    };
  });

  // Appliquer des bordures fines à toutes les cellules
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

  // Appliquer des bordures médium pour la séparation entre les jours
  joursSemaine.forEach((_, jourIndex) => {
    const borderColumnIndex = jourIndex * nombreColonnes + 2 + nombreColonnes; // Colonne de séparation
    for (let rowIndex = 4; rowIndex <= totalRows; rowIndex++) { // Commencer à la ligne 4
      const cell = worksheet.getRow(rowIndex).getCell(borderColumnIndex);
      cell.border.left = { style: 'medium' }; // Bordure médium à gauche
    }
  });

  // Ajouter une bordure médium pour la séparation verticale entre les colonnes de jours
  joursSemaine.forEach((_, jourIndex) => {
    const borderColumnIndex = jourIndex * nombreColonnes + 2 + nombreColonnes; // Colonne de séparation
    for (let rowIndex = 2; rowIndex <= totalRows; rowIndex++) { // Commencer à la ligne 2
      const cell = worksheet.getRow(rowIndex).getCell(borderColumnIndex);
      cell.border.left = { style: 'medium' }; // Bordure médium à gauche
    }
  });

  const filePath: string = path.join(__dirname, '../files', 'EdtSquelette.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
