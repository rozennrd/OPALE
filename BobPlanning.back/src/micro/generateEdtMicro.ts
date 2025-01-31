
import { EdtMacroData } from "../types/EdtMacroData";
import { generateDataEdtMicro } from "./generateDataEdtMicro";
import { generateEdtSquelette } from './generateEdtSquelette';

export const generateEdtMicro = async (connection: any) : Promise<string> => {

  //Get data from database and formated data
  const [promosData] = await connection.query(
    "SELECT id, Name, Nombre, Periode FROM promosData"
  );

  const [coursesData] = await connection.query(
    `SELECT C.id, C.name, C.UE, C.Semestre, C.Periode, C.Prof, C.typeSalle, C.heure FROM Cours C`
  );

  const [sallesData] = await connection.query("SELECT * FROM Salles");

  const [profsData] = await connection.query("SELECT * FROM Professeurs");

  const [calendrierData] = await connection.query("SELECT * FROM calendrier");

  const promos: any[] = (promosData as any[]).map((promo) => ({
    name: promo.Name,
    nombreEtudiants: promo.Nombre,
    Cours: (coursesData as any[])
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

  const salles: any[] = (sallesData as any[]).map((salle) => ({
    ID: salle.id,
    type: salle.type,
    capacite: salle.capacite,
  }));

  const profs: any[] = (profsData as any[]).map((prof) => ({
    ID: prof.id,
    name: prof.name,
    type: prof.type,
    dispo: prof.dispo ? JSON.parse(prof.dispo) : [],
  }));

  const macro: EdtMacroData = {
    DateDeb: calendrierData[0]?.dateDeb || null,
    DateFin: calendrierData[0]?.dateFin || null,
    Promos: (promosData as any[]).map((promo) => ({
      i: promo.id,
      Name: promo.Name,
      Nombre: promo.Nombre,
      Periode: promo.Periode ? JSON.parse(promo.Periode) : [],
    })),
  };

  //Generate Data EdtMicro 
  const calendrier = await generateDataEdtMicro(macro);

  //Call solver from microservice
  //TODO
  const edtMicroArray : any[] = [];

  //Generate Excel file
  const filePath = await generateEdtSquelette(edtMicroArray);
  return filePath;
};
