import { EdtMicro, Promo, Semaine, Cours } from '../types/EdtMicroData';
import { MaquetteData } from '../types/MaquetteData';
import { EdtMacroData } from '../types/EdtMacroData';
import { getHolidays, getPublicHolidays } from '../tools/holidaysAndWeek';

export const generateDataEdtMicro = async (macro: EdtMacroData) : Promise<EdtMicro[]> => {

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

  // Loop through weeks
  while (currentDate < macro.DateFin) {
    promo = [];
	
    macro.Promos.forEach(promoMacro => {
      semaine = [];
      enCoursWeek = true;
      messageWeek = "";
  
      // Check if within holidays
      if (currentDate >= holydayStartDate && currentDate <= holydayEndDate && ["ADI1", "ADI2", "CIR1", "CIR2", "ISEN3", "ISEN4", "ISEN5"].includes(promoMacro.Name)) {
          if (sortedHolidays[i]?.description === "Vacances de la Toussaint") {
              for (let i = 0; i < 7; i++) {
                  const currentWeekDate = new Date(currentDate);
                  currentWeekDate.setDate(currentWeekDate.getDate() + i);
                  if (publicHolidays[currentWeekDate.toISOString().split('T')[0]]) {
                      enCoursWeek = false;
                      messageWeek = "Vacances de la Toussaint + Toussaint";
                  }
              }
          } else {
              enCoursWeek = false; 
              messageWeek = sortedHolidays[i]?.description || "Vacances scolaires";
          }
      }
  
      // Loop through days of the week
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          let currentWeek = new Date(currentDate);
          currentWeek.setDate(currentWeek.getDate() + dayIndex);
          enCours = enCoursWeek;
          message = enCoursWeek ? "" : messageWeek;
  
          // Check if public holiday
          if (publicHolidays[currentWeek.toISOString().split('T')[0]]) {
              enCours = false;
              message = publicHolidays[currentWeek.toISOString().split('T')[0]];
          }
  
          // Custom logic for promos with multiple periods
          if (enCours && promoMacro.Periode && promoMacro.Periode.length > 0) {
              const currentPeriod = promoMacro.Periode[promoMacro.i];
              console.log(currentPeriod);
              // Check if current week is beyond the current period
              if (new Date(currentPeriod.DateFinP) < currentWeek) {
                  // Move to the next period if available
                  if (promoMacro.i < promoMacro.Periode.length - 1) {
                      console.log(promoMacro.i);
                      promoMacro.i = promoMacro.i + 1;
                  } else {

                      enCours = false;
                      message = "Pas cours";
                  }
              }
  
              // Check if current week is before the current period
              if (new Date(currentPeriod.DateDebutP) > currentWeek) {
                  enCours = false;
                  message = "Pas cours";
              }
          }
  
          // Add day to the week structure
          semaine.push({
              jour: days[dayIndex],
              enCours: enCours,
              message: message,
              cours: [],
          });
      }
  
      // Move to the next holiday period if current date exceeds
      if (currentDate > holydayEndDate && i < sortedHolidays.length - 1) {
          i++;
          holydayStartDate = new Date(sortedHolidays[i].start_date);
          holydayEndDate = new Date(sortedHolidays[i].end_date);
      }
  
      promo.push({ name: promoMacro.Name, semaine: semaine });
    });
  

    micro.push({ dateDebut: currentDate.toISOString(), promos: promo });

    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return micro;
}