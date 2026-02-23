// Mock the pool module used by the repository
const mockQuery = jest.fn();

jest.mock('../src/database/pool', () => ({
  __esModule: true,
  pool: {
    query: (...args: any[]) => mockQuery(...args),
  },
}));

// Import the repository after the pool mock so it picks up the mocked pool
const { profRepository } = require('../src/data/repositories/profRepository');

describe('profRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAll should return rows from pool.query', async () => {
    const rows = [
      { id: '1', nom: 'Le Blanc', prenom: 'Éloïse' },
    ];
    mockQuery.mockResolvedValue({ rows });

    const result = await profRepository.getAll();
    expect(result).toEqual(rows);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('getById should return a row when found', async () => {
    const row = { id: '1', nom: 'Le Blanc' };
    mockQuery.mockResolvedValue({ rows: [row] });

    const result = await profRepository.getById('1');
    expect(result).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });

  it('getById should return null when not found', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await profRepository.getById('999');
    expect(result).toBeNull();
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['999']);
  });

  it('insert should return inserted id', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: '42' }] });

    const inserted = await profRepository.insert('Nom', 'Prenom', 'a@b.com', null, 'Permanent', false, null);
    expect(inserted).toBe('42');
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      'Nom',
      'Prenom',
      'a@b.com',
      null,
      'Permanent',
      false,
      null,
    ]);
  });

  it('update should call pool.query with correct params', async () => {
    mockQuery.mockResolvedValue({});
    await profRepository.update('1', 'Nom', 'Prenom', 'a@b.com', null, 'Permanent', false, null);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      'Nom',
      'Prenom',
      'a@b.com',
      null,
      'Permanent',
      false,
      null,
      '1',
    ]);
  });

  it('delete should return rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const res = await profRepository.delete('1');
    expect(res).toBe(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });
});
