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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEdtMicro = void 0;
const generateDataEdtMicro_1 = require("./generateDataEdtMicro");
const generateEdtMicro = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [promosData] = yield connection.promise().query("SELECT id, nom, effectifs, date_start, date_end FROM promotion");
    const [coursesData] = yield connection.promise().query(`SELECT c.id, co.id_promo, e.nom as nom_cours, m.nom nom_matiere, m.semestre, e.datetime_start, e.datetime_end, c.id_prof, s.type, m.volume_horaire 
    FROM cours c, event e, concerner co, matiere m, salle s
    WHERE c.id_matiere = m.id`);
    const [sallesData] = yield connection.promise().query("SELECT * FROM salle");
    const [profsData] = yield connection.promise().query("SELECT * FROM professeur");
    const [calendrierData] = yield connection.promise().query("SELECT datetime_start, datetime_end FROM event");
    const promos = promosData.map((promo) => {
        return {
            name: promo.Name,
            nombreEtudiants: promo.Nombre,
            cours: coursesData
                .filter((course) => course.promo == promo.Name)
                .map((course) => {
                let semestreParsed, heureParsed, periodeParsed;
                try {
                    semestreParsed = JSON.parse(course.Semestre);
                }
                catch (error) {
                    semestreParsed = course.Semestre;
                }
                try {
                    heureParsed = JSON.parse(course.heure);
                }
                catch (error) {
                    heureParsed = course.heure;
                }
                try {
                    periodeParsed = JSON.parse(course.Periode);
                }
                catch (error) {
                    periodeParsed = course.Periode;
                }
                return {
                    name: course.name,
                    UE: course.UE,
                    semestre: Array.isArray(semestreParsed)
                        ? semestreParsed.map(Number)
                        : typeof semestreParsed === "string"
                            ? semestreParsed.split(",").map(Number)
                            : [semestreParsed],
                    periode: periodeParsed,
                    prof: String(course.Prof || ""),
                    typeSalle: course.typeSalle,
                    heure: heureParsed,
                };
            }),
        };
    });
    const salles = sallesData.map((salle) => ({
        ID: String(salle.id),
        type: salle.type,
        capacite: salle.capacite,
    }));
    const profs = profsData.map((prof) => {
        let dispoParsed;
        try {
            dispoParsed = prof.dispo ? JSON.parse(prof.dispo) : {};
        }
        catch (error) {
            dispoParsed = {};
        }
        const dispoArray = Object.keys(dispoParsed)
            .filter((key) => dispoParsed[key])
            .map((key) => key.replace(/([A-Z])/g, "_$1").toLowerCase());
        return {
            ID: String(prof.id),
            name: prof.name,
            type: prof.type,
            dispo: dispoArray,
        };
    });
    const macro = {
        DateDeb: ((_a = calendrierData[0]) === null || _a === void 0 ? void 0 : _a.dateDeb) || null,
        DateFin: ((_b = calendrierData[0]) === null || _b === void 0 ? void 0 : _b.dateFin) || null,
        Promos: promosData.map((promo) => ({
            i: promo.id,
            Name: promo.Name,
            Nombre: promo.Nombre,
            Periode: promo.Periode ? JSON.parse(promo.Periode) : [],
        })),
    };
    //Generate Data EdtMicro
    const calendrier = yield (0, generateDataEdtMicro_1.generateDataEdtMicro)(macro);
    const data = { Promos: promos, Profs: profs, Salles: salles, Calendrier: calendrier };
    return data;
});
exports.generateEdtMicro = generateEdtMicro;
