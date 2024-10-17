import ExcelJS from 'exceljs';
import { MaquetteData, Heure } from './types/MaquetteData';

export const readMaquette = async (buffer: Buffer) : Promise<MaquetteData> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(1);

  const data: MaquetteData = {
    UE: [],
    cours: []
  };

  workbook.eachSheet((worksheet) => {
    let ueSection = false;
    let coursSection = false;

    worksheet.eachRow((row, rowIndex) => {
      const rowValues = row.values as string[];
      if (!rowValues) return;

      // Detect start of UE section
      if (rowValues.some((cell) => typeof cell === 'string' && cell.includes("Unité d'Enseignements (UE)"))) {
        ueSection = true;
        coursSection = false;
        return;
      }

      // Detect start of Cours section
      if (rowValues.some((cell) => typeof cell === 'string' && cell.includes('Cours'))) {
        coursSection = true;
        ueSection = false;
        return;
      }

      // Process UE data
      if (ueSection) {
        if (rowValues[1] && typeof rowValues[1] === 'string') {
          data.UE.push({ name: rowValues[1] });
        }
      }

      // Process Cours data
      if (coursSection) {
        if (rowValues[2] && typeof rowValues[2] === 'string') {
          const coursName = rowValues[2];
          const ueName = rowValues[1] || '';
          const heures: Heure = {
            total: Number(rowValues[3]) || 0,
            coursMagistral: Number(rowValues[4]) || 0,
            coursInteractif: Number(rowValues[5]) || 0,
            td: Number(rowValues[6]) || 0,
            tp: Number(rowValues[7]) || 0,
            autre: Number(rowValues[8]) || 0,
          };
          data.cours.push({ name: coursName, UE: ueName, heure: [heures] });
        }
      }
    });
  });

  return data;
}