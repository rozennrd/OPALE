import { EdtMicro, Promo, Semaine, Cours } from '../types/EdtMicroData';
import { MaquetteData } from '../types/MaquetteData';
import { EdtMacroData } from '../types/EdtMacroData';
import { getHolidays, getPublicHolidays } from '../tools/holidaysAndWeek';

export const generateDataEdtMicro = async (macro: EdtMacroData,  maquette: MaquetteData[]) : Promise<EdtMicro[]> => {

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
      semaine = [];
      enCoursWeek = true;
      messageWeek = "";

      if (currentDate > holydayStartDate && currentDate < holydayEndDate) {
        // 1 seule semaine de vacances pour la toussaint (sur jours feries)
        if (sortedHolidays[i].description === "Vacances de la Toussaint") {
          for (let i = 0; i < 7; i++) {
            const currentWeekDate = new Date(currentDate);
            currentWeekDate.setDate(currentWeekDate.getDate() + i);
            if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {
              enCoursWeek = false;
              messageWeek = "Vacances de la toussaint + toussaint";
            }
          }
          //Ajout des vacances scolaires
        } else {
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
          } else {
            // Algorithme cours a appeller ici
          }
        } else {
          enCours = false;
          message = messageWeek;
        }

        semaine.push({jour: currentWeek.toISOString(), enCours: enCours, message: message, cours: []});
        currentWeek.setDate(currentWeek.getDate() + 1);
      }

      if (holydayEndDate < currentDate && i < sortedHolidays.length - 1) {
        i++;
        holydayStartDate = new Date(sortedHolidays[i].start_date);
        holydayEndDate = new Date(sortedHolidays[i].end_date);
      }
  
      promo.push({name: promoMacro.Name, semaine: semaine});
    });

    micro.push({dateDebut: currentDate.toISOString(), promos: promo});

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return micro;
}