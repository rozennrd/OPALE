const request = require('supertest');
const express = require('express');

jest.spyOn(express.application, 'listen').mockImplementation(() => ({
  timeout: 0,
  close: jest.fn(),
}));

// Mocks before importing app
const mockGetSalles = jest.fn();
const mockCreateSalle = jest.fn();
const mockUpdateSalle = jest.fn();
const mockDeleteSalle = jest.fn();

jest.mock('../src/middleware/authJwt', () => ({
  __esModule: true,
  default: {
    verifyToken: (req: any, res: any, next: any) => next(),
  },
}));

jest.mock('../src/domain/services/salleService', () => ({
  __esModule: true,
  salleService: {
    getSalles: mockGetSalles,
    createSalle: mockCreateSalle,
    updateSalle: mockUpdateSalle,
    deleteSalle: mockDeleteSalle,
  },
}));

import app from '../src/index';

describe('Salle endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /getSallesData', () => {
    it('returns list of salles on success', async () => {
      const salles = [
        {
          id: '1',
          nom: 'Salle 101',
          nom_complet: 'Salle 101 - Bâtiment A',
          type_principal: 'Cours',
          types_secondaires: ['Projet'],
          capacite: 30,
          etage: 1,
          description: 'Desc',
          utilisable: true,
        },
      ];
      mockGetSalles.mockResolvedValue(salles);

      const res = await request(app).get('/getSallesData').expect(200);
      expect(res.body).toEqual(salles);
      expect(mockGetSalles).toHaveBeenCalled();
    });

    it('returns 500 when service throws', async () => {
      mockGetSalles.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/getSallesData').expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /setSallesData', () => {
    it('creates a salle and returns 201', async () => {
      mockCreateSalle.mockResolvedValue({ id: '42', nom: 'Salle X' });
      const body = {
        nom: 'Salle X',
        nom_complet: 'Salle X - Bâtiment B',
        type_principal: 'Cours',
        types_secondaires: ['Projet'],
        capacite: 20,
        etage: 2,
        utilisable: true,
        description: 'Salle test',
      };

      const res = await request(app).post('/setSallesData').send(body).expect(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('insertedId', '42');
      expect(mockCreateSalle).toHaveBeenCalledWith({
        nom: body.nom,
        nom_complet: body.nom_complet,
        type_principal: body.type_principal,
        types_secondaires: body.types_secondaires,
        etage: Number(body.etage),
        capacite: Number(body.capacite),
        utilisable: body.utilisable,
        description: body.description,
      });
    });

    it('returns 500 when service fails', async () => {
      mockCreateSalle.mockRejectedValue(new Error('insert error'));
      const body = {
        nom: 'Salle X',
        type_principal: 'Cours',
        capacite: 20,
        etage: 2,
        utilisable: true,
        description: 'Salle test'
      };
      const res = await request(app).post('/setSallesData').send(body).expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /updateSalle', () => {
    it('updates a salle and returns 200', async () => {
      mockUpdateSalle.mockResolvedValue(undefined);
      const body = {
        id: '1',
        nom: 'Salle 101',
        nom_complet: 'Salle 101 - Bâtiment A',
        type_principal: 'Cours',
        types_secondaires: ['Projet'],
        capacite: 30,
        etage: 1,
        utilisable: true,
        description: 'Desc'
      };
      const res = await request(app).post('/updateSalle').send(body).expect(200);
      expect(res.body).toHaveProperty('message');
      expect(mockUpdateSalle).toHaveBeenCalledWith({
        id: String(body.id),
        nom: body.nom,
        nom_complet: body.nom_complet,
        type_principal: body.type_principal,
        types_secondaires: body.types_secondaires,
        etage: Number(body.etage),
        capacite: Number(body.capacite),
        utilisable: body.utilisable,
        description: body.description,
      });
    });

    it('returns 400 when validation fails', async () => {
      const body = { id: '1', nom: '', type_principal: 'Cours', capacite: 'NaN', etage: 1, utilisable: true, description: '' };
      const res = await request(app).post('/updateSalle').send(body).expect(400);
      expect(res.body).toHaveProperty('message');
      expect(mockUpdateSalle).not.toHaveBeenCalled();
    });

    it('returns 404 when salle not found', async () => {
      const err: any = new Error('Salle non trouvée');
      err.statusCode = 404;
      mockUpdateSalle.mockRejectedValue(err);
      const body = { id: '999', nom: 'X', type_principal: 'Cours', capacite: 10, etage: 1, utilisable: false, description: 'd' };
      const res = await request(app).post('/updateSalle').send(body).expect(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /deleteSalle', () => {
    it('deletes a salle and returns 200', async () => {
      mockDeleteSalle.mockResolvedValue(undefined);
      const res = await request(app).delete('/deleteSalle').send({ id: '1' }).expect(200);
      expect(res.body).toHaveProperty('message');
      expect(mockDeleteSalle).toHaveBeenCalledWith('1');
    });

    it('returns 400 when id missing', async () => {
      const res = await request(app).delete('/deleteSalle').send({}).expect(400);
      expect(res.body).toHaveProperty('message');
    });

    it('returns 404 when salle not found', async () => {
      const err: any = new Error('Salle non trouvée');
      err.statusCode = 404;
      mockDeleteSalle.mockRejectedValue(err);
      const res = await request(app).delete('/deleteSalle').send({ id: '999' }).expect(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});

