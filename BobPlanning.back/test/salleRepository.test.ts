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
    const res = await salleRepository.insert('Salle X', 'Salle X complet', 'Cours', ['Projet'], 1, 20, true, 'desc');
    expect(res).toBe('42');
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['Salle X', 'Salle X complet', 'Cours', ['Projet'], 1, 20, true, 'desc']);
  });

  it('update returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const ok = await salleRepository.update({
      id: '1',
      nom: 'S',
      nom_complet: 'Salle S',
      type_principal: 'Cours',
      types_secondaires: ['Projet'],
      etage: 1,
      capacite: 30,
      utilisable: false,
      description: 'd'
    });
    expect(ok).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['S', 'Salle S', 'Cours', ['Projet'], 1, 30, false, 'd', '1']);
  });

  it('deleteById returns boolean based on rowCount', async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });
    const ok = await salleRepository.deleteById('1');
    expect(ok).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1']);
  });
});

