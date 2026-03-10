const request = require('supertest');
const express = require('express');

jest.spyOn(express.application, 'listen').mockImplementation(() => ({
  timeout: 0,
  close: jest.fn(),
}));

// Mocks
const mockGetSpecialites = jest.fn();
const mockGetSpecialiteById = jest.fn();
const mockCreateSpecialite = jest.fn();
const mockUpdateSpecialite = jest.fn();
const mockDeleteSpecialite = jest.fn();

jest.mock('../src/middleware/authJwt', () => ({
  __esModule: true,
  default: { verifyToken: (req: any, res: any, next: any) => next() },
}));

jest.mock('../src/domain/services/specialiteService', () => ({
  __esModule: true,
  specialiteService: {
    getSpecialites: mockGetSpecialites,
    getSpecialiteById: mockGetSpecialiteById,
    createSpecialite: mockCreateSpecialite,
    updateSpecialite: mockUpdateSpecialite,
    deleteSpecialite: mockDeleteSpecialite,
  },
}));

import app from '../src/index';

describe('Specialite endpoints', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('GET /getSpecialites', () => {
    it('returns list on success', async () => {
      const items = [{ id: '1', nom: 'Spec A', effectifs: 20, id_groupe: null, id_promo: null }];
      mockGetSpecialites.mockResolvedValue(items);
      const res = await request(app).get('/getSpecialites').expect(200);
      expect(res.body).toEqual(items);
    });

    it('returns 500 on error', async () => {
      mockGetSpecialites.mockRejectedValue(new Error('DB'));
      const res = await request(app).get('/getSpecialites').expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /getSpecialiteByID/:id', () => {
    it('returns item when found', async () => {
      const item = { id: '1', nom: 'Spec A', effectifs: 20 };
      mockGetSpecialiteById.mockResolvedValue(item);
      const res = await request(app).get('/getSpecialiteByID/1').expect(200);
      expect(res.body).toEqual(item);
    });

    it('returns 404 when not found', async () => {
      const err: any = new Error('non trouvée');
      err.message = 'Spécialité non trouvée';
      mockGetSpecialiteById.mockRejectedValue(err);
      const res = await request(app).get('/getSpecialiteByID/999').expect(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /addSpecialite', () => {
    it('creates and returns 201', async () => {
      mockCreateSpecialite.mockResolvedValue({ id: '42' });
      const body = { nom: 'Spec B', effectifs: 10, id_groupe: null, id_promo: null };
      const res = await request(app).post('/addSpecialite').send(body).expect(201);
      expect(res.body).toHaveProperty('insertedId', '42');
      expect(mockCreateSpecialite).toHaveBeenCalledWith(body);
    });

    it('returns 400 when validation fails', async () => {
      const body = { effectifs: -1 };
      const res = await request(app).post('/addSpecialite').send(body).expect(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 409 on unique violation', async () => {
      const err: any = new Error('uq_specialite_nom_groupe');
      mockCreateSpecialite.mockRejectedValue(err);
      const body = { nom: 'Spec C', effectifs: 5 };
      const res = await request(app).post('/addSpecialite').send(body).expect(409);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /updateSpecialite/:id', () => {
    it('updates and returns 200', async () => {
      mockUpdateSpecialite.mockResolvedValue(undefined);
      const body = { nom: 'Spec Updated', effectifs: 15, id_groupe: null, id_promo: null };
      const res = await request(app).put('/updateSpecialite/1').send(body).expect(200);
      expect(res.body).toHaveProperty('message');
      expect(mockUpdateSpecialite).toHaveBeenCalledWith({ id: '1', id_groupe: null, id_promo: null, nom: body.nom, effectifs: body.effectifs });
    });

    it('returns 404 when not found', async () => {
      const err: any = new Error('non trouvée');
      err.statusCode = 404;
      mockUpdateSpecialite.mockRejectedValue(err);
      const body = { nom: 'X', effectifs: 1 };
      const res = await request(app).put('/updateSpecialite/999').send(body).expect(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /deleteSpecialite/:id', () => {
    it('deletes and returns 200', async () => {
      mockDeleteSpecialite.mockResolvedValue(undefined);
      const res = await request(app).delete('/deleteSpecialite/1').expect(200);
      expect(res.body).toHaveProperty('message');
      expect(mockDeleteSpecialite).toHaveBeenCalledWith('1');
    });

    it('returns 404 when not found', async () => {
      const err: any = new Error('non trouvée');
      err.statusCode = 404;
      mockDeleteSpecialite.mockRejectedValue(err);
      const res = await request(app).delete('/deleteSpecialite/999').expect(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});

