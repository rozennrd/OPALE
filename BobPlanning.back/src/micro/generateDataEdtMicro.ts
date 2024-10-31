import { EdtMicro, Promo, Semaine, Cours } from '../types/EdtMicroData';
import { MaquetteData } from '../types/MaquetteData';
import { EdtMacroData } from '../types/EdtMacroData';
import { getHolidays, getPublicHolidays } from '../tools/holidaysAndWeek';

export const generateDataEdtMicro = async (macro: EdtMacroData,  maquette: MaquetteData[]) : Promise<EdtMicro[]> => {

  let days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  let micro: EdtMicro[] = [];
  let promo: Promo[] = [];
  let semaine: Semaine[] = [];
  let enCours: boolean = true;
  let enCoursWeek: boolean = true;  
  let message: string = "";
  let messageWeek: string = "";

  macro.DateDeb = new Date(macro.DateDeb);
  macro.DateFin = new Date(macro.DateFin);

  // Set date to lundi
  let currentDate: Date = new Date(macro.DateDeb);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }

  // Sort promos by date
  macro.Promos.forEach(promo => {
    if (Array.isArray(promo.Periode) && promo.Periode.length > 0) {
      promo.i = 0;
      promo.Periode.sort((a: any, b: any) => new Date(a.DateDebutP).getTime() - new Date(b.DateDebutP).getTime());
    };
  });

  //Get holidays
  const publicHolidays = await getPublicHolidays(macro.DateDeb.getFullYear());
  const holidays = await getHolidays("Bordeaux", macro.DateDeb.getFullYear());

  let i: number = 0;

  //Tri vacances par date
  let isPublicHolliday: boolean = false;
  const sortedHolidays = holidays.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  let holydayStartDate = new Date(sortedHolidays[i].start_date);
  let holydayEndDate = new Date(sortedHolidays[i].end_date);

  while (currentDate < macro.DateFin) {
    promo = [];
    macro.Promos.forEach(promoMacro => {
      promoMacro.i = 0;
      semaine = [];
      enCoursWeek = true;
      messageWeek = "";

      if (currentDate > holydayStartDate && currentDate < holydayEndDate) {
        // 1 seule semaine de vacances pour la toussaint (sur jours feries)
        if (sortedHolidays[i].description === "Vacances de la Toussaint" && (promoMacro.Name === "ADI1" || promoMacro.Name === "ADI2" || promoMacro.Name === "CIR1" || promoMacro.Name === "CIR2" || promoMacro.Name === "ISEN3" || promoMacro.Name === "ISEN4" || promoMacro.Name === "ISEN5")) {
          for (let i = 0; i < 7; i++) {
            const currentWeekDate = new Date(currentDate);
            currentWeekDate.setDate(currentWeekDate.getDate() + i);
            if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {
              enCoursWeek = false;
              messageWeek = "Vacances de la toussaint + toussaint";
            }
          }
          //Ajout des vacances scolaires
        } else if ((promoMacro.Name === "ADI1" || promoMacro.Name === "ADI2" || promoMacro.Name === "CIR1" || promoMacro.Name === "CIR2" || promoMacro.Name === "ISEN3" || promoMacro.Name === "ISEN4" || promoMacro.Name === "ISEN5")) {
          enCoursWeek = false;
          messageWeek = sortedHolidays[i].description;
        }
      }       

      for (let i = 0; i < 5; i++) {
        //Verif si jour ferie
        let currentWeek = new Date(currentDate);
        currentWeek.setDate(currentWeek.getDate() + i);
        enCours = true;
        message = "";
        if (enCoursWeek === true) {
          if (publicHolidays[currentWeek.toISOString().split('T')[0]]) {
            enCours = false;
            message = publicHolidays[currentWeek.toISOString().split('T')[0]];
          } 
        } 
        if (enCours === true) {
          if (promoMacro.Name === "ADI1" || promoMacro.Name === "ADI2" || promoMacro.Name === "CIR1" || promoMacro.Name === "CIR2" || promoMacro.Name === "ISEN3" || promoMacro.Name === "ISEN4" || promoMacro.Name === "ISEN5") {
            if (promoMacro.Periode && promoMacro.Periode.length > 0) {
              if (new Date(promoMacro.Periode[0].DateFinP) < currentWeek) {
                enCours = false;
                message = "Pas cours";
              } else if (new Date(promoMacro.Periode[0].DateDebutP) > currentWeek) {
                enCours = false;
                message = "Pas cours";            
              } 
            }
          } else if (promoMacro.Name === "AP3" || promoMacro.Name === "AP4" || promoMacro.Name === "AP5") {

            console.log(promoMacro.Periode[promoMacro.i]);
            // Remplir les semaines pour "AP3", "AP4", "AP5"
            if (promoMacro.Periode && promoMacro.Periode.length > 0 && new Date(promoMacro.Periode[promoMacro.i].DateDebutP) <= currentWeek && new Date(promoMacro.Periode[promoMacro.i].DateFinP) >= currentWeek) {
              enCours = true;
              message = "";
            }    
            // Cas spécifique pour "Mobilité Internationale" pour "AP4"
            else if (promoMacro.Name === "AP4" && promoMacro.Periode && promoMacro.i === promoMacro.Periode.length - 1 && new Date(promoMacro.Periode[promoMacro.i].DateFinP) <= currentWeek) {
              enCours = false;
              message = "Mobilité Internationale";
            }    
            // Cas spécifique pour "Projet de fin d'études" uniquement jusqu'à l'avant-dernière semaine
            else if (promoMacro.Name === "AP5" && promoMacro.Periode && promoMacro.i === promoMacro.Periode.length - 1 && new Date(promoMacro.Periode[promoMacro.i].DateFinP) <= currentWeek && currentWeek.getTime() < macro.DateFin.getTime() - 7 * 24 * 60 * 60 * 1000) {
              enCours = false;
              message = "Projet de fin d'études";
            }
            // Cas général pour "Entreprise"
            else if (promoMacro.Periode && new Date(promoMacro.Periode[promoMacro.i].DateFinP) <= currentWeek) {
              console.log(promoMacro.i);
              if (i < promoMacro.Periode.length - 1) {
                promoMacro.i++;
              }
              enCours = false;

              message = "Entreprise";
            } else if (promoMacro.Periode && new Date(promoMacro.Periode[promoMacro.i].DateDebutP) >= currentWeek) {
              enCours = false;
              message = "Entreprise";
            } 
          }
        
        } else {
          enCours = false;
          message = messageWeek;
        }       

        semaine.push({jour: days[i], enCours: enCours, message: message, cours: []});
        currentWeek.setDate(currentWeek.getDate() + 1);
      }

      if (holydayEndDate < currentDate && i < sortedHolidays.length - 1) {
        i++;
        holydayStartDate = new Date(sortedHolidays[i].start_date);
        holydayEndDate = new Date(sortedHolidays[i].end_date);
      }

      if (enCours === true) {

      }
  
      promo.push({name: promoMacro.Name, semaine: semaine});
    });

    micro.push({dateDebut: currentDate.toISOString(), promos: promo});

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return micro;
}