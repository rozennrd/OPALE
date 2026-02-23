// Mock the pool used by the repository
const mockQuery = jest.fn();

jest.mock('../src/database/pool', () => ({
  __esModule: true,
  pool: {
    query: (...args: any[]) => mockQuery(...args),
  },
}));

// Import the repository after mocking pool
const { promotionRepository } = require('../src/data/repositories/promotionRepository');

describe('promotionRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAll returns rows', async () => {
    const rows = [{ id: '1', nom: 'Promo A' }];
    mockQuery.mockResolvedValue({ rows });
    const res = await promotionRepository.getAll();
    expect(res).toEqual(rows);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('getById returns row when found', async () => {
    const row = { id: '1', nom: 'Promo A' };
    mockQuery.mockResolvedValue({ rows: [row] });
    const res = await promotionRepository.getById('1');
    expect(res).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });

  it('getById returns null when not found', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await promotionRepository.getById('999');
    expect(res).toBeNull();
  });

  it('insert returns inserted id', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '42' }] });
    const res = await promotionRepository.insert({ nom: 'X', effectifs: 10, id_cycle: '1', date_start: '2025-09-01', date_end: '2026-06-30' });
    expect(res).toBe('42');
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
  });

  it('update returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const ok = await promotionRepository.update({ id: '1', nom: 'X', effectifs: 10, date_start: '2025-09-01', date_end: '2026-06-30' });
    expect(ok).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
  });

  it('deleteById returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });
    const ok = await promotionRepository.deleteById('1');
    expect(ok).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });

  it('getLegacy returns rows', async () => {
    const rows = [{ nom: 'X', effectifs: 10, date_start: '2025-09-01', date_end: '2026-06-30' }];
    mockQuery.mockResolvedValue({ rows });
    const res = await promotionRepository.getLegacy();
    expect(res).toEqual(rows);
  });
});

