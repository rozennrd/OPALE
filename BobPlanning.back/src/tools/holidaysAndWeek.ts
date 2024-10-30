import axios from 'axios';

export function getWeekNumber(date: Date): number {
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

export async function getPublicHolidays(startYear: number): Promise<Record<string, string>> {
  const endYear = startYear + 1;
  const urlFirstYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${startYear}.json`;
  const urlLastYear = `https://calendrier.api.gouv.fr/jours-feries/metropole/${endYear}.json`;

  let holidays: Record<string, string> = {};

  try {
    const [holidays2023, holidays2024] = await Promise.all([
      fetch(urlFirstYear).then((response) => response.json()),
      fetch(urlLastYear).then((response) => response.json()),
    ]);

    holidays = { ...holidays2023, ...holidays2024 };

  } catch (error) {
    console.error("Error fetching public holidays: ", error);
  }
  return holidays;
}

export async function getHolidays(city: string = "Bordeaux", startYear: number): Promise<any> {
  const scholarYear = `${startYear}-${startYear + 1}`;
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?`;

  let holidays: Record<string, string>[] = [];

  try {
    holidays = await axios.get(url, {
      params: {
        where: `location="${city}"`,
        limit: 20,
        refine: `annee_scolaire:${scholarYear}`,
      }
    }).then((response) => response.data.results);
  } catch (error) {
    console.error("Error fetching school holidays: ", error);
  }

  return holidays;
}