import { EdtMicro, Promo, Semaine, Cours } from '../types/EdtMicroData';
import { MaquetteData } from '../types/MaquetteData';
import { EdtMacroData } from '../types/EdtMacroData';
import { getHolidays, getPublicHolidays } from '../tools/holidaysAndWeek';

export const generateDataEdtMicro = async (macro: EdtMacroData): Promise<EdtMicro[]> => {

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

  // Toujours commencer un lundi
  let currentDate: Date = new Date(macro.DateDeb);
  if (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  }

  // Récupération jours fériés / vacances
  const publicHolidays = await getPublicHolidays(macro.DateDeb.getFullYear());
  const holidays = await getHolidays("Bordeaux", macro.DateDeb.getFullYear());

  let i: number = 0;
  const sortedHolidays = holidays.sort((a: any, b: any) =>
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  let holydayStartDate = new Date(sortedHolidays[0]?.start_date);
  let holydayEndDate = new Date(sortedHolidays[0]?.end_date);

  // BOUCLE PAR SEMAINE
  while (currentDate < macro.DateFin) {

    promo = [];

    macro.Promos.forEach((promoMacro) => {

      semaine = [];
      enCoursWeek = true;
      messageWeek = "";

      // Dates start/end converties
      const dateDeb = promoMacro.date_start ? new Date(promoMacro.date_start) : null;
      const dateFin = promoMacro.date_end ? new Date(promoMacro.date_end) : null;

      // Gestion vacances pour formations initiales
      const isInitiale = ["ADI1", "ADI2", "CIR1", "CIR2", "ISEN3", "ISEN4", "ISEN5"].includes(promoMacro.nom);

      if (
        isInitiale &&
        currentDate >= holydayStartDate &&
        currentDate <= holydayEndDate
      ) {
        if (sortedHolidays[i]?.description === "Vacances de la Toussaint") {
          // Vérifie aussi jours fériés parmi la semaine
          for (let x = 0; x < 7; x++) {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + x);
            if (publicHolidays[d.toISOString().split('T')[0]]) {
              enCoursWeek = false;
              messageWeek = "Vacances de la Toussaint + Toussaint";
            }
          }
        } else {
          enCoursWeek = false;
          messageWeek = sortedHolidays[i]?.description || "Vacances scolaires";
        }
      }

      // BOUCLE JOURS DE LA SEMAINE
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {

        const currentWeek = new Date(currentDate);
        currentWeek.setDate(currentWeek.getDate() + dayIndex);

        enCours = enCoursWeek;
        message = enCoursWeek ? "" : messageWeek;

        // Jours fériés
        if (publicHolidays[currentWeek.toISOString().split('T')[0]]) {
          enCours = false;
          message = publicHolidays[currentWeek.toISOString().split('T')[0]];
        }

        // Logique des dates de cours
        if (enCours) {
          if (dateDeb && dateFin) {
            // Avant le début → pas cours
            if (currentWeek < dateDeb) {
              enCours = false;
              message = "Pas cours";
            }
            // Après la fin → pas cours
            else if (currentWeek > dateFin) {
              enCours = false;
              message = "Pas cours";
            }
            // Sinon → cours (enCours = true)
          } else {
            enCours = false;
            message = "Dates non définies";
          }
        }

        // Ajout jour dans semaine
        semaine.push({
          jour: days[dayIndex],
          enCours,
          message,
          cours: [],
        });
      }

      // Mise à jour si vacances suivantes
      if (currentDate > holydayEndDate && i < sortedHolidays.length - 1) {
        i++;
        holydayStartDate = new Date(sortedHolidays[i].start_date);
        holydayEndDate = new Date(sortedHolidays[i].end_date);
      }

      promo.push({
        name: promoMacro.nom,
        semaine: semaine
      });
    });

    micro.push({
      dateDebut: currentDate.toISOString(),
      promos: promo
    });

    // Semaine suivante
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return micro;
};
