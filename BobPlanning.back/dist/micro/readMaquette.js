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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
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
                        total: (rowValues[nbHeures] && typeof rowValues[nbHeures] === 'object' && rowValues[nbHeures].hasOwnProperty('result') ? parseFloat((_a = rowValues[nbHeures].result) !== null && _a !== void 0 ? _a : 0) : (_b = parseFloat(rowValues[nbHeures])) !== null && _b !== void 0 ? _b : 0) || (rowValues[nbHeuresAvecProf] && typeof rowValues[nbHeuresAvecProf] === 'object' && rowValues[nbHeuresAvecProf].hasOwnProperty('result') ? parseFloat((_c = rowValues[nbHeuresAvecProf].result) !== null && _c !== void 0 ? _c : 0) : (_d = parseFloat(rowValues[nbHeuresAvecProf])) !== null && _d !== void 0 ? _d : 0) || 0,
                        totalAvecProf: (rowValues[nbHeuresAvecProf] && typeof rowValues[nbHeuresAvecProf] === 'object' && rowValues[nbHeuresAvecProf].hasOwnProperty('result') ? parseFloat((_e = rowValues[nbHeuresAvecProf].result) !== null && _e !== void 0 ? _e : 0) : (_f = parseFloat(rowValues[nbHeuresAvecProf])) !== null && _f !== void 0 ? _f : 0) || 0,
                        coursMagistral: parseFloat((_g = rowValues[coursMagistral]) !== null && _g !== void 0 ? _g : 0) || 0,
                        coursInteractif: parseFloat((_h = rowValues[coursInteractif]) !== null && _h !== void 0 ? _h : 0) || 0,
                        td: parseFloat((_j = rowValues[td]) !== null && _j !== void 0 ? _j : 0) || 0,
                        tp: parseFloat((_k = rowValues[tp]) !== null && _k !== void 0 ? _k : 0) || 0,
                        projet: parseFloat((_l = rowValues[projet]) !== null && _l !== void 0 ? _l : 0) || 0,
                        elearning: parseFloat((_m = rowValues[elearning]) !== null && _m !== void 0 ? _m : 0) || 0
                    }
                });
            }
        });
    });
    return data;
});
exports.readMaquette = readMaquette;
