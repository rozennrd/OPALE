// Mock pool
const mockQuery = jest.fn();

jest.mock('../src/database/pool', () => ({
  __esModule: true,
  pool: { query: (...args: any[]) => mockQuery(...args) },
}));

const { salleRepository } = require('../src/data/repositories/salleRepository');

describe('salleRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAll returns rows', async () => {
    const rows = [{ id: '1', nom: 'Salle 101' }];
    mockQuery.mockResolvedValue({ rows });
    const res = await salleRepository.getAll();
    expect(res).toEqual(rows);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String));
  });

  it('insert returns id', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '42' }] });
    const res = await salleRepository.insert('Salle X', 'TP', 20, 1, 'desc');
    expect(res).toBe('42');
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['Salle X', 'TP', 20, 1, 'desc']);
  });

  it('update returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const ok = await salleRepository.update({ id: '1', nom: 'S', type: 'TP', capacite: 30, etage: 1, description: 'd' });
    expect(ok).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['S', 30, 'TP', 1, 'd', '1']);
  });

  it('deleteById returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });
    const ok = await salleRepository.deleteById('1');
    expect(ok).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });
});

