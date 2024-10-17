import ExcelJS from 'exceljs';
import path from 'path';

interface ColumnsData {
  nomsColonnes: string[];
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
  const nomsColonnes: string[] = columnsData.nomsColonnes.length > 0 ? columnsData.nomsColonnes : ['Colonne 1'];
  const nombreColonnes = Math.max(nomsColonnes.length, 1);

  const startDate: Date = new Date(currentDate);
  startDate.setDate(currentDate.getDate() + ((1 + 7 - currentDate.getDay()) % 7));

  // Ajouter les dates et les jours
  joursSemaine.forEach((_, index) => {
    const currentDayDate = new Date(startDate);
    currentDayDate.setDate(startDate.getDate() + index);
    
    // Écrire la date
    const dateCellIndex = index * (nombreColonnes) + 2; // Indice de la cellule de la date
    worksheet.getRow(2).getCell(dateCellIndex).value = currentDayDate.toLocaleDateString("fr-FR");
    worksheet.getRow(2).getCell(dateCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(2).getCell(dateCellIndex).font = { bold: true };

    // Écrire le jour
    const jourCellIndex = dateCellIndex; 
    worksheet.getRow(3).getCell(jourCellIndex).value = joursSemaine[index];
    worksheet.getRow(3).getCell(jourCellIndex).alignment = { horizontal: 'center' };
    worksheet.getRow(3).getCell(jourCellIndex).font = { bold: true };

    // Fusionner les cellules pour la date et le jour
    if (nombreColonnes > 1) {
      worksheet.mergeCells(2, dateCellIndex, 2, dateCellIndex + nombreColonnes - 1);
      worksheet.mergeCells(3, jourCellIndex, 3, jourCellIndex + nombreColonnes - 1);
    }
  });

  // Remplir la ligne 4 avec les noms de colonnes
  joursSemaine.forEach((_, jourIndex) => {
    const baseIndex = jourIndex * (nombreColonnes) + 2; 
    for (let i = 0; i < nombreColonnes; i++) {
      const nomColonne = nomsColonnes[i % nomsColonnes.length]; 
      worksheet.getRow(4).getCell(baseIndex + i).value = nomColonne; 
      worksheet.getRow(4).getCell(baseIndex + i).alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  // Ajustement des largeurs des colonnes
  joursSemaine.forEach((_, jourIndex) => {
    const baseIndex = jourIndex * (nombreColonnes) + 2; 
    for (let i = 0; i < nombreColonnes; i++) {
      worksheet.getColumn(baseIndex + i).width = 15; 
    }
  });

  // Ajout de la colonne des heures à gauche
  const hoursColumnLeftIndex = 1; // Index pour la colonne des heures à gauche (première colonne)
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnLeftIndex).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getColumn(hoursColumnLeftIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5); // Ligne 5 et suivantes pour les heures
    row.getCell(hoursColumnLeftIndex).value = heure;
    row.getCell(hoursColumnLeftIndex).alignment = { horizontal: 'center' };
    row.getCell(hoursColumnLeftIndex).font = { bold: true };
  });

  // Ajout de la colonne des heures à droite
  const hoursColumnRightIndex = (joursSemaine.length * nombreColonnes) + 2; // Index pour la colonne des heures à droite
  worksheet.getRow(4).getCell(hoursColumnRightIndex).value = 'Heures';
  worksheet.getRow(4).getCell(hoursColumnRightIndex).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getColumn(hoursColumnRightIndex).width = 10;

  heures.forEach((heure, index) => {
    const row = worksheet.getRow(index + 5); // Ligne 5 et suivantes pour les heures
    row.getCell(hoursColumnRightIndex).value = heure;
    row.getCell(hoursColumnRightIndex).alignment = { horizontal: 'center' };
    row.getCell(hoursColumnRightIndex).font = { bold: true };
  });

  // Ajout de bordures aux cellules
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

  const filePath: string = path.join(__dirname, '../files', 'EdtSquelette.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};
