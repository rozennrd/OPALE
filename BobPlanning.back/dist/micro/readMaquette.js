"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMaquette = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const cleanCellValue = (value) => {
    return typeof value === 'string' ? value.replace(/\n/g, ' ').trim() : value;
};
function extractSemesterAndPeriodNumbers(input) {
    // Ensure the input is a string
    if (typeof input !== 'string') {
        throw new TypeError('Input must be a string');
    }
    const semesters = [];
    const periods = [];
    // Split the input by spaces or 'et'
    const parts = input.split(/[\s]+et[\s]+|[\s]+/);
    parts.forEach(part => {
        // Check for semesters starting with 'S'
        const semesterMatch = part.match(/S(\d+)/);
        if (semesterMatch) {
            semesters.push(Number(semesterMatch[1]));
        }
        // Check for periods starting with 'P', allowing for commas
        const periodMatches = part.match(/P(\d+)/g);
        if (periodMatches) {
            periodMatches.forEach(period => {
                periods.push(Number(period.substring(1))); // Remove 'P' and convert to number
            });
        }
    });
    return { semesters, periods };
}
const readMaquette = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    yield workbook.xlsx.load(buffer);
    const data = {
        UE: [],
        cours: []
    };
    workbook.eachSheet((worksheet) => {
        let table = false;
        let tableHeader = -1;
        let semestre = [];
        let periode = [];
        let ue = -1;
        let modules = -1;
        let nbHeures = -1;
        let nbHeuresAvecProf = -1;
        let semestrePeriode = -1;
        let coursMagistral = -1;
        let coursInteractif = -1;
        let td = -1;
        let tp = -1;
        let projet = -1;
        let elearning = -1;
        worksheet.eachRow((row, rowNumber) => {
            const rowValuesWithN = row.values;
            if (!rowValuesWithN)
                return;
            const rowValues = rowValuesWithN.map(cleanCellValue);
            // Set table to know if we are in the table
            if (rowValues.some((cell) => typeof cell === 'string' && (cell.includes("SEMESTRE") || cell.includes("Semestres")) && !cell.includes("TOTAL"))) {
                table = true;
                tableHeader = rowNumber + 2;
                semestre = [rowValues[3].toString().split(' ')[1]];
                return;
            }
            else if (rowValues.some((cell) => typeof cell === 'string' && cell.includes("TOTAL"))) {
                table = false;
                return;
            }
            if (tableHeader >= rowNumber) {
                rowValues.forEach((cell, index) => {
                    if (cell.includes("Unité d'Enseignements (UE)")) {
                        ue = index;
                    }
                    else if (cell.includes("Modules")) {
                        modules = index;
                    }
                    else if (cell.includes("Nb Heures étudiant")) {
                        nbHeures = index;
                    }
                    else if (cell.includes("Nb Heures encadrées")) {
                        nbHeuresAvecProf = index;
                    }
                    else if (cell.includes("Semestre / Période")) {
                        semestrePeriode = index;
                    }
                    else if (cell.includes("Cours magistral")) {
                        coursMagistral = index;
                    }
                    else if (cell.includes("Cours interactif")) {
                        coursInteractif = index;
                    }
                    else if (cell.includes("TD")) {
                        td = index;
                    }
                    else if (cell.includes("TP")) {
                        tp = index;
                    }
                    else if (cell.includes("Projet")) {
                        projet = index;
                    }
                    else if (cell.includes("E-learning")) {
                        elearning = index;
                    }
                });
            }
            else if (table) {
                //Add UE
                if (rowValues[ue] === undefined) {
                    table = false;
                    return;
                }
                else {
                    let ueDefine = false;
                    data.UE.forEach((dataUe) => {
                        if (dataUe.name === rowValues[ue]) {
                            ueDefine = true;
                        }
                    });
                    if (ueDefine === false) {
                        data.UE.push({ name: rowValues[ue] });
                    }
                }
                if (rowValues[semestrePeriode] !== undefined) {
                    if (typeof rowValues[semestrePeriode] === 'number') {
                        semestre = [rowValues[semestrePeriode]];
                        periode = [];
                    }
                    else {
                        semestre = extractSemesterAndPeriodNumbers(rowValues[semestrePeriode].toString()).semesters;
                        periode = extractSemesterAndPeriodNumbers(rowValues[semestrePeriode].toString()).periods;
                    }
                }
                //Add cours
                data.cours.push({
                    name: rowValues[modules],
                    UE: rowValues[ue],
                    semestre: semestre,
                    periode: periode,
                    heure: {
                        total: rowValues[nbHeures] && typeof rowValues[nbHeures] === 'object' && rowValues[nbHeures].hasOwnProperty('result') ? parseFloat(rowValues[nbHeures].result) : parseFloat(rowValues[nbHeures]),
                        totalAvecProf: rowValues[nbHeuresAvecProf] && typeof rowValues[nbHeuresAvecProf] === 'object' && rowValues[nbHeuresAvecProf].hasOwnProperty('result') ? parseFloat(rowValues[nbHeuresAvecProf].result) : parseFloat(rowValues[nbHeuresAvecProf]),
                        coursMagistral: parseFloat(rowValues[coursMagistral]),
                        coursInteractif: parseFloat(rowValues[coursInteractif]),
                        td: parseFloat(rowValues[td]),
                        tp: parseFloat(rowValues[tp]),
                        projet: parseFloat(rowValues[projet]),
                        elearning: parseFloat(rowValues[elearning])
                    }
                });
            }
        });
    });
    return data;
});
exports.readMaquette = readMaquette;
