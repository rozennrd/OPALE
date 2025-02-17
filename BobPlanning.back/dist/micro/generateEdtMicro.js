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
const generateEdtSquelette_1 = require("./generateEdtSquelette");
const generateEdtMicro = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    //Get data from database and formated data
    const [promosData] = yield connection.query("SELECT id, Name, Nombre, Periode FROM promosData");
    const [coursesData] = yield connection.query(`SELECT C.id, C.name, C.UE, C.Semestre, C.Periode, C.Prof, C.typeSalle, C.heure FROM Cours C`);
    const [sallesData] = yield connection.query("SELECT * FROM Salles");
    const [profsData] = yield connection.query("SELECT * FROM Professeurs");
    const [calendrierData] = yield connection.query("SELECT * FROM calendrier");
    const promos = promosData.map((promo) => ({
        name: promo.Name,
        nombreEtudiants: promo.Nombre,
        Cours: coursesData
            .filter((course) => course.Periode === promo.id)
            .map((course) => ({
            name: course.name,
            UE: course.UE,
            Semestre: JSON.parse(course.Semestre),
            Periode: [course.Periode],
            Prof: course.Prof,
            typeSalle: course.typeSalle,
            Heure: JSON.parse(course.heure),
        })),
    }));
    const salles = sallesData.map((salle) => ({
        ID: salle.id,
        type: salle.type,
        capacite: salle.capacite,
    }));
    const profs = profsData.map((prof) => ({
        ID: prof.id,
        name: prof.name,
        type: prof.type,
        dispo: prof.dispo ? JSON.parse(prof.dispo) : [],
    }));
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
    //Call solver from microservice
    //TODO
    const edtMicroArray = [];
    //Generate Excel file
    const filePath = yield (0, generateEdtSquelette_1.generateEdtSquelette)(edtMicroArray);
    return filePath;
});
exports.generateEdtMicro = generateEdtMicro;
