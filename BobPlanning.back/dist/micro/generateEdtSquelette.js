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
exports.generateEdtSquelette = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
const generateLightColor = () => {
    const colors = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];
    return colors[Math.floor(Math.random() * colors.length)];
};
const generateEdtSquelette = (micro) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Emploi du Temps');
    const heures = [
        ' ', '7h30', '8h', '8h30', '9h', '9h30', '10h', '10h30', '11h', '11h30', '12h',
        '12h30', '13h', '13h30', '14h', '14h30', '15h', '15h30', '16h', '16h30', '17h', '17h30', '18h', '18h30', '19h'
    ];
    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let startRow = 1; // Ligne de départ pour le premier tableau
    for (const edtMicro of micro) {
        const startDate = new Date(edtMicro.dateDebut);
        const promos = edtMicro.promos;
        const nombreColonnes = promos.length;
        const jourCouleurs = ['FFDDDD', 'DDFFDD', 'DDDDFF', 'FFFFDD', 'FFDDEE'];
        const matiereCouleurs = {};
        joursSemaine.forEach((jour, jourIndex) => {
            const dateCellIndex = jourIndex * nombreColonnes + 2;
            const currentDayDate = new Date(startDate);
            currentDayDate.setDate(startDate.getDate() + jourIndex);
            worksheet.getRow(startRow).getCell(dateCellIndex).value = currentDayDate.toLocaleDateString("fr-FR");
            worksheet.getRow(startRow).getCell(dateCellIndex).alignment = { horizontal: 'center' };
            worksheet.getRow(startRow).getCell(dateCellIndex).font = { bold: true };
            worksheet.getRow(startRow + 1).getCell(dateCellIndex).value = jour;
            worksheet.getRow(startRow + 1).getCell(dateCellIndex).alignment = { horizontal: 'center' };
            worksheet.getRow(startRow + 1).getCell(dateCellIndex).font = { bold: true };
            worksheet.getRow(startRow + 1).getCell(dateCellIndex).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: jourCouleurs[jourIndex] },
            };
            if (nombreColonnes > 1) {
                worksheet.mergeCells(startRow, dateCellIndex, startRow, dateCellIndex + nombreColonnes - 1);
                worksheet.mergeCells(startRow + 1, dateCellIndex, startRow + 1, dateCellIndex + nombreColonnes - 1);
            }
            promos.forEach((promo, promoIndex) => {
                const promoIndexCell = dateCellIndex + promoIndex;
                worksheet.getRow(startRow + 2).getCell(promoIndexCell).value = promo.name;
                worksheet.getRow(startRow + 2).getCell(promoIndexCell).alignment = { horizontal: 'center' };
                worksheet.getRow(startRow + 2).getCell(promoIndexCell).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: jourCouleurs[jourIndex] },
                };
                const semaine = promo.semaine.find((s) => s.jour === jour);
                if (semaine) {
                    const startHourIndex = 1; // Index de 7h30
                    const endHourIndex = heures.length - 1; // Index de 19h
                    // Afficher le message sur toutes les cellules si EnCours est false
                    if (!semaine.enCours) {
                        worksheet.mergeCells(startHourIndex + startRow + 3, promoIndexCell, endHourIndex + startRow + 2, promoIndexCell);
                        const messageCell = worksheet.getRow(startHourIndex + startRow + 3).getCell(promoIndexCell);
                        messageCell.value = semaine.message || "journée sans cours";
                        messageCell.alignment = { horizontal: 'center', vertical: 'middle' };
                        messageCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'CCCCCC' },
                        };
                        return; // Passer à la journée suivante
                    }
                    // Afficher les cours si EnCours est true
                    semaine.cours.forEach((coursData) => {
                        if (!matiereCouleurs[coursData.matiere]) {
                            matiereCouleurs[coursData.matiere] = generateLightColor();
                        }
                        const matiereColor = matiereCouleurs[coursData.matiere];
                        const startHourIndex = heures.indexOf(coursData.heureDebut);
                        const endHourIndex = heures.indexOf(coursData.heureFin);
                        worksheet.mergeCells(startHourIndex + startRow + 3, promoIndexCell, endHourIndex + startRow + 2, promoIndexCell);
                        const cell = worksheet.getRow(startHourIndex + startRow + 3).getCell(promoIndexCell);
                        const duration = endHourIndex - startHourIndex;
                        if (duration >= 3) {
                            cell.value = `${coursData.matiere}\nProf: ${coursData.professeur}\nSalle: ${coursData.salleDeCours}`;
                        }
                        else {
                            cell.value = `${coursData.matiere} | Prof: ${coursData.professeur} | Salle: ${coursData.salleDeCours}`;
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
        // Ajuster la largeur des colonnes
        joursSemaine.forEach((_, jourIndex) => {
            const baseIndex = jourIndex * nombreColonnes + 2;
            for (let i = 0; i < nombreColonnes; i++) {
                worksheet.getColumn(baseIndex + i).width = 25;
            }
        });
        // Colonne des heures à gauche
        const hoursColumnLeftIndex = 1;
        worksheet.getRow(startRow + 2).getCell(hoursColumnLeftIndex).value = 'Heures';
        worksheet.getRow(startRow + 2).getCell(hoursColumnLeftIndex).alignment = { horizontal: 'center' };
        worksheet.getColumn(hoursColumnLeftIndex).width = 10;
        heures.forEach((heure, index) => {
            const row = worksheet.getRow(index + startRow + 3);
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
        worksheet.getRow(startRow + 2).getCell(hoursColumnRightIndex).value = 'Heures';
        worksheet.getRow(startRow + 2).getCell(hoursColumnRightIndex).alignment = { horizontal: 'center' };
        worksheet.getColumn(hoursColumnRightIndex).width = 10;
        heures.forEach((heure, index) => {
            const row = worksheet.getRow(index + startRow + 3);
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
        // Appliquer les bordures à toutes les cellules
        const totalRows = worksheet.rowCount;
        const totalColumns = worksheet.columnCount;
        for (let rowIndex = startRow; rowIndex <= totalRows; rowIndex++) {
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
        // Ajouter de l'espace après chaque tableau (ajuster selon le besoin)
        startRow += Math.max(5, heures.length + 3) + 2; // 2 lignes d'espace supplémentaires
    }
    const filePath = path_1.default.resolve(__dirname, '../../files/EdtMicro.xlsx');
    yield workbook.xlsx.writeFile(filePath);
    return filePath;
});
exports.generateEdtSquelette = generateEdtSquelette;
