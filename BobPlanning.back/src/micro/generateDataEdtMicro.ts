import { EdtMicro, Promo, Semaine, Cours } from '../types/EdtMicroData';
import { MaquetteData } from '../types/MaquetteData';
import { EdtMacroData } from '../types/EdtMacroData';
import { getHolidays, getPublicHolidays } from '../tools/holidaysAndWeek';

export const generateDataEdtMicro = async (macro: EdtMacroData,  maquette: MaquetteData[]) : Promise<EdtMicro[]> => {

  let micro: EdtMicro[] = [];
  let promo: Promo[] = [];
  let semaine: Semaine[] = [];

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
      let currentWeek: Date = new Date(currentDate);

      while (currentWeek < new Date(currentDate.getDate() + 5)) {

        currentWeek.setDate(currentWeek.getDate() + 1);
      }


      promo.push({name: promoMacro.Name, semaine: semaine});
    });

    micro.push({dateDebut: currentDate.toISOString(), promos: promo});

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return micro;
}