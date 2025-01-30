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
exports.getWeekNumber = getWeekNumber;
exports.getPublicHolidays = getPublicHolidays;
exports.getHolidays = getHolidays;
const axios_1 = __importDefault(require("axios"));
function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.round(((firstThursday - target.valueOf()) / 86400000 - 3) / 7);
    return weekNumber;
}
function getPublicHolidays(startYear) {
    return __awaiter(this, void 0, void 0, function* () {
        const endYear = startYear + 1;
        const urlFirstYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${startYear}.json`;
        const urlLastYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${endYear}.json`;
        let holidays = {};
        try {
            const [holidays2023, holidays2024] = yield Promise.all([
                fetch(urlFirstYear).then((response) => response.json()),
                fetch(urlLastYear).then((response) => response.json()),
            ]);
            holidays = Object.assign(Object.assign({}, holidays2023), holidays2024);
        }
        catch (error) {
            console.error("Error fetching public holidays: ", error);
        }
        return holidays;
    });
}
function getHolidays() {
    return __awaiter(this, arguments, void 0, function* (city = "Bordeaux", startYear) {
        const scholarYear = `${startYear}-${startYear + 1}`;
        const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?`;
        let holidays = [];
        try {
            holidays = yield axios_1.default.get(url, {
                params: {
                    where: `location="${city}"`,
                    limit: 20,
                    refine: `annee_scolaire:${scholarYear}`,
                }
            }).then((response) => response.data.results);
        }
        catch (error) {
            console.error("Error fetching school holidays: ", error);
        }
        return holidays;
    });
}
