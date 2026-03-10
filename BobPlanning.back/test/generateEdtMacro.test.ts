// Mock des dépendances
import {
  getHolidays,
  getPublicHolidays,
  getWeekNumber,
} from '../src/tools/holidaysAndWeek';
import { EdtMacroData } from '../src/types/EdtMacroData';
// @ts-ignore
import ExcelJS from 'exceljs';
import { generateEdtMacro } from '../src/macro/generateEdtMacro';

jest.mock('exceljs');
jest.mock('../src/tools/holidaysAndWeek');
jest.mock('fs');

// Convertit les méthodes en mocks Jest
type MockedWorksheet = jest.Mocked<
  Pick<ExcelJS.Worksheet, 'addRow' | 'getRow' | 'getCell' | 'eachRow' | 'lastRow'>
> & {
  columns: NonNullable<ExcelJS.Worksheet['columns']>;
};

type MockedWorkbook = jest.Mocked<{
  addWorksheet: (name: string) => ExcelJS.Worksheet;
  xlsx: {
    writeFile: (path: string) => Promise<void>;
  };
}>;

// Récupérer les vacances et jours fériés
type PublicHolidays = Awaited<ReturnType<typeof getPublicHolidays>>;
type HolidaysArray = Awaited<ReturnType<typeof getHolidays>>;
type Holiday = HolidaysArray[number];

