const request = require('supertest');

// Mocks must be defined before importing the app so the modules used
// when routes/controllers are registered will use the mocked implementations.
const mockGetProfs = jest.fn();
const mockGetProfById = jest.fn();
const mockCreateProf = jest.fn();
const mockUpdateProf = jest.fn();
const mockDeleteProf = jest.fn();

jest.mock('../src/middleware/authJwt', () => ({
  __esModule: true,
  default: {
    verifyToken: (req: any, res: any, next: any) => next(),
  },
}));

// Map mocks to the actual exported method names used by profController
jest.mock('../src/domain/services/profService', () => ({
  __esModule: true,
  profService: {
    getProfsData: mockGetProfs,
    getProfById: mockGetProfById,
    createProf: mockCreateProf,
    updateProf: mockUpdateProf,
    deleteProf: mockDeleteProf,
  },
}));

// Import app after mocks so routes/controllers pick up the mocked modules
import app from '../src/index';

describe('Prof endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /getProfsData', () => {
    it('should return a list of professors on success', async () => {
      const profs = [
        { id: 1, nom: 'Le Blanc', prenom: 'Éloïse', email: 'elo.leblanc@junia.com', email_perso: 'elo.leblanc@mail.com', type: 'Permanent', distanciel: true, campus_origin: 'Bordeaux' },
      ];
      mockGetProfs.mockResolvedValue(profs);

      const res = await request(app).get('/getProfsData').expect(200);
      expect(res.body).toEqual(profs);
      expect(mockGetProfs).toHaveBeenCalled();
    });

    it('should return 500 when the service throws', async () => {
      mockGetProfs.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/getProfsData').expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /getProfById/:id', () => {
    it('should return a professor when found', async () => {
      const prof = { id: 1, nom: 'Le Blanc', prenom: 'Éloïse', email: 'elo.leblanc@junia.com', email_perso: 'elo.leblanc@mail.com', type: 'Permanent', distanciel: true, campus_origin: 'Bordeaux' };
      mockGetProfById.mockResolvedValue(prof);

      const res = await request(app)
        .get('/getProfById/1')
        .expect(200);

      expect(res.body).toEqual(prof);
      expect(mockGetProfById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when not found', async () => {
      const err: any = new Error('Professeur non trouvé');
      err.statusCode = 404;
      mockGetProfById.mockRejectedValue(err);

      const res = await request(app)
        .get('/getProfById/999')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 500 when service errors', async () => {
      mockGetProfById.mockRejectedValue(new Error('Unexpected'));
      const res = await request(app)
        .get('/getProfById/1')
        .expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /addProf', () => {
    it('should create a professor and return 201', async () => {
      mockCreateProf.mockResolvedValue({ id: 42 });

      const body = { nom: 'Famille', prenom: 'Prenom', email: 'elo.bloup@junia.com', email_perso: 'elo.bloup@mail.com', type: 'Permanent', distanciel: true, campus_origin: 'Bordeaux' };
      const res = await request(app)
        .post('/addProf')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('insertedId', 42);
      expect(mockCreateProf).toHaveBeenCalledWith({
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        email_perso: body.email_perso,
        type: body.type,
        distanciel: body.distanciel,
        campus_origin: body.campus_origin,
      });
    });

    it('should return 400 when nom is missing', async () => {
      const body = { email_perso: 'prenom.nom@junia.com' };
      const res = await request(app)
        .post('/addProf')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(400);

      // controller returns { error: '...' } on validation failure
      expect(res.body).toHaveProperty('error');
      expect(mockCreateProf).not.toHaveBeenCalled();
    });

    it('should propagate service errors with status code', async () => {
      const err: any = new Error('Type invalide');
      err.statusCode = 400;
      mockCreateProf.mockRejectedValue(err);

      const body = { nom: 'Famille', prenom: 'Prenom', email: 'elo.bloup@junia.com', email_perso: 'elo.bloup@mail.com', type: 'Test', distanciel: true, campus_origin: 'Bordeaux' };
      const res = await request(app)
        .post('/addProf')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /updateProf/:id', () => {
    it('should update a professor and return success message', async () => {
      mockUpdateProf.mockResolvedValue(undefined);
      const body = { nom: 'Updated', prenom: 'UpdatedPrenom', type: 'Permanent', email: 'u@junia.com', email_perso: 'u@mail.com', distanciel: false, campus_origin: 'Bordeaux' };
      const res = await request(app)
        .put('/updateProf/1')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(mockUpdateProf).toHaveBeenCalledWith({
        id: '1',
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        email_perso: body.email_perso,
        type: body.type,
        distanciel: body.distanciel,
        campus_origin: body.campus_origin,
      });
    });

    it('should return 404 when professor not found', async () => {
      const err: any = new Error('Prof non trouvée');
      err.statusCode = 404;
      mockUpdateProf.mockRejectedValue(err);

      const body = { nom: 'X', prenom: 'Y', type: 'Permanent' };
      const res = await request(app)
        .put('/updateProf/999')
        .send(body)
        .set('Content-Type', 'application/json')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /deleteProf/:id', () => {
    it('should delete a professor and return success message', async () => {
      mockDeleteProf.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/deleteProf/1')
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(mockDeleteProf).toHaveBeenCalledWith('1');
    });

    it('should return 404 when deletion target not found', async () => {
      const err: any = new Error('Prof non trouvé');
      err.statusCode = 404;
      mockDeleteProf.mockRejectedValue(err);

      const res = await request(app)
        .delete('/deleteProf/999')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });
});
