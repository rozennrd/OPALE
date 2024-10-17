import ExcelJS from 'exceljs';
import { MaquetteData, Heure } from './types/MaquetteData';

const cleanCellValue = (value: any): any => {
  return typeof value === 'string' ? value.replace(/\n/g, ' ').trim() : value;
};

export const readMaquette = async (buffer: Buffer) : Promise<MaquetteData> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const data: MaquetteData = {
    UE: [],
    cours: []
  };

  workbook.eachSheet((worksheet) => {
    let table: boolean = false;
    let tableHeader: number = -1;
    let semestre: string = "";
    let ue: number = -1;
    let modules: number = -1;
    let nbHeures: number = -1;
    let semestrePeriode: number = -1;
    let coursMagistral: number = -1;
    let coursInteractif: number = -1;
    let td: number = -1;
    let tp: number = -1;
    let projet: number = -1;

    worksheet.eachRow((row, rowNumber) => {
      const rowValuesWithN = row.values as any[];
      if (!rowValuesWithN) return;

      const rowValues = rowValuesWithN.map(cleanCellValue);

      // Set table to know if we are in the table
      if (rowValues.some((cell) => typeof cell === 'string' && (cell.includes("SEMESTRE") || cell.includes("Semestres")) && !cell.includes("TOTAL"))) {
        table = true;
        tableHeader = rowNumber + 2;
        semestre = rowValues[1];
        return;
      } else if (rowValues.some((cell) => typeof cell === 'string' && cell.includes("TOTAL"))) {
        table = false;
        return;
      }

      if (tableHeader >= rowNumber) {
        rowValues.forEach((cell, index) => {
          if (cell.includes("Unité d'Enseignements (UE)")) {
            ue = index;
          } else if (cell.includes("Modules")) {
            modules = index;
          } else if (cell.includes("Nb Heures encadrées")) {
            nbHeures = index;
          } else if (cell.includes("Semestre / Période")) {
            semestrePeriode = index;
          } else if (cell.includes("Cours magistral")) {
            coursMagistral = index;
          } else if (cell.includes("Cours interactif")) {
            coursInteractif = index;
          } else if (cell.includes("TD")) {
            td = index;
          } else if (cell.includes("TP")) {
            tp = index;
          } else if (cell.includes("Projet")) {
            projet = index;
          }
        });
      } else if (table) {

        //Add UE
        if (rowValues[ue] === undefined) {
          table = false;
          return;
        } else {
          let ueDefine = false;
          data.UE.forEach((dataUe) => {
            if (dataUe.name === rowValues[ue]) {
              ueDefine = true;
            }
          });
          if (ueDefine === false) {
            data.UE.push({name: rowValues[ue]});
          }
        }

        if (rowValues[semestrePeriode] !== undefined) {
          semestre = rowValues[semestrePeriode];
        }

        //Add cours
        data.cours.push({
          name: rowValues[modules],
          UE: rowValues[ue],
          semestrePeriode: semestre,
          heure: {
            total: parseFloat(rowValues[nbHeures].result),
            coursMagistral: parseFloat(rowValues[coursMagistral]),
            coursInteractif: parseFloat(rowValues[coursInteractif]),
            td: parseFloat(rowValues[td]),
            tp: parseFloat(rowValues[tp]),
            projet: parseFloat(rowValues[projet])
          }
        });
      }
    });
  });

  return data;
}