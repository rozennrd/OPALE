import axios from "axios";
import { EdtMacroData } from "../types/EdtMacroData";
import { generateDataEdtMicro } from "./generateDataEdtMicro";
import { generateEdtSquelette } from './generateEdtSquelette';

export const generateEdtMicro = async (connection: any) : Promise<any> => {

  const [promosData] = await connection.promise().query(
    "SELECT id, Name, Nombre, Periode FROM promosData"
  );
  
  const [coursesData] = await connection.promise().query(
    `SELECT id, promo, name, UE, Semestre, Periode, Prof, typeSalle, heure FROM Cours`
  );
  
  const [sallesData] = await connection.promise().query("SELECT * FROM Salles");
  
  const [profsData] = await connection.promise().query("SELECT * FROM Professeurs");
  
  const [calendrierData] = await connection.promise().query("SELECT * FROM calendrier");

  const promos: any[] = (promosData as any[]).map((promo) => {
    
    return {
      name: promo.Name,
      nombreEtudiants: promo.Nombre,
      cours: (coursesData as any[])
        .filter((course) => {
          return course.promo == promo.Name;
        })
        .map((course) => {  
          let semestreParsed, heureParsed, periodeParsed;
          
          try {
            semestreParsed = JSON.parse(course.Semestre);
          } catch (error) {
            semestreParsed = course.Semestre; 
          }
  
          try {
            heureParsed = JSON.parse(course.heure);
          } catch (error) {
            heureParsed = course.heure; 
          }

          try {
            periodeParsed = JSON.parse(course.Periode);
          } catch (error) {
            periodeParsed = course.Periode; 
          }
  
          return {
            name: course.name,
            UE: course.UE,
            Semestre: [semestreParsed],
            Periode: periodeParsed,
            Prof: course.Prof,
            typeSalle: course.typeSalle,
            Heure: heureParsed,
          };
        }),
    };
  });

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

  const data = {Promos: promos, profs, salles, calendrier};
  return data;

  // //Call solver from microservice
  const edtMicroArray : any[] = await axios.post('http://127.0.0.1:3001/getDataEdtMicro', data);;

  // //Generate Excel file
  const filePath = await generateEdtSquelette(edtMicroArray);
  return filePath;
};
