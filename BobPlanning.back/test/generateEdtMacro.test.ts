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

// Converts methods into Jest mocks
type MockedWorksheet = jest.Mocked<
  Pick<ExcelJS.Worksheet, 'addRow' | 'getRow' | 'getCell' | 'eachRow'>
> & {
  columns: NonNullable<ExcelJS.Worksheet['columns']>;
};

type MockedWorkbook = jest.Mocked<{
  addWorksheet: (name: string) => ExcelJS.Worksheet;
  xlsx: {
    writeFile: (path: string) => Promise<void>;
  };
}>;

// Get holidays
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

  const createMockEdtMacroData = (
    overrides?: Partial<EdtMacroData>,
  ): EdtMacroData =>
    <EdtMacroData>{
      DateDeb: new Date('2024-01-08'), // Monday
      DateFin: new Date('2024-02-05'),
      Promos: [
        {
          Name: 'ADI1',
          Periode: [
            {
              DateDebutP: '2024-01-08',
              DateFinP: '2024-03-31',
            },
          ],
        },
        {
          Name: 'CIR1',
          Periode: [
            {
              DateDebutP: '2024-01-08',
              DateFinP: '2024-03-31',
            },
          ],
        },
      ],
      ...overrides,
    };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked cell
    const createMockCell = () => ({
      fill: undefined,
      font: undefined,
      border: undefined,
      alignment: undefined,
    });

    // Row Mock
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

    // Worksheet Mock
    mockWorksheet = {
      columns: [],
      addRow: jest.fn().mockReturnValue(mockRow),
      getRow: jest.fn().mockReturnValue(mockRow),
      getCell: jest.fn().mockReturnValue(createMockCell()),
      eachRow: jest.fn((callback) => {
        callback(mockRow); // Simulates a line with cells
      }),
    } as unknown as MockedWorksheet;

    // Workbook Mock
    mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      xlsx: {
        writeFile: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as MockedWorkbook;

    // ExcelJS.Workbook constructor Mock
    (
      ExcelJS.Workbook as jest.MockedClass<typeof ExcelJS.Workbook>
    ).mockImplementation(() => mockWorkbook as unknown as ExcelJS.Workbook);

    // Holidays functions Mock
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
    it('should adjust the start date to Monday if it is not a Monday', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-10'), // Wednesday
      });

      await generateEdtMacro(data);

      expect(mockWorksheet.addRow).toHaveBeenCalled();
      const firstCall = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(firstCall.mondayDate).toBe('08/01/2024'); // should start : Monday, January 8
    });

    it('should generate rows for each week between StartDate and EndDate', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-01-29'), // 3 weeks
      });

      await generateEdtMacro(data);

      // Should have at least 3 lines (header + 3 weeks)
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(3);
    });
  });

  describe('Public Holiday management', () => {
    it('should recover public holidays and vacations', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      expect(getPublicHolidays).toHaveBeenCalledWith(2024);
      expect(getHolidays).toHaveBeenCalledWith('Bordeaux', 2024);
    });

    it('should mark public holidays in red', async () => {
      (getPublicHolidays as jest.Mock).mockResolvedValue({
        '2024-01-08': 'Test Holiday',
      } as PublicHolidays);

      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-01-15'),
      });

      await generateEdtMacro(data);

      expect(mockRow.getCell).toHaveBeenCalledWith('holidays');
    });
  });

  describe('Management of promotions in initial training', () => {
    it('should manage promotions ADI1, CIR1, etc.', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
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

    it('should display "Semester 1 or 3 retake exam" during the winter break', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-17'),
        DateFin: new Date('2024-01-24'),
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
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

    it('should display “HOLIDAYS” for other holidays', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: 'Vacances de Printemps',
          start_date: '2024-01-15',
          end_date: '2024-01-22',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-15'),
        DateFin: new Date('2024-01-22'),
        Promos: [
          {
            Name: 'CIR1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const rowData = (mockWorksheet.addRow as jest.Mock).mock.calls[0][0];
      expect(typeof rowData.CIR1).toBe('string');
      expect(rowData.CIR1).not.toBeUndefined();
    });
  });

  describe('Management of promotions in continuing formation', () => {
    it('should manage promotions AP3, AP4, AP5', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            Name: 'AP3',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-29'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      expect(mockWorksheet.addRow).toHaveBeenCalled();
    });

    it('should display "International Break" for AP4 after the last period', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-03-15'),
        Promos: [
          {
            Name: 'AP4',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-29'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const laterRow = calls.find((call: unknown[]) => {
        const row = call[0] as Record<string, string>;
        return row.AP4 === 'Mobilité Internationale';
      });

      expect(laterRow).toBeDefined();
    });

    it('should display "Soutenance" for AP5 in the last week', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-01-29'),
        Promos: [
          {
            Name: 'AP5',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-15'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const lastRow = calls[calls.length - 1][0] as Record<string, string>;

      expect(lastRow.AP5).toBe('Soutenance');
    });
  });

  describe('Management of the CyPre column', () => {
    it('should generate CyPre week numbers correctly', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-02-05'),
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
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
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-01-29'),
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;
      const holidaysRow = calls[1][0] as Record<string, string>;

      expect(holidaysRow.cypreWeek).toBeDefined();
      expect(typeof holidaysRow.cypreWeek).toBe('string');
      expect(holidaysRow).toHaveProperty('cypreWeek');
    });
  });

  describe('Formatting and visual styles', () => {
    let mockCell: {
      fill?: { type: string; pattern: string; fgColor: { argb: string } };
      font?: { bold?: boolean; color?: { argb: string } };
      border?: unknown;
    };

    beforeEach(() => {
      mockCell = {};
      mockRow.getCell = jest.fn().mockReturnValue(mockCell);
    });

    it('should apply borders to all cells', async () => {
      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      // Verify that eachRow is called to iterate through all rows
      expect(mockWorksheet.eachRow).toHaveBeenCalled();

      // Verify that eachCell is called for each row
      expect(mockRow.eachCell).toHaveBeenCalled();

      // Verify that a border is defined (the mock simulates this)
      const eachCellCallback = (mockRow.eachCell as jest.Mock).mock.calls[0][0];
      const testCell = { border: undefined };
      eachCellCallback(testCell);

      expect(testCell.border).toBeDefined();
      expect(testCell.border).toMatchObject({
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      });
    });

    it('should color promos at school in green (FF99FF99)', async () => {
      const data = createMockEdtMacroData({
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-03-31'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      // Verify that getCell is called with the promo name
      expect(mockRow.getCell).toHaveBeenCalledWith('ADI1');

      // Verify that the green style is applied
      expect(mockCell.fill).toEqual({
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF99FF99' },
      });
    });

    it('should color AP5 final presentations in pink (FFFF99CC) and make them bold', async () => {
      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-29'),
        DateFin: new Date('2024-02-05'),
        Promos: [
          {
            Name: 'AP5',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-01-22'),
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      // Verify that getCell is called with AP5
      expect(mockRow.getCell).toHaveBeenCalledWith('AP5');

      // Verify the pink color
      expect(mockCell.fill).toEqual({
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF99CC' },
      });

      // Verify bold text
      expect(mockCell.font).toEqual({ bold: true });
    });

    it('should color retake exams in yellow (FFFFFF00) and make them bold', async () => {
      (getHolidays as jest.Mock).mockResolvedValue([
        {
          description: "Vacances d'Hiver",
          start_date: '2024-02-10',
          end_date: '2024-02-25',
        },
      ] as Holiday[]);

      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-03-15'),
        Promos: [
          {
            Name: 'ADI1',
            Nombre: 20,
            i: 0,
            Periode: [
              {
                DateDebutP: new Date('2024-01-08'),
                DateFinP: new Date('2024-02-09'), // Ends before the winter break
              },
            ],
          },
        ],
      });

      await generateEdtMacro(data);

      const calls = (mockWorksheet.addRow as jest.Mock).mock.calls;

      // Find the line with the retake exam (during winter break)
      const retakeExamRow = calls.find((call: unknown[]) => {
        const row = call[0] as Record<string, string>;
        return row.ADI1 && row.ADI1.includes('Rattrapage semestre');
      });

      expect(retakeExamRow).toBeDefined();

      // Verify that getCell is called with ADI1
      expect(mockRow.getCell).toHaveBeenCalledWith('ADI1');

      // Check the yellow color
      expect(mockCell.fill).toEqual({
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
      });

      // Check the text in bold
      expect(mockCell.font).toEqual({ bold: true });
    });

    it('should display public holidays in red (FF0000)', async () => {
      (getPublicHolidays as jest.Mock).mockResolvedValue({
        '2024-01-08': 'Test Holiday',
      } as PublicHolidays);

      const data = createMockEdtMacroData({
        DateDeb: new Date('2024-01-08'),
        DateFin: new Date('2024-01-15'),
      });

      await generateEdtMacro(data);

      // Verify that getCell is called with 'holidays'
      expect(mockRow.getCell).toHaveBeenCalledWith('holidays');

      // Verify the red text color
      expect(mockCell.font).toEqual({
        color: { argb: 'FF0000' },
      });
    });

    it('should color the "Number of Exams" column header in light green', async () => {
      const mockExamsCell: any = {};
      (mockWorksheet.getCell as jest.Mock).mockReturnValue(mockExamsCell);

      const data = createMockEdtMacroData();

      await generateEdtMacro(data);

      expect(mockWorksheet.getCell).toHaveBeenCalledWith('G1');

      expect(mockExamsCell.fill).toEqual({
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF99FF99' },
      });
    });
  });
});