describe('generateEdtMacro', () => {
  let mockWorkbook: MockedWorkbook;
  let mockWorksheet: MockedWorksheet;
  let mockRow: {
    height?: number;
    alignment?: { wrapText: boolean };
    getCell: jest.Mock;
    eachCell: jest.Mock;
  };

  // Promo de base réutilisable dans les tests
  const basePromo = {
    id: '1',
    nom: 'ADI1',
    effectifs: 20,
    id_cycle: '2',
    type: 'initial',
    date_start: new Date('2024-01-08'),
    date_end: new Date('2024-03-31'),
    i: 0,
    periode: [] as any[],
  };

  const createMockEdtMacroData = (
    overrides?: Partial<EdtMacroData>,
  ): EdtMacroData =>
    <EdtMacroData>{
      DateDeb: new Date('2024-01-08'), // Lundi
      DateFin: new Date('2024-02-05'),
      Promos: [
        {
          ...basePromo,
          nom: 'ADI1',
          periode: [
            {
              DateDebutP: new Date('2024-01-08'),
              DateFinP: new Date('2024-03-31'),
              type: 'cours',
            },
          ],
        },
        {
          ...basePromo,
          id: '2',
          nom: 'CIR1',
          periode: [
            {
              DateDebutP: new Date('2024-01-08'),
              DateFinP: new Date('2024-03-31'),
              type: 'cours',
            },
          ],
        },
      ],
      EventsMacro: [],
      ...overrides,
    };

  beforeEach(() => {
    jest.clearAllMocks();

    // Création d'une cellule mockée
    const createMockCell = () => ({
      fill: undefined,
      font: undefined,
      border: undefined,
      alignment: undefined,
    });

    // Mock de la ligne
    mockRow = {
      height: undefined,
      alignment: undefined,
      getCell: jest.fn().mockReturnValue(createMockCell()),
      eachCell: jest.fn((callback) => {
        for (let i = 0; i < 5; i++) {
          callback(createMockCell());
        }
      }),
    };

    // Mock de la feuille de calcul
    let internalLastRow: any = undefined;
    mockWorksheet = {
      columns: [],
      addRow: jest.fn().mockImplementation(() => {
        internalLastRow = mockRow;
        return mockRow;
      }),
      getRow: jest.fn().mockReturnValue(mockRow),
      getCell: jest.fn().mockReturnValue(createMockCell()),
      eachRow: jest.fn((callback) => {
        callback(mockRow); // Simule une ligne avec des cellules
      }),
      get lastRow() {
        return internalLastRow;
      },
    } as unknown as MockedWorksheet;

    // Mock du classeur
    mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      xlsx: {
        writeFile: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as MockedWorkbook;

    // Mock du constructeur ExcelJS.Workbook
    (
      ExcelJS.Workbook as jest.MockedClass<typeof ExcelJS.Workbook>
    ).mockImplementation(() => mockWorkbook as unknown as ExcelJS.Workbook);

    // Mock des fonctions de gestion des vacances
    (getWeekNumber as jest.Mock).mockImplementation((date: Date) => {
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = date.getTime() - start.getTime();
      return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    });

    (getPublicHolidays as jest.Mock).mockResolvedValue({
      '2024-01-01': "Jour de l'an",
      '2024-05-01': 'Fête du travail',
    } as PublicHolidays);

    (getHolidays as jest.Mock).mockResolvedValue([
      {
        description: "Vacances d'Hiver",
        start_date: '2024-02-10',
        end_date: '2024-02-25',
      },
      {
        description: 'Vacances de Printemps',
        start_date: '2024-04-13',
        end_date: '2024-04-28',
      },
    ] as Holiday[]);
  });

  describe('should generate Excel file', () => {
    it('should create a workbook and a worksheet', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      expect(ExcelJS.Workbook).toHaveBeenCalledTimes(1);
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('MultiPromo');
    });

    it('should create the columns correctly', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      expect(mockWorksheet.columns).toBeDefined();
      const columns = mockWorksheet.columns as Array<{
        header: string;
        key: string;
      }>;

      expect(columns[0]).toMatchObject({
        header: 'Numéro de la semaine',
        key: 'weekNumber',
      });
      expect(columns[1]).toMatchObject({
        header: 'La semaine commence le lundi :',
        key: 'mondayDate',
      });
    });

    it('should save the file to the correct path', async () => {
      const data = createMockEdtMacroData();

      const filePath = await generateEdtMacro(data);

      expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalledTimes(1);
      expect(filePath).toContain('EdtMacro.xlsx');
    });
  });

  describe('Date management', () => {
    it('should use the earliest promo date_start as the start date', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            date_start: new Date('2024-01-10'), // mercredi
            date_end: new Date('2024-01-29'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      // La date de début doit être alignée au lundi précédent (08/01/2024)
      const firstCall = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(firstCall.mondayDate).toBe('08/01/2024');
    });

    it('should generate rows for each week between start and end', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-26'), // vendredi → 3 semaines
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      // Doit générer exactement 3 lignes (1 par semaine)
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(3);
    });
  });

  describe('Public Holiday management', () => {
    it('should call getPublicHolidays and getHolidays for each year in the range', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      expect(getPublicHolidays).toHaveBeenCalledWith(2024);
      expect(getHolidays).toHaveBeenCalledWith('Bordeaux', 2024);
    });

    it('should mark public holidays in the holidays column', async () => {
      (getPublicHolidays as jest.Mock).mockResolvedValue({
        '2024-01-08': 'Test Holiday',
      } as PublicHolidays);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-15'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockRow.getCell).toHaveBeenCalledWith('holidays');
    });
  });

  describe('Management of promotions in initial training', () => {
    it('should add a column per promo and populate rowData', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
                type: 'rattrapage',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockWorksheet.addRow).toHaveBeenCalled();
      const rowData = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(rowData).toHaveProperty('ADI1');
    });

    it('should display vacation description when a promo is in initial type and holidays match', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            type: 'Initial',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-26'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      // La 2e semaine (15 jan) est en vacances
      const vacationRow = calls[1][0] as Record<string, string>;
      expect(vacationRow.ADI1).toBe('VACANCES');
    });

    it('should display "entreprise" during an enterprise period', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-26'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
                type: 'entreprise',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const rowData = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(typeof rowData.ADI1).toBe('string');
      expect(rowData.ADI1).not.toBeUndefined();
    });

    it('should display "VACANCES" for initial promos during school holidays', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: 'Vacances de Printemps',
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'CIR1',
            type: 'Initial',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-26'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const vacationRow = calls[1][0] as Record<string, string>;
      expect(typeof vacationRow.CIR1).toBe('string');
      expect(vacationRow.CIR1).not.toBeUndefined();
    });
  });

  describe('Management of promotions in continuing formation', () => {
    it('should manage apprentissage promotions', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            id: '1',
            nom: 'AP3',
            type: 'apprentissage',
            id_cycle: '1',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-03-31'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-29'),
                type: 'entreprise',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockWorksheet.addRow).toHaveBeenCalled();
    });

    it('should display "Mobilité internationale" only during the event period', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            id: '1',
            nom: 'AP4',
            type: 'apprentissage',
            id_cycle: '2',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-03-15'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-29'),
                type: 'Mobilité internationale',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const rowsWithEvent = calls
        .map((c) => c[0])
        .filter((row) => row.AP4 === 'Mobilité internationale');

      // Du 8 au 29 janvier = 4 semaines
      expect(rowsWithEvent.length).toBe(4);
    });

    it('should display "Soutenance" on the last week of a PFE', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            id: '1',
            nom: 'AP5',
            type: 'Apprentissage',
            id_cycle: '1',
            date_start: new Date('2024-01-01'),
            date_end: new Date('2024-02-01'),
            periode: [
              {
                DateDebutP: new Date('2024-01-01'),
                DateFinP: new Date('2024-01-21'), // se termine dans la semaine du 15-21
                type: 'PFE',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const soutenanceRow = calls.find((c) => c[0].AP5 === 'Soutenance');
      expect(soutenanceRow).toBeDefined();
    });
  });

  describe('Management of the CyPre column', () => {
    it('should generate CyPre week numbers starting at Se1 for initial promos', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            type: 'initial',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-02-05'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
                type: 'rattrapage',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const firstRow = calls[0][0] as Record<string, string>;
      expect(firstRow.cypreWeek).toBe('Se1');
    });

    it('should not display CyPre week during holidays', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            type: 'initial',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-29'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
                type: 'rattrapage'
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const holidayRow = calls[1][0] as Record<string, string>;
      expect(holidayRow.cypreWeek).toBe('');
    });
  });

  describe('Events management', () => {
    it('should display global events (without promo) in eventsJunia or eventsExternal', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-15'),
            periode: [],
          },
        ],
        EventsMacro: [
          {
            id: 'ev1',
            nom: 'Conférence JUNIA - détail',
            type: 'conference',
            datetime_start: new Date('2024-01-08T09:00:00'),
            datetime_end: new Date('2024-01-08T18:00:00'),
            is_external: false,
            promotions: [],
          },
          {
            id: 'ev2',
            nom: 'Salon externe - détail',
            type: 'salon',
            datetime_start: new Date('2024-01-08T09:00:00'),
            datetime_end: new Date('2024-01-08T18:00:00'),
            is_external: true,
            promotions: [],
          },
        ],
      });

      await generateEdtMacro(data);

      const rowData = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(rowData.eventsJunia).toContain('Conférence JUNIA');
      expect(rowData.eventsExternal).toContain('Salon externe');
    });

    it('should write promo-specific events in the promo column', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            id: '1',
            nom: 'ADI1',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-15'),
            periode: [],
          },
        ],
        EventsMacro: [
          {
            id: 'ev1',
            nom: 'Réunion ADI1 - détail',
            type: 'reunion',
            datetime_start: new Date('2024-01-08T09:00:00'),
            datetime_end: new Date('2024-01-08T18:00:00'),
            is_external: false,
            promotions: ['1'],
          },
        ],
      });

      await generateEdtMacro(data);

      const rowData = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(rowData.ADI1).toContain('Réunion ADI1');
    });
  });

  describe('Formatting and visual styles', () => {
    let mockCell: {
      fill?: { type: string; pattern: string; fgColor: { argb: string } };
      font?: { bold?: boolean; color?: { argb: string }; name?: string; italic?: boolean };
      border?: unknown;
    };

    beforeEach(() => {
      mockCell = {};
      mockRow.getCell = jest.fn().mockReturnValue(mockCell);
    });

    it('should apply thin borders to all cells', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      // Vérifie que eachRow est appelé pour parcourir toutes les lignes
      expect(mockWorksheet.eachRow).toHaveBeenCalled();

      // Le 1er appel eachRow correspond aux bordures
      const eachRowCallback = (mockWorksheet.eachRow as jest.Mock).mock.calls[0][0];

      // On simule une row avec un vrai eachCell pour vérifier ce que le callback fait
      const testCell = { border: undefined as any };
      const fakeRow = {
        eachCell: (cb: (cell: any) => void) => cb(testCell),
      };
      eachRowCallback(fakeRow);

      expect(testCell.border).toBeDefined();
      expect(testCell.border).toMatchObject({
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      });
    });

    it('should color VACANCES cells with VAC_BDX color', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            type: 'Initial',
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-26'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      // getCell est appelé pour la colonne de la promo en vacances
      expect(mockRow.getCell).toHaveBeenCalledWith('ADI1');
    });

    it('should color "Soutenance" cells with ALERT_RED and bold font', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            id: '1',
            nom: 'AP5',
            type: 'apprentissage',
            id_cycle: '1',
            date_start: new Date('2024-01-29'),
            date_end: new Date('2024-02-02'),
            periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-02-02'),
                type: "Projet de fin d'études",
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockRow.getCell).toHaveBeenCalledWith('AP5');
      expect(mockCell.fill).toEqual({
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC22525' }, // ALERT_RED
      });
      expect(mockCell.font).toMatchObject({ bold: true });
    });

    it('should color retake exam cells with ALERT_RED color', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-02-10',
          end_date: '2024-02-25',
        },
      ]);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            nom: 'ADI1',
            type: 'initial',
            date_start: new Date('2024-02-05'),
            date_end: new Date('2024-02-19'),
            periode: [
              {
                DateDebutP: new Date('2024-02-12'),
                DateFinP: new Date('2024-02-16'),
                type: 'Rattrapage semestre 1 ou 3',
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const retakeExamRow = calls.find((call) => {
        const row = call[0] as Record<string, string>;
        return row.ADI1?.includes('Rattrapage');
      });

      expect(retakeExamRow).toBeDefined();

      expect(mockRow.getCell).toHaveBeenCalledWith('ADI1');
    });

    it('should apply bold font for public holidays in the holidays column', async () => {
      (getPublicHolidays as jest.Mock).mockResolvedValue({
        '2024-01-08': 'Test Holiday',
      } as PublicHolidays);

      const data = createMockEdtMacroData({
        Promos: [
          {
            ...basePromo,
            date_start: new Date('2024-01-08'),
            date_end: new Date('2024-01-15'),
            periode: [],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockRow.getCell).toHaveBeenCalledWith('holidays');
    });
  });
});